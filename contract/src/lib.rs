use std::collections::HashMap;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::{Base64VecU8, U128};
//use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, log, near_bindgen, AccountId, Balance, CryptoHash, PanicOnDefault, Promise, PromiseOrValue,
};

use crate::internal::*;
pub use crate::metadata::*;
pub use crate::mint::*;
pub use crate::nft_core::*;
pub use crate::approval::*;
pub use crate::royalty::*;
pub use crate::events::*;
pub use crate::crust::*;
pub use crate::buy::*;
//pub use crate::tests::*;        // probably this is not an independent crate

mod internal;
mod approval; 
mod enumeration; 
mod metadata; 
mod mint; 
mod nft_core; 
mod royalty; 
mod events;
mod crust;
mod buy;

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests;

/// This spec can be treated like a version of the standard.
pub const NFT_METADATA_SPEC: &str = "1.0.0";
/// This is the name of the NFT standard we're using
pub const NFT_STANDARD_NAME: &str = "nep171";

pub type SalePriceInYoctoNear = U128;                                                      // Price in NEAR

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {    
    pub owner_id: AccountId,                                                               // Contract owner. Maybe we will create an admin as well
    pub root_nounce: u128,                                                                 // We will use this for the creation of the `token_id`
    pub tokens_per_owner: LookupMap<AccountId, UnorderedSet<TokenId>>,                     // Keeps track of all the token IDs for a given account
    pub tokens_by_id: LookupMap<TokenId, Token>,                                           // Keeps track of the token struct for a given token ID
    pub token_metadata_by_id: UnorderedMap<TokenId, TokenMetadata>,                        // Keeps track of the token metadata for a given token ID
    pub metadata: LazyOption<NFTContractMetadata>,                                         // Keeps track of the metadata for the contract (not metadata for NFT)
    pub crust_key: String,                                                                 // The encrypted private key for the Crust Network
}

/// Helper structure for keys of the persistent collections.
#[derive(BorshSerialize)]
pub enum StorageKey {
    TokensPerOwner,
    TokenPerOwnerInner { account_id_hash: CryptoHash },
    TokensById,
    TokenMetadataById,
    NFTContractMetadata,
    TokensPerType,
    TokensPerTypeInner { token_type_hash: CryptoHash },
    TokenTypesLocked,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        log!("Default initialization function called.");
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: "nft-1.0.0".to_string(),
                name: "NFT Tutorial Contract Default Name For Development".to_string(),
                symbol: "DEFAULT".to_string(),
                icon: None,
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        log!("Initializing contract instance...");
        let this = Self {
            // Storage keys are simply the prefixes used for the collections. This helps avoid data collision
            tokens_per_owner: LookupMap::new(StorageKey::TokensPerOwner.try_to_vec().unwrap()),
            tokens_by_id: LookupMap::new(StorageKey::TokensById.try_to_vec().unwrap()),
            token_metadata_by_id: UnorderedMap::new(
                StorageKey::TokenMetadataById.try_to_vec().unwrap(),
            ),
            // Set the owner_id field equal to the passed in owner_id. 
            owner_id,
            root_nounce: 0,
            metadata: LazyOption::new(
                StorageKey::NFTContractMetadata.try_to_vec().unwrap(),
                Some(&metadata),
            ),
            crust_key: "".to_string(),
        };

        this
    }
}