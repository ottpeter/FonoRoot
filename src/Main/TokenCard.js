import React, { useState } from 'react';
import { buyNFTfromVault } from '../utils';


export default function TokenCard({id, owner, metadata}) {
  console.log(id)
  console.log(owner)
  console.log("metadata: ", metadata)

  const [imageSrc, setImageSrc] = useState(null);
  const extra = JSON.parse(metadata.extra);

  function loadImage() {
    // SHA VERIFICATION SHOULD HAPPEN SOMEWHERE
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ipfs.io/ipfs/" + metadata.media);
    xhr.responseType = "blob";
    xhr.onload = function() {
      let blob = xhr.response;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function(e) {
        setImageSrc(e.target.result);
      }
    }
    xhr.send();
  }
  loadImage();

  function buyNFT() {
    const badPrice = 100;
    console.log("Orig.price: ", extra.original_price);
    //extra.original_price
    buyNFTfromVault(id, extra.original_price, "100000000");
  }
  
  return (
    <div>
      <button onClick={buyNFT}>
        {id}<br></br>
        {owner}<br></br>
        {metadata.title}<br></br>
        {metadata.description}<br></br>
        generation: {extra.generation}<br></br>
        <img id="nft-image" className="temporaryCARD" src={imageSrc}></img>
      </button>
    </div>
  )
}
