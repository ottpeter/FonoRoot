use crate::*;

#[near_bindgen]
impl Contract {
    /// Will save the client-side encrypted key
    ///  * encrypted_key: the key that was encrypted with NEAR private key on client side
    #[payable]
    pub fn set_crust_key(&mut self, encrypted_key: String) {
        assert_eq!(
          self.admin, 
          env::predecessor_account_id(),
          "Only admin can do that!"
        );
        self.crust_key = encrypted_key;
    }

    /// Will send the encrypted key to the client, that will be decrypted with NEAR private key there.
    pub fn get_crust_key(&self) -> String {
        self.crust_key.clone()
    }
}