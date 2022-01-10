use crate::*;
use near_sdk::{ext_contract, log, Gas, PromiseResult};

const GAS_FOR_RESOLVE_TRANSFER: Gas = Gas(10_000_000_000_000);
const GAS_FOR_NFT_TRANSFER_CALL: Gas = Gas(25_000_000_000_000 + GAS_FOR_RESOLVE_TRANSFER.0);
const MIN_GAS_FOR_NFT_TRANSFER_CALL: Gas = Gas(100_000_000_000_000);
const NO_DEPOSIT: Balance = 0;

// Here are the functions that will let us transfer NFTs between users.

pub trait NonFungibleTokenCore {
    // Transfers an NFT to a receiver ID
    fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: u64,
        memo: Option<String>,
    );

    // Transfers an NFT to a receiver and calls a function on the receiver ID's contract
    /// Returns `true` if the token was transferred from the sender's account.
    fn nft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: u64,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<bool>;

    // Get information about the NFT token passed in
    fn nft_token(&self, token_id: TokenId) -> Option<JsonToken>;
}

#[ext_contract(ext_non_fungible_token_receiver)]
trait NonFungibleTokenReceiver {
    // Method stored on the receiver contract that is called via cross contract call when nft_transfer_call is called
    /// Returns `true` if the token should be returned back to the sender.
    fn nft_on_transfer(
        &mut self,
        sender_id: AccountId,
        previous_owner_id: AccountId,
        token_id: TokenId,
        msg: String,
    ) -> Promise;
}

#[ext_contract(ext_self)]
trait NonFungibleTokenResolver {
    /*
        resolves the promise of the cross contract call to the receiver contract
        this is stored on THIS contract and is meant to analyze what happened in the cross contract call when nft_on_transfer was called
        as part of the nft_transfer_call method
    */
    fn nft_resolve_transfer(
        &mut self,
        authorized_id: Option<String>,
        owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        approved_account_ids: HashMap<AccountId, u64>,
        memo: Option<String>,
    ) -> bool;
}

/*
    resolves the promise of the cross contract call to the receiver contract
    this is stored on THIS contract and is meant to analyze what happened in the cross contract call when nft_on_transfer was called
    as part of the nft_transfer_call method
*/ 
trait NonFungibleTokenResolver {
    fn nft_resolve_transfer(
        &mut self,
        authorized_id: Option<String>,
        owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        approved_account_ids: HashMap<AccountId, u64>,
        memo: Option<String>,
    ) -> bool;
}

#[near_bindgen]
impl NonFungibleTokenCore for Contract {
    #[payable]
    fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: u64,
        memo: Option<String>,
    ) {
        assert_one_yocto();                                                                 // Assert that the user attached exactly 1 yoctoNEAR. This is for security and so that the user will be redirected to the NEAR wallet. 
        let sender_id = env::predecessor_account_id();                                      // Get the sender to transfer the token from the sender to the receiver
    
        let previous_token = self.internal_transfer(
            &sender_id,
            &receiver_id,
            &token_id,
            Some(approval_id),
            memo,
        );

        refund_approved_account_ids(                                                        // We refund the owner for releasing the storage used up by the approved account IDs
            previous_token.owner_id.clone(),
            &previous_token.approved_account_ids,
        );
    }

    #[payable]
    fn nft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: u64,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<bool> {
        assert_one_yocto();
        let sender_id = env::predecessor_account_id();
    
        let previous_token = self.internal_transfer(                                        // Transfer the token and get the previous token object
            &sender_id,
            &receiver_id,
            &token_id,
            Some(approval_id),
            memo.clone(),
        );
    
        let mut authorized_id = None; 
        if sender_id != previous_token.owner_id {
            authorized_id = Some(sender_id.to_string());
        }

        ext_non_fungible_token_receiver::nft_on_transfer(
            sender_id,
            previous_token.owner_id.clone(),
            token_id.clone(),
            msg,
            receiver_id.clone(),                                                            // Contract account to make the call to
            NO_DEPOSIT,                                                                     // Attached deposit
            env::prepaid_gas() - GAS_FOR_NFT_TRANSFER_CALL,                                 // Attached GAS
        )
        .then(ext_self::nft_resolve_transfer(                                               // Resolve the promise and call nft_resolve_transfer on our own contract
            authorized_id,
            previous_token.owner_id,
            receiver_id,
            token_id,
            previous_token.approved_account_ids,
            memo,
            env::current_account_id(),                                                      // Contract account to make the call to
            NO_DEPOSIT,                                                                     // Attached deposit
            GAS_FOR_RESOLVE_TRANSFER,                                                       // GAS attached to the call
        )).into()
    }

    fn nft_token(&self, token_id: TokenId) -> Option<JsonToken> {
        if let Some(token) = self.tokens_by_id.get(&token_id) {
            let metadata = self.token_metadata_by_id.get(&token_id).unwrap();
            Some(JsonToken {
                token_id,
                owner_id: token.owner_id,
                metadata,
                approved_account_ids: token.approved_account_ids,
                royalty: token.royalty,
            })
        } else { 
            // If there wasn't a token ID in the tokens_by_id collection, we return None
            None
        }
    }
}

#[near_bindgen]
impl NonFungibleTokenResolver for Contract {
    // Resolves the cross contract call when calling nft_on_transfer in the nft_transfer_call method
    // Returns true if the token was successfully transferred to the receiver_id
    #[private]
    fn nft_resolve_transfer(
        &mut self,
        authorized_id: Option<String>,
        owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        approved_account_ids: HashMap<AccountId, u64>,
        memo: Option<String>,
    ) -> bool {        
        if let PromiseResult::Successful(value) = env::promise_result(0) {                  // Whether receiver wants to return token back to the sender, based on `nft_on_transfer` call result.
            if let Ok(return_token) = near_sdk::serde_json::from_slice::<bool>(&value) {    //As per the standard, the nft_on_transfer should return whether we should return the token to it's owner or not
                if !return_token {
                    refund_approved_account_ids(owner_id, &approved_account_ids);
                    return true;
                }
            }
        }

        let mut token = if let Some(token) = self.tokens_by_id.get(&token_id) {
            if token.owner_id != receiver_id {
                refund_approved_account_ids(owner_id, &approved_account_ids);
                return true;
            }
            token
        } else {
            refund_approved_account_ids(owner_id, &approved_account_ids);
            return true;
        };
        
        self.internal_remove_token_from_owner(&receiver_id.clone(), &token_id);             // We remove the token from the receiver
        self.internal_add_token_to_owner(&owner_id, &token_id);                             // We add the token to the original owner

        token.owner_id = owner_id.clone();                                                  // We change the token struct's owner to be the original owner 

        refund_approved_account_ids(receiver_id.clone(), &token.approved_account_ids);
        token.approved_account_ids = approved_account_ids;                                  // Reset the approved account IDs to what they were before the transfer

        self.tokens_by_id.insert(&token_id, &token);                                        // We inset the token back into the tokens_by_id collection

        let nft_transfer_log: EventLog = EventLog {                                         // Reverted
            standard: NFT_STANDARD_NAME.to_string(),
            version: NFT_METADATA_SPEC.to_string(),
            event: EventLogVariant::NftTransfer(vec![NftTransferLog {
                authorized_id,
                old_owner_id: receiver_id.to_string(),
                new_owner_id: owner_id.to_string(),
                token_ids: vec![token_id.to_string()],
                memo,
            }]),
        };

        env::log_str(&nft_transfer_log.to_string());                                        // Do the logging

        false
    }
}
