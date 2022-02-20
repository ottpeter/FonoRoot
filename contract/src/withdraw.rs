use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn withdraw(&mut self, amount: SalePriceInYoctoNear) {
        assert_eq!(
          self.admin, 
          env::predecessor_account_id(),
          "Only admin can do that!"
        );

        // It is not possible to withdraw so much funds that the contract won't have enough money for storage, so we are not testing that.

        Promise::new(env::predecessor_account_id()).transfer(u128::from(amount));
    }
}