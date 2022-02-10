import React, { useState, useRef } from 'react';
import { getBuyableTokens, login, logout } from '../utils';
import { utils } from 'near-api-js';
import Map from "../Map";
import 'regenerator-runtime/runtime';
import Globe from 'react-globe.gl';
import SmallUploader from '../Admin/SmallUploader';
import * as THREE from "three";
import countriesGeo from "../assets/countries.json";


import TokenModal from './TokenModal';

export default function Main({newAction}) {
  const [nftList, setNftList] = React.useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [center, setCenter] = React.useState([0, 0]);

  // Color test
  const [waterColor, setWaterColor] = React.useState("#072A6C");
  const [lineColor, setLineColor] = React.useState("#0000FF");
  const [markerSize, setMarkerSize] = React.useState(6);
  const [markerColor, setMarkerColor] = React.useState("#FFFF00");

  function changeCenter([x, y]) {
    console.log("changeCenter called");
    console.log("x: ", x);
    console.log("y: ", y);
    setCenter([x, y]);
  }

  React.useEffect(async () => {
    const urlParams = window.location.search;
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?"));
    history.pushState(null, "Admin", href + "");
    if (urlParams.includes('errorCode')) {
      newAction({
        errorMsg: "There was an error while processing the transaction!", errorMsgDesc: "errorCode",
      }); 
    } else if (urlParams.includes('transactionHashes')) {
      newAction({
        successMsg: "Success!", successMsgDesc: "You bought a new NFT!",
      });
    }
    
    console.log("geo: ", countriesGeo)
    const jsonified = JSON.parse(countriesGeo);
    console.log("jsoonified: ", jsonified);
    fetch(countriesGeo)
      .then(res => { console.log(res); return res.json()})
      .then((json) => setCountries(json));

    const buyable = await getBuyableTokens();
    console.log("NEXT NFTs: ", buyable);
    setNftList(buyable);
  }, [])


  /* DEMO */
const [countries, setCountries] = React.useState([]);
const [countryColors, setCountryColors] = React.useState(Array(177).fill("#FFFFFF"));
const [colorHistory, setColorHistory] = React.useState(["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]);
const [lastClicked, setLastClicked] = React.useState(0);
const [zoom, setZoom] = React.useState(250);

function pushColor(color) {
  setColorHistory((state) => {
    state.push(color);
    state = state.slice(1, undefined);
    return [...state];
  });
}

function selectCountry(index) {
  pushColor(countryColors[lastClicked]);
  setLastClicked(index);
}

function setColor(color, index) {
  setCountryColors((state) => {
    state[index] = color;
    return [...state];
  });
}

function setColorForLastClicked(color) {
  setColor(color, lastClicked);
}

const loadClick = React.useCallback(async (acceptedFiles) => {
  const file = acceptedFiles[0];
  console.log(file);
  console.log(acceptedFiles)
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function (e) {
    const saved = JSON.parse(e.target.result)
    setCountryColors(saved.countryColors);
    setLineColor(saved.lineColor);
    setWaterColor(saved.waterColor);
    setMarkerColor(saved.markerColor);
    setMarkerSize(saved.markerSize);
  }
});

function nftClicked(nftIndex) {
  setSelectedNFT(nftIndex);
  changeCenter(coordList[nftIndex]);
  setOpenModal(true);
}

function stringifyColorsData() {
  const obj = {
    countryColors: countryColors,
    lineColor: lineColor,
    waterColor: waterColor,
    markerColor: markerColor,
    markerSize: markerSize
  }

  return JSON.stringify(obj, null, 2);
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
   <>
      <input type="range" min={0.0} step={0.1} max={100} value={autoRotateSpeed} onChange={(e) => {
        globeEl.current.controls().autoRotateSpeed = e.target.value;
        setAutoRotateSpeed(e.target.value);
      }}></input><p style={{display: "inline", paddingLeft: "10px"}}>{autoRotateSpeed}</p>
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
      <div id="globeContainer">
        <Globe 
          ref={globeEl}
          globeImageUrl={"//unpkg.com/three-globe/example/img/earth-dark.jpg"}
          hexPolygonsData={countriesGeo.features}
          hexPolygonResolution={3}
          hexPolygonMargin={0.3}
          hexPolygonColor={() => `#${Math.round(Math.random() * Math.pow(2, 24)).toString(16).padStart(6, '0')}`}
        
        />
      </div>

      <div id="nftButtonsList" className="nftButtonsList">
        {nftList.map((nft, i) => (
          <button className="nftButton" onClick={() => nftClicked(i)} >
            {nft.metadata.title}<br></br>
          </button>
        ))}
      </div>

    </>
  )
}
