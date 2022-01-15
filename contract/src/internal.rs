use crate::*;
use near_sdk::{CryptoHash};
use std::mem::size_of;


// Used to generate unique prefix in our storage collections to avoid data collisions
pub(crate) fn hash_account_id(account_id: &AccountId) -> CryptoHash {
    let mut hash = CryptoHash::default();
    hash.copy_from_slice(&env::sha256(account_id.as_bytes()));
    hash
}

pub(crate) fn assert_one_yocto() {
    assert_eq!(
        env::attached_deposit(),
        1,
        "Requires attached deposit of exactly 1 yoctoNEAR",
    )
}

pub(crate) fn assert_at_least_one_yocto() {
    assert!(
        env::attached_deposit() >= 1,
        "Requires attached deposit of at least 1 yoctoNEAR",
    )
}

// Calculate how many bytes the account ID is taking up
pub(crate) fn bytes_for_approved_account_id(account_id: &AccountId) -> u64 {
    account_id.as_str().len() as u64 + 4 + size_of::<u64>() as u64                          // The extra 4 bytes are coming from Borsh serialization to store the length of the string.
}

pub(crate) fn refund_approved_account_ids_iter<'a, I>(
    account_id: AccountId,
    approved_account_ids: I,                                                                // The approved account IDs must be passed in as an iterator
) -> Promise
where
    I: Iterator<Item = &'a AccountId>,
{
    let storage_released: u64 = approved_account_ids.map(bytes_for_approved_account_id).sum();
    Promise::new(account_id).transfer(Balance::from(storage_released) * env::storage_byte_cost())
}

// Get royalty amount from percentage and total amount. Currently 0.01% is minimum that can be set.
pub(crate) fn royalty_to_payout(royalty_percentage: u32, amount_to_pay: Balance) -> U128 {
    U128(royalty_percentage as u128 * amount_to_pay / 10_000u128)
}

pub(crate) fn refund_approved_account_ids(
    account_id: AccountId,
    approved_account_ids: &HashMap<AccountId, u64>,
) -> Promise {
    refund_approved_account_ids_iter(account_id, approved_account_ids.keys())
}

pub(crate) fn refund_deposit(storage_used: u64) {
    let required_cost = env::storage_byte_cost() * Balance::from(storage_used);
    let attached_deposit = env::attached_deposit();

    assert!(
        required_cost <= attached_deposit,
        "Must attach {} yoctoNEAR to cover storage",
        required_cost,
    );

    let refund = attached_deposit - required_cost;

    if refund > 1 {
        Promise::new(env::predecessor_account_id()).transfer(refund);
    }
}

impl Contract {
    pub(crate) fn internal_add_token_to_owner(
        &mut self,
        account_id: &AccountId,
        token_id: &TokenId,
    ) {
        let mut tokens_set = self.tokens_per_owner.get(account_id).unwrap_or_else(|| {
            UnorderedSet::new(                                                              // If the account doesn't have any tokens, we create a new unordered set
                StorageKey::TokenPerOwnerInner {
                    account_id_hash: hash_account_id(&account_id),
                }
                .try_to_vec()
                .unwrap(),
            )
        });

        tokens_set.insert(token_id);
        self.tokens_per_owner.insert(account_id, &tokens_set);
    }

    pub(crate) fn internal_remove_token_from_owner(
        &mut self,
        account_id: &AccountId,
        token_id: &TokenId,
    ) {
        let mut tokens_set = self                                                           // We get the set of tokens that the owner has
            .tokens_per_owner
            .get(account_id)
            .expect("Token should be owned by the sender");

        tokens_set.remove(token_id);                                                        // Remove the token

        if tokens_set.is_empty() {
            self.tokens_per_owner.remove(account_id);
        } else {
            self.tokens_per_owner.insert(account_id, &tokens_set);
        }
    }

    pub(crate) fn internal_transfer(
        &mut self,
        sender_id: &AccountId,
        receiver_id: &AccountId,
        token_id: &TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) -> Token {
        // !! We would have to check somewhere in internal_transfer that the token is moving from Vault to user
        let token = self.tokens_by_id.get(token_id).expect("No token");
  
        if sender_id != &token.owner_id {
            if !token.approved_account_ids.contains_key(sender_id) {                        // Check if sender is approved
                env::panic_str("Unauthorized");
            }
        
            if let Some(enforced_approval_id) = approval_id {
                let actual_approval_id = token
                    .approved_account_ids
                    .get(sender_id)
                    .expect("Sender is not approved account");
                assert_eq!(
                    actual_approval_id, &enforced_approval_id,
                    "The actual approval_id {} is different from the given approval_id {}",
                    actual_approval_id, enforced_approval_id,
                );
            }
        }
        
        assert_ne!(
            &token.owner_id, receiver_id,
            "The token owner and the receiver should be different"
        );

        self.internal_remove_token_from_owner(&token.owner_id, token_id);                   // Moving the token
        self.internal_add_token_to_owner(receiver_id, token_id);

        let new_token = Token {
            owner_id: receiver_id.clone(),
            approved_account_ids: Default::default(),                                       // We reset the approval account ids
            next_approval_id: token.next_approval_id,
            royalty: token.royalty.clone(),
        };
        self.tokens_by_id.insert(token_id, &new_token);

        if let Some(memo) = memo.as_ref() {                                                 // If there was some memo attached, we log it. 
            env::log_str(&format!("Memo: {}", memo).to_string());
        }

        let mut authorized_id = None;
        if approval_id.is_some() {
            authorized_id = Some(sender_id.to_string());
        }

        let nft_transfer_log: EventLog = EventLog {                                         // Construct the transfer log as per the events standard.
            standard: NFT_STANDARD_NAME.to_string(),
            version: NFT_METADATA_SPEC.to_string(),
            event: EventLogVariant::NftTransfer(vec![NftTransferLog {
                authorized_id,
                old_owner_id: token.owner_id.to_string(),
                new_owner_id: receiver_id.to_string(),
                token_ids: vec![token_id.to_string()],
                memo,
            }]),
        };

        if sender_id.to_string() == env::current_account_id().to_string() {                 // If this is a transfer from Vault to user, create 2 new NFTs
            // We should be sure that this is happening for the first time, this can not run multiple times. This is not done yet.
            // we need to loop to get root
            //self.create_children(token_id.to_string(), Some(HashMap::new()));
        }

        env::log_str(&nft_transfer_log.to_string());                                        // Log the serialized json.

        token
    }
} 