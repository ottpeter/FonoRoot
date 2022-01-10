use crate::*;
use near_sdk::{ext_contract, Gas};

const GAS_FOR_NFT_APPROVE: Gas = Gas(10_000_000_000_000);
const NO_DEPOSIT: Balance = 0;

pub trait NonFungibleTokenCore {
    fn nft_approve(&mut self, token_id: TokenId, account_id: AccountId, msg: Option<String>);

	fn nft_is_approved(
        &self,
        token_id: TokenId,
        approved_account_id: AccountId,
        approval_id: Option<u64>,
    ) -> bool;

    fn nft_revoke(&mut self, token_id: TokenId, account_id: AccountId);

    fn nft_revoke_all(&mut self, token_id: TokenId);
}

#[ext_contract(ext_non_fungible_approval_receiver)]
trait NonFungibleTokenApprovalsReceiver {
    //cross contract call to an external contract that is initiated during nft_approve
    fn nft_on_approve(
        &mut self,
        token_id: TokenId,
        owner_id: AccountId,
        approval_id: u64,
        msg: String,
    );
}

#[near_bindgen]
impl NonFungibleTokenCore for Contract {
    #[payable]
    fn nft_approve(&mut self, token_id: TokenId, account_id: AccountId, msg: Option<String>) {
        assert_at_least_one_yocto();

        let mut token = self.tokens_by_id.get(&token_id).expect("No token");

        assert_eq!(
            &env::predecessor_account_id(),
            &token.owner_id,
            "Predecessor must be the token owner."
        );

        let approval_id: u64 = token.next_approval_id;

        let is_new_approval = token
            .approved_account_ids                                 // Insert returns none if the key was not present
            .insert(account_id.clone(), approval_id)
            .is_none();                                           // If the key was not present, .is_none() will return true so it is a new approval.

        let storage_used = if is_new_approval {
            bytes_for_approved_account_id(&account_id)
        } else {
            0
        };

        token.next_approval_id += 1;
        self.tokens_by_id.insert(&token_id, &token);

        refund_deposit(storage_used);

        //if some message was passed into the function, we initiate a cross contract call on the
        //account we're giving access to. 
        if let Some(msg) = msg {
            ext_non_fungible_approval_receiver::nft_on_approve(
                token_id,
                token.owner_id,
                approval_id,
                msg,
                account_id,                                       // Contract account we're calling
                NO_DEPOSIT,                                       //NEAR deposit we attach to the call
                env::prepaid_gas() - GAS_FOR_NFT_APPROVE,         //GAS we're attaching
            )
            .as_return();                                         // Returning this promise
        }
    }

    //check if the passed in account has access to approve the token ID
	fn nft_is_approved(
        &self,
        token_id: TokenId,
        approved_account_id: AccountId,
        approval_id: Option<u64>,
    ) -> bool {
        let token = self.tokens_by_id.get(&token_id).expect("No token");
        let approval = token.approved_account_ids.get(&approved_account_id);
 
        if let Some(approval) = approval {
            if let Some(approval_id) = approval_id {
                approval_id == *approval                          // Return true if passed in approval ID matches actual approval ID
         } else {
             true                                                 // If there was no approval ID passed in, return true
         }
     } else {
         false                                                    // No approval ID found, return false
     }
    }

    #[payable]
    fn nft_revoke(&mut self, token_id: TokenId, account_id: AccountId) {
        assert_one_yocto();
        let mut token = self.tokens_by_id.get(&token_id).expect("No token");

        let predecessor_account_id = env::predecessor_account_id();
        assert_eq!(&predecessor_account_id, &token.owner_id);

        if token
            .approved_account_ids
            .remove(&account_id)
            .is_some()
        {
            refund_approved_account_ids_iter(predecessor_account_id, [account_id].iter());
            self.tokens_by_id.insert(&token_id, &token);
        }
    }

    #[payable]
    fn nft_revoke_all(&mut self, token_id: TokenId) {
        assert_one_yocto();

        let mut token = self.tokens_by_id.get(&token_id).expect("No token");
        let predecessor_account_id = env::predecessor_account_id();
        assert_eq!(&predecessor_account_id, &token.owner_id);

        if !token.approved_account_ids.is_empty() {
            refund_approved_account_ids(predecessor_account_id, &token.approved_account_ids);
            token.approved_account_ids.clear();
            self.tokens_by_id.insert(&token_id, &token);
        }
    }
}