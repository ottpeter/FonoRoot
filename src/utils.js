import { connect, Contract, keyStores, WalletConnection, utils } from 'near-api-js';
const CryptoJS = require('crypto-js');;
import getConfig from './config';

const nearConfig = getConfig(process.env.NODE_ENV || 'development');

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  window.walletConnection = new WalletConnection(near)  
  window.accountId = /*'exp1.' +*/  window.walletConnection.getAccountId()                                // Getting the Account ID. If still unauthorized, it's just empty string

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['nft_metadata', 'nft_token', 'nft_tokens_for_owner', 'nft_tokens', 'get_crust_key'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['new_default_meta', 'new', 'mint_root', 'set_crust_key'],
  })
}

export function mintRootNFT(title, desc, imageCID, imageHash, musicCID, musicHash) {
  const root_args = {
    receiver_id: window.accountId,
    metadata: {
      title: title,                                          
      description: desc,
      media: imageCID,                                             // This is the CID of the NFT image
      media_hash: btoa(imageHash),                                 // This is the SHA256 hash of the NFT image, converted to Base64
      copies: null,                                                // number of copies of this set of metadata in existence when token was minted.
      issued_at: Date.now(),                                       // When token was issued or minted, Unix epoch in milliseconds
      expires_at: null,                                            // When token expires, Unix epoch in milliseconds
      starts_at: null,                                             // When token starts being valid, Unix epoch in milliseconds
      updated_at: null,                                            // When token was last updated, Unix epoch in milliseconds
      extra: JSON.stringify({
        music_cid: musicCID,                                       // This is the CID of the music
        music_hash: btoa(musicHash),                               // This is the SHA256 hash of the music, converted to Base64 
        instance_nounce: 0,                                        // Mandatory
      }),
      reference: null,                                             // URL to an off-chain JSON file with more info.
      reference_hash: null                                         // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
    },
    perpetual_royalties: null
  }

  const gas = 100_000_000_000_000;
  const amount = utils.format.parseNearAmount("0.1");

  window.contract.mint_root(root_args, gas, amount)
    .then((msg) => console.log("Success! (mint root)", msg))
    .catch((err) => console.log("error: ", err))
    .finally(() => console.log("finally()"));
}

export async function setSeed(seed) {
  const accountId = window.accountId;                              // We encrypt the Crust key using the NEAR priv key (has to be owner)
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const keyPair = await keyStore.getKey("testnet", accountId);

  const encryptedKey = CryptoJS.AES.encrypt(seed, keyPair.secretKey).toString();

  window.contract.set_crust_key({encrypted_key: encryptedKey})
    .then((msg) => console.log("The Contract says ", msg))
    .catch((err) => console.error("Error occured while uploading encrypted key:", err));
}


export async function getSeed() {
  const accountId = window.accountId;                              // We decrypt the Crust key using the NEAR priv key (has to be owner)
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const keyPair = await keyStore.getKey("testnet", accountId);
  let encryptedKey = null;

  await window.contract.get_crust_key()
    .then((result) => encryptedKey = result)
    .catch((err) => console.log("Error occured while fetching encrypted key: ", err))
  if (encryptedKey) {
    return CryptoJS.AES.decrypt(encryptedKey, keyPair.secretKey).toString(CryptoJS.enc.Utf8);
  } else {
    return null;                                                   // Error occured while fetching key
  }
}

export function logout() {
  window.walletConnection.signOut()
  window.location.replace(window.location.origin + window.location.pathname)               // reload page
}

export function login() {
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

