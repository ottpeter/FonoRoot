use crate::*;

#[near_bindgen]
impl Contract {
    // We will have more mint functions, we will have something like `MintRoot()` and `CreateChildren()`
    #[payable]
    pub fn nft_mint(
        &mut self,
        token_id: TokenId,
        metadata: TokenMetadata,
        receiver_id: AccountId,
    ) {
        let initial_storage_usage = env::storage_usage();                                   // Take not of initial storage usage for refund

        let token = Token {
            owner_id: receiver_id,
        };

        assert!(
            self.tokens_by_id.insert(&token_id, &token).is_none(),
            "Token already exists!"
        );

        self.token_metadata_by_id.insert(&token_id, &metadata);                             // Insert new NFT
        self.internal_add_token_to_owner(&token.owner_id, &token_id);
        let required_storage_in_bytes = env::storage_usage() - initial_storage_usage;

        refund_deposit(required_storage_in_bytes);                                          // Refund not-used storage
    }
}