use crate::*;

/// External contract calls

// Initiate a cross contract call to the nft contract. This will transfer the token to the buyer and return
// a payout object used for the market to distribute funds to the appropriate accounts.
#[ext_contract(ext_contract)]
trait ExtContract {
    fn nft_transfer_payout(
        &mut self,
        receiver_id: AccountId,                                     // Purchaser (person to transfer the NFT to)
        token_id: TokenId,                                          // Token ID to transfer
        approval_id: u64,                                           // Market contract's approval ID in order to transfer the token on behalf of the owner
        memo: String,
        balance: U128,                                              // The price that the token was purchased for. This will be used in conjunction with the royalty percentages.
		    max_len_payout: u32,                                        // The maximum amount of accounts the market can payout at once (this is limited by GAS)
    );
}