use crate::*;
use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};


#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize, Clone, Debug)]                                 
#[serde(crate = "near_sdk::serde")]
pub struct GuestBookEntry {
    pub sender: String,
    pub date: String,
    pub message: String
}

#[near_bindgen]
impl Contract {
    /// Adds a new entry to the guestbook. The new entry has 3 fields
    ///  * sender: msg signer
    ///  * date: JavaScript date
    ///  * message: a string with max length of 160
    #[payable]
    pub fn create_guestbook_entry(&mut self, new_entry: GuestBookEntry) {
        let initial_storage_usage = env::storage_usage();                                       // Take note of initial storage usage for refund

        assert_eq!(
            100000000000000000000000,
            u128::from(env::attached_deposit()), 
            "Must send 0.1 NEAR to cover storage!"
        );

        if new_entry.message.len() > 160 {
            env::panic_str("Can not send message that's length is greater than 160 character!");
        }

        let new_entry = GuestBookEntry {                                                        // We will shadow new_entry
          sender: env::predecessor_account_id().to_string(),
          date: new_entry.date,
          message: new_entry.message
        };

        self.guestbook.push(new_entry);                                                         // Saves the new entry

        let required_storage_in_bytes = env::storage_usage() - initial_storage_usage;
        refund_deposit(required_storage_in_bytes, U128(0));                                     // Refund extra amount payed
    }

    /// Gives back `limit` guestbook entries from `from_index`
    pub fn view_guestbook_entries(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<GuestBookEntry> {
        let start = u128::from(from_index.unwrap_or(U128(0)));                                  // Start from `from_index` or 0

        self.guestbook.iter()
                      .skip(start as usize)
                      .take(limit.unwrap_or(0) as usize)
                      .map(|entry| {
                          let temp = GuestBookEntry {
                              sender: entry.sender.clone(),
                              message: entry.message.clone(),
                              date: entry.date.clone(),
                          };
                          temp
                      })
                      .collect()
    }
}