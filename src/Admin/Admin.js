import React, { useState, useEffect, useCallback } from 'react';
const IPFS = require('ipfs-core')
const all = require('it-all')
//const { concat: uint8ArrayConcat } = require('uint8arrays/concat');
//const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string');
//const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
const CryptoJS = require('crypto-js');
const crustPin = require('@crustio/crust-pin').default;
import MediaDropzone from './MediaDropzone';
import { getSeed, mintRootNFT, setSeed } from '../utils';
import PreviewBox from './PreviewBox';
import Loading from './Loading';
import SmallUploader from './SmallUploader';


export default function Admin({newAction}) {
  const [ipfsNode, setIpfsNode] = useState(null);
  const [pageSwitch, setPageSwitch] = useState(0);              // If no Crust seed is set yet, the user has to provide one
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  
  // For the image
  const [image, setPreview] = useState({name: "empty", src: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"});                     // This will store actual data
  const [imageReady, setImageReady] = useState(false);
  const [imageCID, setImageCID] = useState("");
  const [imageHash, setImageHash] = useState("");
  
  // For the music
  const [music, setMusic] = useState({name: "empty", src: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"});                     // This will store actual data
  const [musicReady, setMusicReady] = useState(false);
  const [musicCID, setMusicCID] = useState("");
  const [musicHash, setMusicHash] = useState("");

  const [mnemonic, setMnemonic] = useState("");
  function saveMnemonic() {
    if (mnemonic.length === 0) return;
    setSeed(mnemonic);
  }

  useEffect(async () => {
    //setPageSwitch(1);return;
    const seedBoolean = await getSeed() && true;
    if (seedBoolean) setPageSwitch(2);                        // Key is already set
    else setPageSwitch(1);                                    // Need to set key
    const tempIpfsNode = await IPFS.create();
    setIpfsNode(tempIpfsNode);
  }, [])


  const onDropMedia = useCallback(async (acceptedFiles, ipfs) => {
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

    reader.onload = async function (e) {                     // onload callback gets called after the reader reads the file data
      let wordArray = CryptoJS.lib.WordArray.create(reader.result);
      
      const ipfsPromise = ipfs.add({                         // Add the file to IPFS. This won't last, this will be only stored in local node, that is in the browser
        path: '.',
        content: reader.result
      });
      
      newAction({ 
        thePromise: ipfsPromise, 
        pendingPromiseTitle: "Uploading to local (browser) IPFS node...", pendingPromiseDesc: "and this should be empty",
        successPromiseTitle: "Done!", successPromiseDesc: "The file was uploaded to the local (browser) IPFS node.",
        errorPromiseTitle: "Upload Failed", errorPromiseDesc: "Error while trying to upload to local IPFS node! Please Try again!",
      });
      const ipfsFile = await ipfsPromise

      const crust_seed = await getSeed();                     // Get the seed from the blockchain
      const crust = new crustPin(`${crust_seed}`);            // Crust will pin the file on it's IPFS nodes
    
      // This wrapper promise is necesarry, because the Crust API 
      // would resolve the promise even when the pinning fails 
      const uploadPromise = new Promise(async (resolve, reject) => {
        let successBoolean = false;
        
        await crust.pin(await ipfsFile.cid.toString())
          .then((pinResult) => {                                  // pinResult is boolean
            if (pinResult && file.type.includes("image")) {
              setImageHash(CryptoJS.SHA256(wordArray).toString());
              setImageCID(ipfsFile.cid.toString());
              setImageReady(true);
              successBoolean = true;
            }
            if (pinResult && file.type.includes("audio")) {
              setMusicHash(CryptoJS.SHA256(wordArray).toString());
              setMusicCID(ipfsFile.cid.toString())
              setMusicReady(true);
              successBoolean = true;
            }
          })
          .catch((err) => console.error("Error from Crust: ", err));
        if(successBoolean) {
           resolve("Successfully pinned!")
        } else {
           reject("Error occured while uploading the file to Crust!");
        }
      });
        
      newAction({
        thePromise: uploadPromise, 
        pendingPromiseTitle: "Uploading file to the Crust network...", pendingPromiseDesc: "",
        successPromiseTitle: "File uploaded!", successPromiseDesc: "The file was uploaded to the network",
        errorPromiseTitle: "Couldn't upload file to Crust!", errorPromiseDesc: "Couldn't upload file to Crust! Please check your Crust balance and try again!"
      });
    };
  });


  async function testwrapper() {
    const plaintext = await getSeed();
    console.log("the key is: ", plaintext)
  }

  function createNFT() {
    if (!(imageReady && musicReady)) {
      console.error("IMAGE OR MUSIC IS NOT READY");
      return;
    }
    if (title.length === 0) {
      console.error("TITLE CAN NOT BE EMPTY");
      return;
    }
    if (desc.length === 0) {
      console.error("DESC CAN NOT BE EMPTY");
      return;
    }      // or maybe that could be optional
    // we should set some error message before return
    mintRootNFT(title, desc, imageCID, imageHash, musicCID, musicHash, price);
  }
/*
      <button onClick={() => setSeed(testingOnly)}>AES Set</button>
      <button onClick={testwrapper}>AES Get</button><br></br>
      <p>ImageCID: {imageCID}</p>
      <p>ImageHash: {imageHash}</p>
      <p>MusicCID: {musicCID}</p>
      <p>MusicHash: {musicHash}</p>

*/

  if (pageSwitch === 0) return <Loading />

  return (
    <>
      {pageSwitch === 1 && <div id="keyInput" className="keyInput">
        <p>Enter CRUST Key</p>
        <input onChange={(e) => setMnemonic(e.target.value)}></input>
        <button onClick={saveMnemonic}>Enter</button>
      </div>}
      <div id="adminMain" className={pageSwitch === 1 ? "adminMain blurred" : "adminMain"}>
        {pageSwitch === 1 && <div id="darkeningOverlay" className="darkeningOverlay"></div>}
        <h1 className="title">Create NFT</h1>


        <div id="adminFlexBox" className="adminFlexBox">
          <div id="nft-details" className="nft-details">
            <label className="fieldName">Upload Media</label>
            {ipfsNode && (
              <>
                {!(imageReady || musicReady) ? 
                  <MediaDropzone onDrop={(files) => onDropMedia(files, ipfsNode)} accept={"image/*, audio/*"} />
                  : (
                    <>
                    {imageReady ? 
                      <p className="smallUploader">{image.name}<button onClick={() => setImageReady(false)}>X</button></p> 
                    : 
                      <SmallUploader onDrop={(files) => onDropMedia(files, ipfsNode)} accept={"image/*"} /> }
                    {musicReady ? 
                      <p className="smallUploader">{music.name}<button onClick={() => setMusicReady(false)}>X</button></p>
                    : 
                      <SmallUploader onDrop={(files) => onDropMedia(files, ipfsNode)} accept={"audio/*"} />}
                    </>
                  )
                }
              </>
            )}
            <label className="fieldName">Title</label>
            <input type={"text"} value={title} className="nftTitleInput" onChange={(e) => setTitle(e.target.value)} />
            <label className="fieldName">Description</label>
            <input type={"textarea"} value={desc} className="descInput" onChange={(e) => setDesc(e.target.value)} />
            <label className="fieldName">Price</label>
            <input type={"number"} min={0} value={price} className="priceInput" onChange={(e) => setPrice(e.target.value)} />
          </div>

          <PreviewBox title={title} image={image} price={price}/>
        </div>
        <div className="buttonContainer">
          <button onClick={createNFT} className="mainButton">Mint</button>
        </div>
      </div>
    
    </>
  )
}
