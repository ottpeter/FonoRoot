import { connect, Contract, keyStores, WalletConnection } from 'near-api-js'
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
    viewMethods: ['nft_metadata', 'nft_token', 'nft_tokens_for_owner'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['new_default_meta', 'new', 'mint_root'],
  })
}

export function logout() {
  window.walletConnection.signOut()
  window.location.replace(window.location.origin + window.location.pathname)               // reload page
}

export function login() {
  window.walletConnection.requestSignIn(nearConfig.contractName)
}
