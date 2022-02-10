import React, { useEffect, useState } from 'react';
import { buyNFTfromVault } from '../utils';
import PreviewBox from '../Admin/PreviewBox';
import { utils } from 'near-api-js';


export default function TokenModal({id, metadata, newAction, openModal, setOpenModal}) {
  const [music, setMusic] = useState(null);
  const [image, setImage] = useState(null);
  const extra = JSON.parse(metadata.extra);

  function buyNFT() {
    console.log("Orig.price: ", extra.original_price);
    const buyPromise = new Promise(async (resolve, reject) => {
      const buyResult = await buyNFTfromVault(id, extra.original_price);
      if (buyResult) {
        resolve("Buying the NFT was successull (message from promise)");
      } else {
        reject("Buying the NFT was not successull (message from promise)");
      }
    });
    newAction({
      thePromise: buyPromise, 
      pendingPromiseTitle: "Prepairing transaction...", pendingPromiseDesc: "plase wait",
      successPromiseTitle: "Redirecting to transaction", successPromiseDesc: "Please sign the transaction in the next screen!",
      errorPromiseTitle: "Redirecting to transaction", errorPromiseDesc: "Please sign the transaction in the next screen!"
    });
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
