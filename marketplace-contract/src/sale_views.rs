use crate::*;

#[near_bindgen]
impl Contract {
    pub fn get_supply_sales(
        &self,
    ) -> U64 {
        U64(self.sales.len())
    }
    
    pub fn get_supply_by_owner_id(                                  // Returns the number of sales for a given account (result is a string) (?)
        &self,
        account_id: AccountId,
    ) -> U64 {
        let by_owner_id = self.by_owner_id.get(&account_id);
        
        if let Some(by_owner_id) = by_owner_id {
            U64(by_owner_id.len())
        } else {
            U64(0)
        }
    }

    pub fn get_sales_by_owner_id(
        &self,
        account_id: AccountId,
        from_index: Option<U128>,
        limit: Option<u64>,
    ) -> Vec<Sale> {
        let by_owner_id = self.by_owner_id.get(&account_id);
        let sales = if let Some(by_owner_id) = by_owner_id {
            by_owner_id
        } else {
            return vec![];
        };
        
        let keys = sales.as_vector();

        let start = u128::from(from_index.unwrap_or(U128(0)));      // Where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        
        keys.iter()
            .skip(start as usize) 
            .take(limit.unwrap_or(0) as usize) 
            .map(|token_id| self.sales.get(&token_id).unwrap())
            .collect()
    }

    pub fn get_supply_by_nft_contract_id(
        &self,
        nft_contract_id: AccountId,
    ) -> U64 {
        let by_nft_contract_id = self.by_nft_contract_id.get(&nft_contract_id);
        
        if let Some(by_nft_contract_id) = by_nft_contract_id {
            U64(by_nft_contract_id.len())
        } else {
            U64(0)
        }
    }

    pub fn get_sales_by_nft_contract_id(
        &self,
        nft_contract_id: AccountId,
        from_index: Option<U128>,
        limit: Option<u64>,
    ) -> Vec<Sale> {
        let by_nft_contract_id = self.by_nft_contract_id.get(&nft_contract_id);
        
        let sales = if let Some(by_nft_contract_id) = by_nft_contract_id {
            by_nft_contract_id
        } else {
            return vec![];
        };

        let keys = sales.as_vector();

        let start = u128::from(from_index.unwrap_or(U128(0)));
        
        keys.iter()
            .skip(start as usize) 
            .take(limit.unwrap_or(0) as usize) 
            .map(|token_id| self.sales.get(&format!("{}{}{}", nft_contract_id, DELIMETER, token_id)).unwrap())
            .collect()
    }

    pub fn get_sale(&self, nft_contract_token: ContractAndTokenId) -> Option<Sale> {
        self.sales.get(&nft_contract_token)
    }
}