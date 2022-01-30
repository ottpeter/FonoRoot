use crate::*;

#[near_bindgen]
impl Contract {
    /// Buy an NFT from the Vault (the contract). Only the next highest level NFT can be purchased (e.g. gen-2, not gen-5)
    #[payable]
    pub fn buy_nft_from_vault(&mut self, token_id: TokenId, new_price: SalePriceInYoctoNear) -> () {
        env::log_str(&"Start of buy_nft_from_vault".to_string());
        let the_token = self.tokens_by_id.get(&token_id.to_string()).unwrap();
        let the_meta = self.token_metadata_by_id.get(&token_id.to_string()).unwrap();
        let the_extra: Extra = serde_json::from_str(&the_meta.extra.unwrap()).unwrap();
        
        assert_eq!(                                               // Assert if the NFT is in the Vault. 
            the_token.owner_id, 
            env::current_account_id(), 
            "Token must be owned by Vault"
        );

        /*assert_eq!(the_extra.original_price, U128(env::attached_deposit()), "Must send the exact amount");*/
        let test: U128 = the_extra.original_price;
        if u128::from(test) > env::attached_deposit().into() {
            env::panic_str("Must send enough NEAR");
        }
        
        
        let root_id = self.get_root(token_id.clone());            // root could be calculated with string manipulation as well.
        assert_eq!(                                               // Assert that this is the next one in line
            &self.get_next_buyable(root_id.clone()), 
            &token_id, 
            "This is not the token that should be bought next."
        );

        self.internal_transfer(                                   // Transfer the NFT from Vault to the new owner
            &env::current_account_id(), 
            &env::signer_account_id(), 
            &token_id, 
            None,                                                 // No approval ID
            None                                                  // No memo
        );

        self.create_children(
            root_id, 
            token_id, 
            new_price, 
            None
        );

        env::log_str(&"End of buy_nft_from_vault".to_string());
        ()                                                       // We haven't decided on return value
    }
}