import React, { useEffect, useState } from "react";
import Draggable from 'react-draggable';
import AudioPlayer from '../Common/AudioPlayer';
import close from '../assets/close.svg'
import { debounce } from "debounce";
import { checkIfAccountExists, getAllFromRoot, getContractName, transferNft } from '../utils'


export default function TransferModal({token, newAction, setOpenModal}) {
  const [receiver, setReceiver] = useState("receiver.near");
  const [music, setMusic] = useState(null);
  const [image, setImage] = useState(null);
  const [selected, setSelected] = useState("info");
  const [all, setAll] = useState([]);                                     // All NFTs that belong to same root. Including root.
  const [vault, setVaultName] = useState("");
  const [accountExists, setAccountExists] = useState(false);
  
  
  const title = token.metadata.title;
  const description = token.metadata.description;
  const imageCID = token.metadata.media;
  const imageHash = token.metadata.media_hash;
  const extra = JSON.parse(token.metadata.extra);
  const musicCID = extra.music_cid;
  const musicHash = extra.music_hash;

  useEffect(async () => {
    const vaultName = await getContractName();
    setVaultName(vaultName);

    const FonoRootRegEx = /fono-root-[0-9]{1,9}/;
    const root = token.token_id.match(FonoRootRegEx)[0];
    console.log("root: ", root)
    const fetchResult = await getAllFromRoot(root);
    console.log("fetchResult: ", fetchResult)
    setAll(fetchResult);
  }, [])
  

  async function handleInputChange(accountName) {
    //console.log(await checkIfAccountExists());
    /*debounce(() => {
      console.log(checkIfAccountExists());
      setAccountExists(x);
    }, 200)*/
    setReceiver(accountName);
  }

  function transfer() {
    const transferPromise = new Promise(async (resolve, reject) => {
      const transferResult = await transferNft(token.token_id, receiver);
      if (transferResult) {
        resolve("success(transfer)");
      } else {
        reject("reject(transfer)");
      }
    })
    newAction({
      thePromise: transferPromise, 
      pendingPromiseTitle: "Prepairing transaction...", pendingPromiseDesc: "plase wait",
      successPromiseTitle: "Redirecting to transaction", successPromiseDesc: "Please sign the transaction in the next screen!",
      errorPromiseTitle: "Redirecting to transaction", errorPromiseDesc: "Please sign the transaction in the next screen!"
    });
  }

  function loadImage() {
    // SHA VERIFICATION SHOULD HAPPEN SOMEWHERE
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ipfs.io/ipfs/" + imageCID);
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
    xhr.open("GET", "https://ipfs.io/ipfs/" + musicCID);
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

  return (
    <Draggable handle={'#nftDetailsModalBar'} bounds={'main'} >
      <div className="nftDetailsModal">
        <div id="nftDetailsModalBar">
          <p>{title}</p>
          <button onClick={() => setOpenModal(false)}><img src={close} alt='X'></img></button>
        </div>
        
        <div id="nftDetailsModalContent">
          <div id="nftDetailsModalPicture">
            <div id="placeholderAtImageSide" className="nftDetailsModalMenuLine"></div>
            <img src={image} alt={title}></img>
          </div>
          <div id="nftDetailsModalRightSide">
            <div className="nftDetailsModalMenuLine">
              <button 
                onClick={() => setSelected("info")} 
                className={"nftDetailsModalMenuButton " + (selected === "info" ? "nftDetailsModalMenuSelected" : null)}
              >
                Info
              </button>
              <button 
                onClick={() => setSelected("owners")} 
                className={"nftDetailsModalMenuButton " + (selected === "owners" ? "nftDetailsModalMenuSelected" : null)}
              >
                Owners
              </button>
              <button className="nftDetailsModalMenuButton"></button>
            </div>

            {(selected === "info") && (
              <>
                <div className="nftDetailsModalRightSideContent">
                  {description}
                </div>
                <div className="nftDetailsModalRightSideGenBox">
                  GEN {extra.generation}
                </div>
              </>
            )}

            {(selected === "owners") && (
              <>
                {all.map((nft) => (
                  <div className="nftDetailsModalRightOwnerDiv">
                    {nft.owner_id === vault ? 
                      <p className="nftDetailsModalRightAccount">Vault</p>
                    : 
                    <p className="nftDetailsModalRightAccount">{nft.owner_id}</p>
                    }
                    <p className="nftDetailsModalRightGen">GEN: {JSON.parse(nft.metadata.extra).generation}</p>
                  </div>
                ))}
              </>
            )}

          </div>
          <div id="nftDetailsModalAudio">
            {music ? 
              <AudioPlayer music={music}/>
              :
              <p>loading music...</p>
            }
          </div>
          <div id="nftDetailsModalButtons">
            <input 
              type={"text"} 
              value={receiver} 
              onChange={(e) => handleInputChange(e.target.value)} 
              className="nftDetailsModalRightSideInput" 
            />
            <button onClick={transfer} className="buttonFrame">Transfer</button>
          </div>
        </div>
      </div>
    </Draggable>
  );
}