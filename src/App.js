import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import { utils } from 'near-api-js'
import './global.css'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  const [msg, setMsg] = React.useState("");
  
  React.useEffect(
    () => {
      if (window.walletConnection.isSignedIn()) {
        // INIT
        // MintRoot
        // Get Root Metadata
        // CreateChildrenFromParent
        // Get Metadata For Given NFT

      }
    },
    []
  )

  function initContract() {
    // This could be 'new' for user provided init
    window.contract.new_default_meta({owner_id: process.env.CONTRACT_NAME})
      .then((msg) => console.log("Initialized! ", msg))
      .catch((err) => console.error(err))
      .finally(() => console.log("end."));
  }

  function mintRoot() {
    console.log("accountId: ", window.accountId);
    console.log("process.env.CONTRACT_NAME: ", process.env.CONTRACT_NAME);
    const root_args = {
      token_id: "22",
      //contract_id: process.env.CONTRACT_NAME,
      receiver_id: window.accountId,
      metadata: {
        title: "HelloWorldNFT",                                      // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
        description: "Example description",                          // free-form description
        //media: "Qm..xyz123",                                         // URL to associated media, preferably to decentralized, content-addressed storage
        //media_hash: "sha2561234",                                    // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
        copies: null,                                                // number of copies of this set of metadata in existence when token was minted.
        issued_at: null,                                             // When token was issued or minted, Unix epoch in milliseconds
        expires_at: null,                                            // When token expires, Unix epoch in milliseconds
        starts_at: null,                                             // When token starts being valid, Unix epoch in milliseconds
        updated_at: null,                                            // When token was last updated, Unix epoch in milliseconds
        extra: null,                                                 // anything extra the NFT wants to store on-chain. Can be stringified JSON.
        reference: null,                                             // URL to an off-chain JSON file with more info.
        reference_hash: null                                         // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
      }
    }
    
    const gas = 100_000_000_000_000;
    const amount = utils.format.parseNearAmount("0.1");

    window.contract.nft_mint(root_args, gas, amount)//mint_root
      .then((msg) => console.log("Success! (mint root)", msg))
      .catch((err) => console.log("error: ", err))
      .finally(() => console.log("end"));
  }

  function getContractMeta() {
    window.contract.nft_metadata()
      .then((msg) => {
        setMsg(JSON.stringify(msg, null, 4));
        console.log("Contract Metadata: ", msg);
      })
      .catch((err) => console.error(err))
      .finally(() => console.log("finally"));
  }

  function getMeta() {
    console.log(window.accountId)
    const options = {
      //account_id: window.accountId,
      //limit: 4294967296,
      token_id: "22",
    }

    window.contract.nft_token(options)
      .then((msg) => {
        setMsg(JSON.stringify(msg, null, 4));
        console.log("Metadata: ", msg);
      })
      .catch((err) => console.error(err))
      .finally(() => console.log("finally"));
  }

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR!</h1>
        <p>
          To make use of the NEAR blockchain, you need to sign in. The button
          below will sign you in using NEAR Wallet.
        </p>
        <p>
          By default, when your app runs in "development" mode, it connects
          to a test network ("testnet") wallet. This works just like the main
          network ("mainnet") wallet, but the NEAR Tokens on testnet aren't
          convertible to other currencies – they're just for testing!
        </p>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    <>
      <button onClick={() => initContract()}>INIT</button>
      <button onClick={() => mintRoot()}>MintRoot</button>
      <button onClick={() => getContractMeta()}>Get Contract Meta</button>
      <button onClick={() => getMeta()}>Get Meta</button>

      <p>{msg}</p>
    </>
  )
}
