import { connect, Contract, keyStores, WalletConnection, utils } from 'near-api-js'
import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  window.walletConnection = new WalletConnection(near)  
  window.accountId = /*'exp1.' +*/  window.walletConnection.getAccountId()                                // Getting the Account ID. If still unauthorized, it's just empty string

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['nft_metadata', 'nft_token', 'nft_tokens_for_owner', 'nft_tokens'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['new_default_meta', 'new', 'mint_root'],
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

export function logout() {
  window.walletConnection.signOut()
  window.location.replace(window.location.origin + window.location.pathname)               // reload page
}

export function login() {
  window.walletConnection.requestSignIn(nearConfig.contractName)
}
