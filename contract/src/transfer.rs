use crate::*;

#[near_bindgen]
impl Contract {
    /// Transfers the NFT from the current owner to a new owner
    ///  * token_id: The token that we want to transfer
    ///  * receiver_id: The AccountId of the receiver
    #[payable]
    pub fn transfer_nft(&mut self, token_id: TokenId, receiver_id: AccountId) {
        let initial_storage_usage = env::storage_usage();                                       // Take note of initial storage usage for refund

        assert_eq!(                                                                             // Caller has to own the NFT
            self.tokens_by_id.get(&token_id.to_string()).unwrap().owner_id,
            env::predecessor_account_id(),
            "Only the owner can transfer the token!"
        );

        self.internal_transfer(                                                                 // Transfer the NFT
            &env::predecessor_account_id(),
            &receiver_id,
            &token_id,
            None,
            None
        );

        let mut required_storage_in_bytes = 0;                                                  // It's possible that no extra storage is needed
        if initial_storage_usage < env::storage_usage() {
          required_storage_in_bytes = env::storage_usage() - initial_storage_usage;
        }          
        refund_deposit(required_storage_in_bytes, U128(0));                                     // Refund extra amount payed
    }
}