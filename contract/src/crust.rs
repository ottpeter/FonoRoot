use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn set_crust_key(&mut self, encrypted_key: String) {
        assert_eq!(
          self.admin, 
          env::predecessor_account_id(),
          "Only admin can do that!"
        );
        self.crust_key = encrypted_key;
    }

    pub fn get_crust_key(&self) -> String {
        self.crust_key.clone()
    }
}