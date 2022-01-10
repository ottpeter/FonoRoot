use crate::*;

#[near_bindgen]
impl Contract {
    /// Query for NFT tokens on the contract regardless of the owner using pagination
    pub fn nft_tokens(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<JsonToken> {
        let keys = self.token_metadata_by_id.keys_as_vector();

        let start = u128::from(from_index.unwrap_or(U128(0)));                              // Start from `from_index` or 0

        keys.iter()
            .skip(start as usize) 
            .take(limit.unwrap_or(0) as usize)                                              // Take `limit` elements (or 0)
            .map(|token_id| self.nft_token(token_id.clone()).unwrap())
            .collect()
    }

    /// Get the total supply of NFTs for a given owner (a number)
    pub fn nft_supply_for_owner(
        &self,
        account_id: AccountId,
    ) -> U128 {
        let tokens_for_owner_set = self.tokens_per_owner.get(&account_id);
    
        if let Some(tokens_for_owner_set) = tokens_for_owner_set {
            U128(tokens_for_owner_set.len() as u128)
        } else {
            U128(0)
        }
    }

    /// Query for all the tokens for an owner
    pub fn nft_tokens_for_owner(
        &self,
        account_id: AccountId,
        from_index: Option<U128>,
        limit: Option<u64>,
    ) -> Vec<JsonToken> {
        let tokens_for_owner_set = self.tokens_per_owner.get(&account_id);                 // Get the set of tokens for the passed in owner
        let tokens = if let Some(tokens_for_owner_set) = tokens_for_owner_set {
            tokens_for_owner_set
        } else {
            return vec![];
        };
        let keys = tokens.as_vector();

        let start = u128::from(from_index.unwrap_or(U128(0)));

        keys.iter()
            .skip(start as usize) 
            .take(limit.unwrap_or(0) as usize) 
            .map(|token_id| self.nft_token(token_id.clone()).unwrap())
            .collect()
    }
}