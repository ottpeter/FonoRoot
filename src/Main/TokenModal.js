import React, { useState } from 'react';
import { buyNFTfromVault } from '../utils';


export default function TokenModal({id, owner, metadata, extra, image, setOpenModal}) {
  const [music, setMusic] = useState(null);

  function buyNFT() {
    const badPrice = 100;
    console.log("Orig.price: ", extra.original_price);
    //extra.original_price
    buyNFTfromVault(id, extra.original_price);
  }

  function loadMusic() {
    // SHA VERIFICATION SHOULD HAPPEN SOMEWHERE
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ipfs.io/ipfs/" + extra.music_cid);
    xhr.responseType = "blob";
    xhr.onload = function() {
      let blob = xhr.response;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function(e) {
        setMusic(e.target.result);
      }
    }
    xhr.send();
  }

  loadMusic();


  return (
    <div className="nftDetailsModal" onBlur={() => setOpenModal(false)} tabIndex={"0"} onPointerCancelCapture={() => setOpenModal(false)}>
      <img src={image} className="temporaryCARD"></img>
      <audio controls src={music}></audio>

      <button onClick={buyNFT}>BUY</button>
      <button onClick={() => setOpenModal(false)}>CLOSE</button>
    </div>
  );
}
