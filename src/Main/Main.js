import React, { useState, useRef } from 'react';
import { getBuyableTokens, login, logout } from '../utils';
import 'regenerator-runtime/runtime';
import Globe from 'react-globe.gl';
import countriesGeo from "../assets/countries.json";
const IPFS = require('ipfs-core');


import TokenModal from './TokenModal';
import ChatTest from './ChatTest';

export default function Main({newAction, configObj}) {
  const [ipfsNode, setIpfsNode] = useState(null);
  const [orbitDB, setOrbitDB] = useState(null);
  const [nftList, setNftList] = React.useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [center, setCenter] = React.useState([0, 0]);

  function changeCenter([x, y]) {
    console.log("changeCenter called");
    console.log("x: ", x);
    console.log("y: ", y);
    setCenter([x, y]);
  }

  React.useEffect(async () => {
    const ipfsOptions = { repo : './ipfs-chat', };
    const tempIpfsNode = await IPFS.create(ipfsOptions);
    setIpfsNode(tempIpfsNode);
    /*setOrbitDB(tempOrbitdb);
    // Only run this once
    if (true) {
      const options = {
        // Give write access to everyone
        accessController: {
          write: ['*']
        }
      }
      const db = await tempOrbitdb.log('chat-db', options);
      console.log("db: ", db);
      console.log("addr: ", db.address.toString());
    }*/

    
    const urlParams = window.location.search;
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?"));
    history.pushState(null, "Admin", href + "");
    if (urlParams.includes('errorCode')) {
      newAction({
        errorMsg: "There was an error while processing the transaction!", errorMsgDesc: URLSearchParams.get('errorCode'),
      }); 
    } else if (urlParams.includes('transactionHashes')) {
      newAction({
        successMsg: "Success!", successMsgDesc: "You bought a new NFT!",
      });
    }

    const buyable = await getBuyableTokens();
    console.log("NEXT NFTs: ", buyable);
    setNftList(buyable);
  }, [])


  function nftClicked(nftIndex) {
    setSelectedNFT(nftIndex);
    changeCenter(coordList[nftIndex]);
    setOpenModal(true);
  }


  const coordList = [
    [-73.9808, 40.7648],
    [-9.13333, 38.71667],
    [19.03991, 47.49801]
  ];

  const globeEl = useRef();  
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(1);
  
  React.useEffect(() => {
    if (globeEl.current) {
      console.log("globeEl.current", globeEl.current.controls());
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = autoRotateSpeed;
    }
  }, [globeEl.current])
 
  return (
    <main>
      {openModal && (
        <TokenModal 
          openModal={openModal}
          id={nftList[selectedNFT].token_id}
          owner={nftList[selectedNFT].owner}
          metadata={nftList[selectedNFT].metadata}
          newAction={newAction}
          setOpenModal={setOpenModal}
        />
      )}

      {ipfsNode && orbitDB && <ChatTest ipfs={ipfsNode} orbitDB={orbitDB} />}

      <div id="globeContainer">
        {false && <Globe 
          ref={globeEl}
          globeImageUrl={"//unpkg.com/three-globe/example/img/earth-dark.jpg"}
          hexPolygonsData={countriesGeo.features}
          hexPolygonResolution={3}
          hexPolygonMargin={0.3}
          hexPolygonAltitude={0.05}
          
          hexPolygonColor={() => `#${Math.round(Math.random() * Math.pow(2, 24)).toString(16).padStart(6, '0')}`}
        
        />}
      </div>

      <div id="nftButtonsList" className="nftButtonsList">
        {nftList.map((nft, i) => (
          <button className="nftButton" onClick={() => nftClicked(i)} >
            {nft.metadata.title}
          </button>
        ))}
      </div>

    </main>
  )
}
