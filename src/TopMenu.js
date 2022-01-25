import React from 'react';
import { utils } from 'near-api-js';
import 'regenerator-runtime/runtime';


export default function TopMenu() {
  function initContract() {
    // This could be 'new' for user provided init
    // WE WILL HAVE TO CHANGE THIS TO THE OWNER (or create admin user in lib.rs), BUT NOW THE ASSERT IS TURNED OFF INSTEAD!!
    window.contract.new_default_meta({owner_id: process.env.CONTRACT_NAME || 'dev-1643108238965-30590107738953'})
      .then((msg) => console.log("Initialized! ", msg))
      .catch((err) => console.error(err))
      .finally(() => console.log("end."));
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

  function getMeta(tokenId) {
    console.log(window.accountId)
    const options = {
      token_id: tokenId,
    }

    window.contract.nft_token(options)
      .then((msg) => {
        setMsg(JSON.stringify(msg, null, 4));
        console.log("Metadata: ", msg);
      })
      .catch((err) => console.error(err))
      .finally(() => console.log("finally"));
  }

  function getList() {
    console.log(window.accountId)
    const options = {
      //from_index: "0",
      limit: 999_999,
    }

    window.contract.nft_tokens(options)
      .then((msg) => {
        console.log("List: ", msg);
      })
      .catch((err) => console.error(err))
      .finally(() => console.log("finally"));
  }


  return (
    <nav>
      <button onClick={() => initContract()}>INIT</button>
      <button onClick={() => mintRoot()}>MintRoot</button>
      <button onClick={() => getContractMeta()}>Get Contract Meta</button>
      <button onClick={() => getMeta("22")}>Get Meta for 22</button>
      <button onClick={() => getMeta("220")}>Get Meta for 220</button>
      <button onClick={() => getMeta("221")}>Get Meta for 221</button>
      <button onClick={() => getList()}>Get List</button>
    </nav>
  )
}
