import { connect, Contract, keyStores, WalletConnection, utils } from 'near-api-js';
const CryptoJS = require('crypto-js');;
import getConfig from './config';

const nearConfig = getConfig(process.env.NODE_ENV || 'development');
const contractAccount = process.env.CONTRACT_NAME || 'dev-1643218536025-85404878099863';

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  window.walletConnection = new WalletConnection(near)  
  window.accountId = /*'exp1.' +*/  window.walletConnection.getAccountId()                                // Getting the Account ID. If still unauthorized, it's just empty string

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['nft_metadata', 'nft_token', 'nft_tokens_for_owner', 'nft_tokens', 'get_crust_key', 'get_next_buyable'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['new_default_meta', 'new', 'mint_root', 'set_crust_key', 'buy_nft_from_vault'],
  })
}

export function mintRootNFT(title, desc, imageCID, imageHash, musicCID, musicHash, price) {
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
        original_price: "0",                                       // The RootNFT will be transfered to Owner (for free)
        instance_nounce: 0,                                        // Mandatory
        generation: 1,                                             // RootNFT is the first generation
      }),
      reference: null,                                             // URL to an off-chain JSON file with more info.
      reference_hash: null                                         // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
    },
    children_price: utils.format.parseNearAmount(price),           // Price for the next 2 NFTs (children). This will be their original_price
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

export async function buyNFTfromVault(tokenId, price, newPrice) {
  const accountId = window.accountId;
  const args = {
    token_id: tokenId,
    new_price: newPrice
  };
  //const gas = 100_000_000_000_000;
  const gas = 200_000_000_000_000;
  const amount = /*price +*/ utils.format.parseNearAmount("0.05");
  //const price = 50000000000000000000000 + parseInt(price);
  
  await window.contract.buy_nft_from_vault(args, gas, amount)
    .then((result) => console.log("Buy-result: ", result))
    .catch((err) => console.error("Error during buy-from-Vault: ", err));
}

export async function getBuyableTokens() {
  let rootIDs = null;
  let inVault = null;

  console.log(window.accountId)
  console.log(contractAccount)
  const options = {
    limit: 999_999,
  }

  await window.contract.nft_tokens(options)
    .then((response) => {                                          
      inVault = response.filter((nft) => nft.owner_id === contractAccount);
      rootIDs = inVault.map((nft) => {                             // First we make a list of the NFTs that are in the Vault
        const pos = nft.token_id.lastIndexOf("-");
        return nft.token_id.substr(0, pos);
      });
      rootIDs = [...new Set(rootIDs)];                             // IDs of the RootNFTs which has children in the Vault
    })
    .catch((err) => console.error(err))
    
    const nextNFTs = await Promise.all(rootIDs.map(async (id) => { // We get the next buyable NFT for each root (lowest generation)
      const result = await getNextBuyableInstance(id);
      return result;
    }))
    const finalRes = nextNFTs.map((id) => inVault.find((nft) => {
      return nft.token_id === id;
    }))
    console.log(finalRes)
    return finalRes;                                               // Results will be array of NFT objects
}

export async function getNextBuyableInstance(rootId) {
  let nextId = null;
  const args = {
    root_id: rootId
  }

  await window.contract.get_next_buyable(args)
    .then((result) => nextId = result)
    .catch((err) => console.error(err));

  return nextId;
}

export async function getBalance() {
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))
  const account = await near.account(window.accountId);
  const yocto =  await account.getAccountBalance();
  return utils.format.formatNearAmount(yocto.available);
}

export function logout() {
  window.walletConnection.signOut()
  window.location.replace(window.location.origin + window.location.pathname)               // reload page
}

export function login() {
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

