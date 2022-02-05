import React, { useState } from 'react';
import { buyNFTfromVault } from '../utils';
import PreviewBox from '../Admin/PreviewBox';
import { utils } from 'near-api-js';


export default function TokenModal({id, owner, metadata, openModal, setOpenModal}) {
  const [music, setMusic] = useState(null);
  const [image, setImage] = useState(null);
  const extra = JSON.parse(metadata.extra);

  function buyNFT() {
    const badPrice = 100;
    console.log("Orig.price: ", extra.original_price);
    buyNFTfromVault(id, extra.original_price);
  }

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
        setImage(e.target.result);
      }
    }
    xhr.send();
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
  loadImage();

  console.log("metadata: ", metadata);
  console.log("extra: ", extra);

  return (
    <>
      {openModal && (
        <div className="nftDetailsModal" onBlur={() => setOpenModal(false)} tabIndex={"0"} >
          <PreviewBox 
            title={metadata.title}
            image={{name: metadata.description, src: image}}
            music={{name: "Generation: " + extra.generation, src: music}}
            price={utils.format.formatNearAmount(extra.original_price)}
          />
          
          <button onClick={buyNFT}>BUY</button>
          <button onClick={() => setOpenModal(false)}>CLOSE</button>
        </div>
      )}
    </>
  );
}
