import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { buyNFTfromVault } from '../utils';
import close from '../assets/close.svg';
import AudioPlayer from '../Common/AudioPlayer';


export default function TokenModal({id, metadata, image, newAction, openModal, setOpenModal, fadeOut, test}) {
  const [music, setMusic] = useState(null);
  const extra = JSON.parse(metadata.extra);

  function buyNFT() {
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
    <Draggable handle={'#nftDetailsModalBar'} bounds={'main'} >
      <div className="nftDetailsModal" >
        <div id="nftDetailsModalBar">
          <p>{metadata.title}</p>
          <button onClick={() => setOpenModal(false)}><img src={close} alt='X'></img></button>
        </div>
        <div id="nftDetailsModalContent">
          <div id="nftDetailsModalPicture">
            <div id="placeholderAtImageSide" className="nftDetailsModalMenuLine"></div>
            <img src={image} alt={metadata.title}></img>
          </div>
          <div id="nftDetailsModalRightSide">
            <div className="nftDetailsModalMenuLine">
              <button className="nftDetailsModalMenuButton nftDetailsModalMenuSelected">Info</button>
              <button className="nftDetailsModalMenuButton"></button>
              <button className="nftDetailsModalMenuButton"></button>
            </div>
            <div className="nftDetailsModalRightSideContent">
              {metadata.description}
            </div>
            <div className="nftDetailsModalRightSideGenBox">
              GEN {extra.generation}
            </div>
          </div>
          <div id="nftDetailsModalAudio">
            {music ? 
              <AudioPlayer music={music} test={test} />
            :
              <p>loading music... </p>
            }
          </div>
          <div id="nftDetailsModalButtons">
            <button onClick={buyNFT} id="nftBuyButton"></button>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
