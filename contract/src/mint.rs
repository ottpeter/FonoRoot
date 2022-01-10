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
        perpetual_royalties: Option<HashMap<AccountId, u32>>,
    ) {
        let initial_storage_usage = env::storage_usage();                                   // Take not of initial storage usage for refund
        let mut royalty = HashMap::new();                                                   // Create royalty map to store in the token

        if let Some(perpetual_royalties) = perpetual_royalties {
            assert!(perpetual_royalties.len() < 7, "Cannot add more than 6 perpetual royalty amounts");
    
            for (account, amount) in perpetual_royalties {
                royalty.insert(account, amount);
            }
        }

        let token = Token {
            owner_id: receiver_id,
            approved_account_ids: Default::default(),
            next_approval_id: 0,
            royalty,
        };

        assert!(
            self.tokens_by_id.insert(&token_id, &token).is_none(),
            "Token already exists!"
        );

        self.token_metadata_by_id.insert(&token_id, &metadata);                             // Insert new NFT
        self.internal_add_token_to_owner(&token.owner_id, &token_id);

        let nft_mint_log: EventLog = EventLog {                                             // Construct the mint log as per the events standard.
            standard: NFT_STANDARD_NAME.to_string(),
            version: NFT_METADATA_SPEC.to_string(),
            event: EventLogVariant::NftMint(vec![NftMintLog {
                owner_id: token.owner_id.to_string(),
                token_ids: vec![token_id.to_string()],
                memo: None,
            }]),
        };

        env::log_str(&nft_mint_log.to_string());                                            // Log the serialized json.

        let required_storage_in_bytes = env::storage_usage() - initial_storage_usage;

        refund_deposit(required_storage_in_bytes);                                          // Refund not-used storage
    }
}