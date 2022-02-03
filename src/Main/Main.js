import React from 'react';
import { getBuyableTokens, login, logout } from '../utils';
import { utils } from 'near-api-js';
import Map from "../Map";
import 'regenerator-runtime/runtime';
import Globe from 'react-globe.gl';
import SmallUploader from '../Admin/SmallUploader';


import getConfig from '../config'
import TokenCard from './TokenCard';
import { getNextBuyableInstance } from '../utils';
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function Main() {
  const [nftList, setNftList] = React.useState([]);

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
    const buyable = await getBuyableTokens();
    console.log("NEXT NFTs: ", buyable);
    setNftList(buyable);
  }, [])


  /* DEMO */
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
/*
<SmallUploader onDrop={(files) => loadClick(files)} accept={"application/json"} />
<a href={ URL.createObjectURL(new Blob([stringifyColorsData()], { type: "application/json" }) )} download={"colors.json"}>SAVE</a>
<div>
  <button style={{ backgroundColor: colorHistory[0], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[0])} ></button>
  <button style={{ backgroundColor: colorHistory[1], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[1])} ></button>
  <button style={{ backgroundColor: colorHistory[2], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[2])} ></button>
  <button style={{ backgroundColor: colorHistory[3], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[3])} ></button>
  <button style={{ backgroundColor: colorHistory[4], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[4])} ></button>
  <button style={{ backgroundColor: colorHistory[5], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[5])} ></button>
  <button style={{ backgroundColor: colorHistory[6], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[6])} ></button>
  <button style={{ backgroundColor: colorHistory[7], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[7])} ></button>
  <button style={{ backgroundColor: colorHistory[8], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[8])} ></button>
  <button style={{ backgroundColor: colorHistory[9], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[9])} ></button>
  <button style={{ backgroundColor: colorHistory[10], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[10])} ></button>
  <button style={{ backgroundColor: colorHistory[11], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[11])} ></button>
  <button style={{ backgroundColor: colorHistory[12], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[12])} ></button>
  <button style={{ backgroundColor: colorHistory[13], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[13])} ></button>
  <button style={{ backgroundColor: colorHistory[14], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[14])} ></button>
  <button style={{ backgroundColor: colorHistory[15], width: "100px", height: "50px" }} onClick={() => setColorForLastClicked(colorHistory[15])} ></button>
</div>
<input type="color" id="waterColor" name="waterColor" value={waterColor} onChange={(e) => setWaterColor(e.target.value)}/> 
<input type="color" id="lineColor" name="lineColor" value={lineColor} onChange={(e) => setLineColor(e.target.value)}/> 
<input type="range" id="markerSize" name="markerSize" min="1" max="50" value={markerSize} onChange={(e) => setMarkerSize(e.target.value)}/> 
<input type="color" id="markerColor" name="markerColor" value={markerColor} onChange={(e) => setMarkerColor(e.target.value)}/>
<input type="range" id="globeZoom" name="globeZoom" value={zoom} onChange={(e) => setZoom(e.target.value)} min={"20"} max={"900"} />

<label>SELECTED: </label>
<input 
  type="color" 
  id="countryColor" 
  name="countryColor" 
  value={countryColors[lastClicked]} 
  onChange={(e) => setColor(e.target.value, lastClicked)}
/>

<div style={{ textAlign: "center" }}>
  <div style={{ padding: "1rem 0" }}>
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
  <Map 
    center={center} 
    waterColor={waterColor} 
    colors={countryColors} 
    lineColor={lineColor} 
    markerSize={markerSize} 
    markerColor={markerColor}
    globeSize={zoom}
    setLastClicked={setLastClicked}
    pushColor={pushColor}
    selectCountry={selectCountry}
  />
</div>

*/
    
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

    </>
  )
}
