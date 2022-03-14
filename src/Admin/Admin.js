import React, { useState, useEffect, useCallback } from 'react';
import 'regenerator-runtime/runtime';
const axios = require('axios');
const CryptoJS = require('crypto-js'); 
import MediaDropzone from './MediaDropzone';
import { mintRootNFT } from '../utils';
import PreviewBox from './PreviewBox';
import SmallUploader from './SmallUploader';
import infoLogo from '../assets/info.svg';
import ConnectWallet from './ConnectWallet';


export default function Admin({newAction}) {  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("0");
  
  // For the image
  const [image, setPreview] = useState({name: "", src: null});                   // This will store actual data
  const [imageReady, setImageReady] = useState(false);
  const [imageCID, setImageCID] = useState("");
  const [imageHash, setImageHash] = useState("");
  
  // For the music
  const [music, setMusic] = useState({name: "", src: null});                     // This will store actual data
  const [musicReady, setMusicReady] = useState(false);
  const [musicCID, setMusicCID] = useState("");
  const [musicHash, setMusicHash] = useState("");
  

  useEffect(async () => {
    const urlParams = window.location.search;
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?"));
    history.pushState(null, "Admin", href + "?admin=1");
    
    if (urlParams.includes('errorCode')) {
      newAction({
        errorMsg: "There was an error during the transaction!", errorMsgDesc: URLSearchParams.get('errorCode'),
      }); 
    } else if (urlParams.includes('transactionHashes')) {
      newAction({
        successMsg: "NFT Minted!", successMsgDesc: "The new RootNFT was successfully minted",
      });
    }
  }, [])

  const onDropMedia = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];                            // We can only accept 1 file
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);                           // Read as array buffer, because we need that for SHA256

    const base64Converter = new FileReader();
    base64Converter.readAsDataURL(file);
    base64Converter.onload = function(e) {
      if (file.type.includes("image")) {
        setPreview({
          name: file.name,
          src: e.target.result,
        });
      }
      if (file.type.includes("audio")) {
        setMusic({
          name: file.name,
          src: e.target.result,
        });
      }
    }

    reader.onload = async function () {                           // onload callback gets called after the reader reads the file data
      let wordArray = CryptoJS.lib.WordArray.create(reader.result);

      // Upload the file to our server using Axios
      if (file.type.includes("audio")) uploadFile(file, wordArray, "music");
      if (file.type.includes("image")) uploadFile(file, wordArray, "image");
    }
  });

  /** Upload file to server. The server will do the IPFS pinning */
  function uploadFile(file, wordArray, fileType) {
    let successBoolean = false;

    const uploadPromise = new Promise(async (resolve, reject) => {
      const formData = new FormData();
      formData.append("myFile", file);
      const headers = {
        'Content-Type': 'multipart/form-data',
      }
      await axios.post(`http://172.105.246.99:3000/upload/${fileType}`, formData, { headers })
        .then((response) => {
          console.log("THE RESPONSE: ", response);
          if (fileType === "image") {
            setImageHash(CryptoJS.SHA256(wordArray).toString());
            setImageCID(response.data.cid);
            setImageReady(true);
            successBoolean = true;
          }
          if (fileType === "music") {
            setMusicHash(CryptoJS.SHA256(wordArray).toString());
            setMusicCID(response.data.cid)
            setMusicReady(true);
            successBoolean = true;
          }
          console.log("Media was uploaded.")
        })
        .catch((err) => console.error("Error while uploading file", err));
        if(successBoolean) {
          resolve("(resolve) Successfully uploaded!")
        } else {
          reject("(reject) Error occured while uploading the file!");
        }
    });

    newAction({
      thePromise: uploadPromise, 
      pendingPromiseTitle: "Uploading media...", pendingPromiseDesc: "",
      successPromiseTitle: "File uploaded!", successPromiseDesc: "The file was successfully uploaded",
      errorPromiseTitle: "Couldn't upload file!", errorPromiseDesc: "There was an error while uploading the file. Please try again!"
    });
  }

  function createNFT() {
    if (!(imageReady && musicReady)) {
      newAction({
        errorMsg: "The image or the music is not ready!", errorDesc: ""
      });
      return;
    }
    if (title.length === 0) {
      newAction({
        errorMsg: "The title can not be empty!", errorDesc: ""
      });
      return;
    }
    if (desc.length === 0) {
      newAction({
        errorMsg: "The description can not be empty!", errorDesc: ""
      });
      return;
    }
    if (price === "0") {
      newAction({
        errorMsg: "You have to set a price!", errorDesc: ""
      });
      return;
    }
    
    const mintPromise = new Promise(async (resolve, reject) => {
      const mintResult = await mintRootNFT(title, desc, imageCID, imageHash, musicCID, musicHash, price);
      if (mintResult) {
        resolve("The mint was successfull (message from promise)");
      } else {
        reject("The mint was not successfull (message from promise)");
      }
    });
    newAction({
      thePromise: mintPromise, 
      pendingPromiseTitle: "Prepairing transaction...", pendingPromiseDesc: "plase wait",
      successPromiseTitle: "Redirecting to transaction", successPromiseDesc: "Please sign the transaction in the next screen!",
      errorPromiseTitle: "Redirecting to transaction", errorPromiseDesc: "Please sign the transaction in the next screen!"
    });
  }

  if (!window.walletConnection.isSignedIn()) return <ConnectWallet />


  return (
    <main id="adminMain">
      <div id="adminMain" className={"adminMain"}>
        <h1 className="title">Mint NFT</h1>

        <div id="adminFlexBox" className="adminFlexBox">
          <div id="nft-details" className="nft-details">
            <label className="fieldName">Upload Media</label>
              {!(imageReady || musicReady) ? 
                <MediaDropzone onDrop={(files) => onDropMedia(files)} accept={"image/*, audio/*"} />
                : (
                  <>
                  {imageReady ? 
                    <p className="smallUploader">{image.name}<button onClick={() => setImageReady(false)}>X</button></p> 
                  : 
                    <SmallUploader onDrop={(files) => onDropMedia(files)} accept={"image/*"} /> }
                  {musicReady ? 
                    <p className="smallUploader">{music.name}<button onClick={() => setMusicReady(false)}>X</button></p>
                  : 
                    <SmallUploader onDrop={(files) => onDropMedia(files)} accept={"audio/*"} />}
                  </>
                )
              }
              <div className="infoDiv">
                <img src={infoLogo}></img>
                <p>{"Supported formats .jpg .png and .mp3"}</p>
              </div>
            <label className="fieldName">Title</label>
            <input type={"text"} value={title} className="nftTitleInput" onChange={(e) => setTitle(e.target.value)} />
            <label className="fieldName">Description</label>
            <textarea value={desc} className="descInput" onChange={(e) => setDesc(e.target.value)} />
            <label className="fieldName">Price</label>
            <input type={"number"} min={0} value={price} className="priceInput" onChange={(e) => setPrice(e.target.value)} />
          </div>

          <PreviewBox title={title} image={image} music={music} price={price}/>
        </div>
        <div className="buttonContainer">
          <button onClick={createNFT} className="mainButton">Mint</button>
        </div>
      </div>
    </main>
  )
}
