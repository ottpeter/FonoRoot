import React from 'react';
import { login, logout } from '../utils';
import { utils } from 'near-api-js';
import Map from "../Map";
import 'regenerator-runtime/runtime';

import getConfig from '../config'
import TokenCard from './TokenCard';
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function Main() {
  const [nftList, setNftList] = React.useState([]);

  const [center, setCenter] = React.useState([0, 0]);

  // Color test
  const [waterColor, setWaterColor] = React.useState("#072A6C");
  const [continentColor, setContinentColor] = React.useState("#FF0000");
  const [lineColor, setLineColor] = React.useState("#0000FF");
  const [markerSize, setMarkerSize] = React.useState(6);
  const [markerColor, setMarkerColor] = React.useState("#FFFF00");

  function changeCenter([x, y]) {
    console.log("changeCenter called");
    console.log("x: ", x);
    console.log("y: ", y);
    setCenter([x, y]);
  }

  React.useEffect(() => {
    console.log(window.accountId)
    console.log(process.env.CONTRACT_NAME)
    const options = {
      limit: 9999,
    }

    window.contract.nft_tokens(options)
      .then((response) => {
        const inVault = response.filter((nft) => nft.owner_id === process.env.CONTRACT_NAME);
        setNftList(inVault);
        console.log("Response: ", response);
        console.log("In Vault: ", inVault)
      })
      .catch((err) => console.error(err))
      .finally(() => console.log("finally"));

    return () => {
      console.log("cleanup");
    }
  }, [])

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
      {nftList.map((nft) => (
        <TokenCard 
          key={nft.token_id}
          id={nft.token_id}
          owner={nft.owner_id}
          metadata={nft.metadata}
        />
      ))}

      <div style={{ textAlign: "center" }}>
        <div style={{ padding: "1rem 0" }}>
          <input type="color" id="waterColor" name="waterColor" value={waterColor} onChange={(e) => setWaterColor(e.target.value)}/> 
          <input type="color" id="continentColor" name="continentColor" value={continentColor} onChange={(e) => setContinentColor(e.target.value)}/> 
          <input type="color" id="lineColor" name="lineColor" value={lineColor} onChange={(e) => setLineColor(e.target.value)}/> 
          <input type="range" id="markerSize" name="markerSize" min="1" max="50" value={markerSize} onChange={(e) => setMarkerSize(e.target.value)}/> 
          <input type="color" id="markerColor" name="markerColor" value={markerColor} onChange={(e) => setMarkerColor(e.target.value)}/> 
          <button
            className="btn"
            onClick={() => changeCenter([-73.9808, 40.7648])}
          >
            {"New York"}
          </button>
          <button
            className="btn"
            onClick={() => changeCenter([-9.13333, 38.71667])}
          >
            {"Lisbon"}
          </button>
          <button
            className="btn"
            onClick={() => changeCenter([19.03991, 47.49801])}
          >
            {"Budapest"}
          </button>
        </div>
        <Map center={center} waterColor={waterColor} continentColor={continentColor} lineColor={lineColor} markerSize={markerSize} markerColor={markerColor}/>
      </div>
    </>
  )
}
