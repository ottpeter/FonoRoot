import React from 'react';
import { utils } from 'near-api-js';
import 'regenerator-runtime/runtime';
import Logo from './Logo';
import Notifications from '../Activity/Notifications';
import Wallet from '../Wallet/Wallet';
import Settings from './Settings';
import Help from './Help';


export default function TopMenu({setShowActivity, showActivity, actionHistory, setShowWallet, showWallet}) {
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

/*
<button onClick={() => initContract()}>INIT</button>
<button onClick={() => mintRoot()}>MintRoot</button>
<button onClick={() => getContractMeta()}>Get Contract Meta</button>
<button onClick={() => getMeta("22")}>Get Meta for 22</button>
<button onClick={() => getMeta("220")}>Get Meta for 220</button>
<button onClick={() => getMeta("221")}>Get Meta for 221</button>
<button onClick={() => getList()}>Get List</button>

*/


  return (
    <nav>
      <Logo />
      <Wallet 
        setShowWallet={setShowWallet}
        showWallet={showWallet}
      />
      <Notifications 
        setShowActivity={setShowActivity} 
        showActivity={showActivity}
        actionHistory={actionHistory} 
      />
      <Settings />
      <Help />      
    </nav>
  )
}
