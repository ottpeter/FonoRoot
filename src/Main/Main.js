import React, { useState, useRef } from 'react';
import { getBuyableTokens, login, logout } from '../utils';
import 'regenerator-runtime/runtime';
import Globe from 'react-globe.gl';
import countriesGeo from "../assets/countries.json";
import TokenModal from './TokenModal';
import test from '../assets/play.svg';
import clickSoundOne from '../assets/click.mp3';


export default function Main({newAction, openGuestBook, setGuestBook, configObj}) {
  const [nftList, setNftList] = React.useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [fadeOutEffect, setFadeOutEffect] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [image, setImage] = useState(null);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(1);
  const globeEl = useRef();  
  const transitionMs = 3000;
  const clickSound = new Audio(clickSoundOne);
  
  const coordList = [
    [-20.1619400, 57.4988900, "Port Louis"],
    [43.6529, -79.3849, "Toronto"],
    [49.2609, -123.1139, "Vancouver"],
    [-6.173292, 106.841036, "Jakarta"],
    [1.351616, 103.808053, "Singapore"],
    [13.75, 100.51667, "Bangkok"],
    [22.346578, 114.135442, "Hong Kong"],
    [3.1412000, 101.6865300, "Kuala Lumpur"],
    [12.97194, 77.59369, "Bangalore"],
    [39.905, 116.39139, "Beijing"],
    [51.50722, -0.1275, "London"],
    [47.90771, 106.88324, "Ulaanbaatar"],
    [-18.91368, 47.53613, "Antananarivo"]
  ];
  
  function changeCenter([x, y]) {
    globeEl.current.pointOfView({
      lat: x,
      lng: y,
      altitude: 2,
    }, transitionMs)
  }

  React.useEffect(async () => {    
    const urlParams = window.location.search;
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?")+1);
    history.pushState(null, "Home", href + "");
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

  async function nftClicked(nftIndex) {
    if (openModal) {
      setOpenModal(false);
    }
    clickSound.play();
    setSelectedNFT(nftIndex);
    changeCenter(coordList[nftIndex]);
    loadImage(nftList[nftIndex].metadata);
    setTimeout(() => setOpenModal(true), transitionMs);
  }

  // We are prefetching the image for faster loading
  function loadImage(metadata) {
    // SHA VERIFICATION SHOULD HAPPEN SOMEWHERE
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ipfs.io/ipfs/" + metadata.media);
    xhr.responseType = "blob";
    xhr.onload = function() {
      let blob = xhr.response;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function(e) {
        setImage(e.target.result);
      }
    }
    xhr.send();
  }

  /** For globe rotation, we are not using it because it will slow it down
  React.useEffect(() => {
    if (globeEl.current) {
      console.log("globeEl.current", globeEl.current.controls());
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = autoRotateSpeed;
      console.log("globeEl: ", globeEl)
      console.log("current: ", globeEl.current.pointOfView())
    }
  }, [globeEl.current])
   */

  const testData = [
    {
      labelLat: coordList[0][0],
      labelLng: coordList[0][1],
      labelText: "Hello"
    }, {
      labelLat: coordList[1][0],
      labelLng: coordList[1][1],
      labelText: "World"
    }, {
      labelLat: coordList[2][0],
      labelLng: coordList[2][1],
      labelText: ":)"
    }, {
      labelLat: 10,
      labelLng: 0,
      labelLabel: "<p>Hello World!:)</p>"
    }
  ]
 
  return (
    <main>
      {openModal && (
        <TokenModal 
          openModal={openModal}
          id={nftList[selectedNFT].token_id}
          owner={nftList[selectedNFT].owner}
          metadata={nftList[selectedNFT].metadata}
          newAction={newAction}
          image={image}
          setOpenModal={setOpenModal}
          test={test}
          key={selectedNFT}
          fadeOut={fadeOutEffect}
        />
      )}

      <div id="globeContainer">
        {true && <Globe 
          ref={globeEl}
          globeImageUrl={"//unpkg.com/three-globe/example/img/earth-dark.jpg"}
          hexPolygonsData={countriesGeo.features}
          hexPolygonResolution={3}
          hexPolygonMargin={0.3}
          backgroundColor={'rgba(255,255,255, 0.0)'}
          hexPolygonColor={() => `#${Math.round(Math.random() * Math.pow(2, 24)).toString(16).padStart(6, '0')}`}
          labelsData={testData}
          labelLat={(exampl) => {
            console.log("example", exampl)
            return exampl.labelLat
          }}
          labelLng={(exampl) => exampl.labelLng}
          labelText={(exampl) => exampl.labelLabel}
          
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
