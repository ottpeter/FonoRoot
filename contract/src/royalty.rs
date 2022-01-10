use crate::*;

pub trait NonFungibleTokenCore {
    // Calculates the payout for a token given the passed in balance. This is a view method
    fn nft_payout(&self, token_id: String, balance: U128, max_len_payout: u32) -> Payout;
    
    // Transfers the token to the receiver ID and returns the payout object that should be payed given the passed in balance. 
    fn nft_transfer_payout(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: u64,
        memo: String,
        balance: U128,
        max_len_payout: u32,
    ) -> Payout;
}

#[near_bindgen]
impl NonFungibleTokenCore for Contract {
    fn nft_payout(&self, token_id: String, balance: U128, max_len_payout: u32) -> Payout {
		let token = self.tokens_by_id.get(&token_id).expect("No token");

        let owner_id = token.owner_id;
        let mut total_perpetual = 0;
        let balance_u128 = u128::from(balance);
        let mut payout_object = Payout {
            payout: HashMap::new()
        };
		let royalty = token.royalty;

		assert!(royalty.len() as u32 <= max_len_payout, "Market cannot payout to that many receivers");

		for (k, v) in royalty.iter() {
			let key = k.clone();
			if key != owner_id {
				payout_object.payout.insert(key, royalty_to_payout(*v, balance_u128));
				total_perpetual += *v;
			}
		}

		payout_object.payout.insert(owner_id, royalty_to_payout(10000 - total_perpetual, balance_u128));

		payout_object
	}

    #[payable]
    fn nft_transfer_payout(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: u64,
        memo: String,
        balance: U128,
        max_len_payout: u32,
    ) -> Payout { 
        assert_one_yocto();
        let sender_id = env::predecessor_account_id();
        let previous_token = self.internal_transfer(
            &sender_id,
            &receiver_id,
            &token_id,
            Some(approval_id),
            Some(memo),
        );
  
        refund_approved_account_ids(
            previous_token.owner_id.clone(),
            &previous_token.approved_account_ids,
        );
  
        let owner_id = previous_token.owner_id;
        let mut total_perpetual = 0;
        let balance_u128 = u128::from(balance);
        let mut payout_object = Payout {
            payout: HashMap::new()
        };
        let royalty = previous_token.royalty;
  
        assert!(royalty.len() as u32 <= max_len_payout, "Market cannot payout to that many receivers");
  
        for (k, v) in royalty.iter() {
            let key = k.clone();
            if key != owner_id {
                payout_object.payout.insert(key, royalty_to_payout(*v, balance_u128));
                total_perpetual += *v;
            }
        }
  
        payout_object.payout.insert(owner_id, royalty_to_payout(10000 - total_perpetual, balance_u128));
  
        payout_object
    }
}