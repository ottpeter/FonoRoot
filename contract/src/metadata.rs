use crate::*;
use near_sdk::serde::{Serialize, Deserialize};
pub type TokenId = String;


#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Payout {
    pub payout: HashMap<AccountId, U128>,
} 

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct NFTContractMetadata {
    pub spec: String,                                             // required, essentially a version like "nft-1.0.0"
    pub name: String,                                             // required, ex. "Mosaics"
    pub symbol: String,                                           // required, ex. "MOSIAC"
    pub icon: Option<String>,                                     // Data URL
    pub base_uri: Option<String>,                                 // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
    pub reference: Option<String>,                                // URL to a JSON file with more info
    pub reference_hash: Option<Base64VecU8>,                      // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenMetadata {
    pub title: Option<String>,                                    // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    pub description: Option<String>,                              // free-form description
    pub media: Option<String>,                                    // URL to associated media, preferably to decentralized, content-addressed storage
    pub media_hash: Option<Base64VecU8>,                          // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    pub copies: Option<u64>,                                      // number of copies of this set of metadata in existence when token was minted.
    pub issued_at: Option<u64>,                                   // When token was issued or minted, Unix epoch in milliseconds
    pub expires_at: Option<u64>,                                  // When token expires, Unix epoch in milliseconds
    pub starts_at: Option<u64>,                                   // When token starts being valid, Unix epoch in milliseconds
    pub updated_at: Option<u64>,                                  // When token was last updated, Unix epoch in milliseconds
    pub extra: Option<String>,                                    // Anything extra the NFT wants to store on-chain. Can be stringified JSON.
    pub reference: Option<String>,                                // URL to an off-chain JSON file with more info.
    pub reference_hash: Option<Base64VecU8>,                      // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Token {
    pub owner_id: AccountId,                                      // Owner of the token
    pub approved_account_ids: HashMap<AccountId, u64>,            // List of approved account IDs that have access to transfer the token. This maps an account ID to an approval ID
    pub next_approval_id: u64,                                    // Next approval ID
    pub royalty: HashMap<AccountId, u32>,                         // Royalties
}

#[derive(Serialize, Deserialize)]                                 
#[serde(crate = "near_sdk::serde")]
pub struct Extra {
    pub music_cid: Option<String>,
    pub music_hash: Option<Base64VecU8>,
    pub parent: Option<TokenId>,
    pub instance_nounce: u32,
    pub generation: u32,
    pub original_price: SalePriceInYoctoNear,
}

#[derive(Serialize, Deserialize, Debug)]                          // This is what we will get on the front-end
#[serde(crate = "near_sdk::serde")]
pub struct JsonToken {
    pub token_id: TokenId,
    pub owner_id: AccountId,
    pub metadata: TokenMetadata,
    pub approved_account_ids: HashMap<AccountId, u64>,
    pub royalty: HashMap<AccountId, u32>,

}

pub trait NonFungibleTokenMetadata {
    fn nft_metadata(&self) -> NFTContractMetadata;                // View call for returning the contract metadata
}

#[near_bindgen]
impl NonFungibleTokenMetadata for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}