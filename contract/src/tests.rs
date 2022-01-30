extern crate hex;

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use crate::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{testing_env, log};

    const _STORAGE_COST: SalePriceInYoctoNear = U128(16_420_000_000_000_000_000_000);

    // simple helper function to take a string literal and return a ValidAccountId
    fn to_valid_account(account: &str) -> AccountId {
        //ValidAccountId::try_from(account.to_string()).expect("Invalid account")
        let result: AccountId = AccountId::new_unchecked(account.to_string());
        result
    }

    // part of writing unit tests is setting up a mock context
    // provide a `predecessor` here, it'll modify the default context
    fn get_context() -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(to_valid_account("alice.near"));                     // Caller will be Alice
        builder.signer_account_id(to_valid_account("alice.near"));                          // (the person who interacts with the contract)
        builder.current_account_id(to_valid_account("vault.near"));                         // Owner is Vault
        builder.attached_deposit(50_000_000_000_000_000_000_000);
        builder
    }

    fn get_context_low_deposit() -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(to_valid_account("alice.near"));                     // Caller will be Alice
        builder.signer_account_id(to_valid_account("alice.near"));                          // (the person who interacts with the contract)
        builder.current_account_id(to_valid_account("vault.near"));                         // Owner is Vault
        builder.attached_deposit(10_000_000_000_000_000_000_000);
        builder
    }

    fn test_token_metadata() -> TokenMetadata {
        TokenMetadata {
            title: Some("TestNFT".to_string()),
            description: Some("This is the description".to_string()),
            extra: Some("{\"music_cid\":\"QmU51uX3B44Z4pH2XimaJ6eScRgAzG4XUrKfsz1yWVCo6f\",\"music_hash\":\"OTZlOGViMTQyMTZkMDNhODEzMWVkOGM1NjFhODJhZjI1ZGFmNTc4NmI1M2RlNGUzMDRiMTMzZmUwMTRlYWY4ZA==\",\"original_price\":\"0\",\"instance_nounce\":0,\"generation\":1}".to_string()),
            media: Some("QmYdCeRFUwEEAKpr2y86DyLiAmLEX5m7ZD8qqWfNuvarZf".to_string()),
            media_hash: None,
            copies: None,
            expires_at: None,
            issued_at: None,
            reference: None,
            reference_hash: None,
            starts_at: None,
            updated_at: None
        }
    }

    fn test_json_token_vault(token_metadata: TokenMetadata) -> JsonToken {
        JsonToken {
            token_id: "fono-root-0-0".to_string(),
            owner_id: to_valid_account("vault.near"),
            metadata: token_metadata,
            approved_account_ids: HashMap::new(),
            royalty: HashMap::new(),
        }
    }

    fn test_nft_list() -> Vec<JsonToken> {
        let mut list = Vec::new();
        list.push(JsonToken {
            token_id: "fono-root-0".to_string(),
            owner_id: to_valid_account("carol.near"),
            metadata: test_token_metadata(),
            approved_account_ids: HashMap::new(),
            royalty: HashMap::new(),
        });
        list.push(JsonToken {
            token_id: "fono-root-0-0".to_string(),
            owner_id: to_valid_account("vault.near"),
            metadata: test_token_metadata(),
            approved_account_ids: HashMap::new(),
            royalty: HashMap::new(),
        });
        list.push(JsonToken {
            token_id: "fono-root-0-1".to_string(),
            owner_id: to_valid_account("vault.near"),
            metadata: test_token_metadata(),
            approved_account_ids: HashMap::new(),
            royalty: HashMap::new(),
        });

        list
    }

    #[test]
    fn crust_save_works() {
        // set up the mock context into the testing environment
        let context = get_context();
        testing_env!(context.build());

        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));

        contract.set_crust_key("EXAMPLE_ENCRYPTED_KEY".to_string());
        assert_eq!(
            contract.get_crust_key(),
            "EXAMPLE_ENCRYPTED_KEY".to_string(),
            "ERROR get_crust_key should give EXAMPLE_ENCRYPTED_KEY!"
        )
    }

    #[test]
    fn buy_from_vault_works() {
        let context = get_context();                                                          // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
      
        let token_metadata = test_token_metadata();
        let json_token = test_json_token_vault(token_metadata.clone());
        let mut test_vec = Vec::new();
        test_vec.push(json_token);

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // fono-root-0, fono-root-0-0, fono-root-0-1 should exist at this point
        contract.buy_nft_from_vault("fono-root-0-0".to_string(), U128(100));                  // should buy fono-root-0-0
        
        //log!("For Alice: {:?}", contract.nft_tokens_for_owner(to_valid_account("alice.near"), None, Some(10)));

        // Test if Alice has the NFT that he bought
        assert_eq!(
            contract.nft_tokens_for_owner(to_valid_account("alice.near"), None, Some(10))[0].token_id,
            test_vec[0].token_id,
            "ERROR! alice.near should have the NFT fono-root-0-0!"
        );
    }

    #[test]
    #[should_panic]
    fn buy_from_vault_only_next() {
        let context = get_context();                                                          // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
      
        let token_metadata = test_token_metadata();

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // fono-root-0, fono-root-0-0, fono-root-0-1 should exist at this point
        contract.buy_nft_from_vault("fono-root-0-0".to_string(), U128(100));                  // should buy fono-root-0-0. fono-root-0-2 should exist
        contract.buy_nft_from_vault("fono-root-0-2".to_string(), U128(100));
        log!("This operation should have paniced! (Buy token that is not the current generation)");
    }
  
    #[test]
    #[should_panic]
    fn buy_from_vault_cant_be_lower() {
        let context = get_context_low_deposit();                // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
    
        let token_metadata = test_token_metadata();

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // fono-root-0, fono-root-0-0, fono-root-0-1 should exist at this point
        contract.buy_nft_from_vault("fono-root-0-0".to_string(), U128(100));
        log!("This operation should have paniced! (Attached deposit is too low)")
    }

    #[test]
    #[should_panic]
    fn buy_from_vault_has_to_be_in_vault() {
        let context = get_context();                            // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
  
        let token_metadata = test_token_metadata();

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // fono-root-0, fono-root-0-0, fono-root-0-1 should exist at this point
        contract.buy_nft_from_vault("fono-root-0-0".to_string(), U128(100));
        contract.buy_nft_from_vault("fono-root-0-0".to_string(), U128(100));
        
    }
    
    #[test]
    fn buy_from_vault_exact_exist() {
        let context = get_context();                                                          // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
      
        let token_metadata = test_token_metadata();

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // should create 3 NFTs
        contract.buy_nft_from_vault("fono-root-0-0".to_string(), U128(100));                  // should create 2 NFTs
        contract.buy_nft_from_vault("fono-root-0-1".to_string(), U128(100));                  // should create 2 NFTs

        assert_eq!(
            contract.nft_tokens(None, Some(500)).len(),
            7,
            "At this point, exactly 7 NFTs should exist!"
        );
    }

    #[test]
    fn enumeration_nft_tokens_works() {
        let context = get_context();                                                          // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
      
        let token_metadata = test_token_metadata();

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // should create 3 NFTs

        assert_eq!(
            contract.nft_tokens(None, Some(500)).len(), 
            3, 
            "Length of vector returned from nft_tokens() should be 3!"
        );

        assert_eq!(contract.nft_tokens(None, Some(500))[0].token_id, test_nft_list()[0].token_id, "Returned token_id is not correct!");
        assert_eq!(contract.nft_tokens(None, Some(500))[1].token_id, test_nft_list()[1].token_id, "Returned token_id is not correct!");
        assert_eq!(contract.nft_tokens(None, Some(500))[2].token_id, test_nft_list()[2].token_id, "Returned token_id is not correct!");

        assert_eq!(contract.nft_tokens(None, Some(500))[0].owner_id, test_nft_list()[0].owner_id, "Returned owner_id is not correct!");
        assert_eq!(contract.nft_tokens(None, Some(500))[1].owner_id, test_nft_list()[1].owner_id, "Returned owner_id is not correct!");
        assert_eq!(contract.nft_tokens(None, Some(500))[2].owner_id, test_nft_list()[2].owner_id, "Returned owner_id is not correct!");
    }

    #[test]
    fn enumeration_nft_supply_for_owner_works() {
        let context = get_context();                                                          // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
      
        let token_metadata = test_token_metadata();

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // Carol should have 1 NFT
        contract.buy_nft_from_vault("fono-root-0-0".to_string(), U128(100));                  // Alice bought 1 NFT
        contract.buy_nft_from_vault("fono-root-0-1".to_string(), U128(100));                  // Alice bought 1 more NFT

        assert_eq!(
            contract.nft_supply_for_owner(to_valid_account("carol.near")),
            U128(1),
            "At this point, Carol should have 1 NFT!"
        );

        assert_eq!(
            contract.nft_supply_for_owner(to_valid_account("alice.near")),
            U128(2),
            "At this point Alice should have 2 NFTs!"
        );

        assert_eq!(
            contract.nft_supply_for_owner(to_valid_account("vault.near")),
            U128(4),
            "At this point, there should be 4 NFTs in the Vault!"
        );

        assert_eq!(
            contract.nft_supply_for_owner(to_valid_account("nobody.near")),
            U128(0),
            "At this point, this address shouldn't have any NFTs"
        );
    }

    #[test]
    fn enumeration_nft_tokens_for_owner_works() {
        let context = get_context();                                                          // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
      
        let token_metadata = test_token_metadata();

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // should create 3 NFTs

        assert_eq!(
            contract.nft_tokens_for_owner(to_valid_account("carol.near"), None, Some(500)).len(), 
            1, 
            "Length of vector returned from nft_tokens() should be!"
        );

        assert_eq!(contract.nft_tokens(None, Some(500))[0].token_id, test_nft_list()[0].token_id, "Returned token_id is not correct!");
        assert_eq!(contract.nft_tokens(None, Some(500))[0].owner_id, test_nft_list()[0].owner_id, "Returned owner_id is not correct!");
    }

    #[test]
    fn can_calculate_next_buyable() {
        let context = get_context();                                                          // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner
      
        let token_metadata = test_token_metadata();

        contract.mint_root(token_metadata, to_valid_account("carol.near"), U128(100), None);  // First generation created
        let next_buyable = contract.get_next_buyable("fono-root-0".to_string());
        assert_eq!(next_buyable, "fono-root-0-0", "Next buyable item should be fono-root-0-0!");

        contract.buy_nft_from_vault("fono-root-0-0".to_string(), U128(100));                  // There is still one gen-1 token to buy after this
        let next_buyable = contract.get_next_buyable("fono-root-0".to_string());
        assert_eq!(next_buyable, "fono-root-0-1", "Next buyable item should be fono-root-0-1!");


        contract.buy_nft_from_vault("fono-root-0-1".to_string(), U128(100));                  // Now gen-1 is out, gen-2 is next
        let next_buyable = contract.get_next_buyable("fono-root-0".to_string());
        assert_eq!(next_buyable, "fono-root-0-2", "Next buyable item should be fono-root-0-2!");
    }

    #[test]
    fn get_root_works() {
        let context = get_context();                                                          // Alice is person who interacts
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(to_valid_account("vault.near"));        // Vault is owner

        contract.mint_root(test_token_metadata(), to_valid_account("carol.near"), U128(100), None);
        contract.mint_root(test_token_metadata(), to_valid_account("carol.near"), U128(100), None);
        contract.mint_root(test_token_metadata(), to_valid_account("carol.near"), U128(100), None);

        assert_eq!(contract.get_root("fono-root-0-0".to_string()), "fono-root-0", "Root for this NFT should be fono-root-0!");
        assert_eq!(contract.get_root("fono-root-1-1".to_string()), "fono-root-1", "Root for this NFT should be fono-root-1!");
        assert_eq!(contract.get_root("fono-root-2-0".to_string()), "fono-root-2", "Root for this NFT should be fono-root-2!");
        assert_eq!(contract.get_root("fono-root-0-0".to_string()), "fono-root-0", "Root for this NFT should be fono-root-0!");
    }

    #[test]
    fn sha256_works() {
        let id = to_valid_account("alice.near");
        log!("AccountId {:?}", id.as_bytes());
        log!("String {:?}", "alice.near".as_bytes());
        
        assert_eq!(
            format!("{:?}", hash_account_id(&to_valid_account("alice.near"))),
            format!("{:?}", hex::decode("2DD5DDA540767B3A1AA33544BCBA38042F4DF6DE9BDDB46798B29481C842C558").expect("Decoding failed")),
            "SHA256 value for alice.near is not correct!"
        );
    }
}