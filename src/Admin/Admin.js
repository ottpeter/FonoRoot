import React, { useState, useEffect, useCallback } from 'react';
const IPFS = require('ipfs-core')
const all = require('it-all')
//const { concat: uint8ArrayConcat } = require('uint8arrays/concat');
//const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string');
//const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
const CryptoJS = require('crypto-js');
const crustPin = require('@crustio/crust-pin').default;
import MediaDropzone from './MediaDropzone';
import { getSeed, mintRootNFT } from '../utils';
import PreviewBox from './PreviewBox';
import SetKey from './SetKey';
import Loading from './Loading';



export default function Admin() {
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
  const [musicReady, setMusicReady] = useState(false);
  const [musicCID, setMusicCID] = useState("");
  const [musicHash, setMusicHash] = useState("");

  useEffect(async () => {
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

    if (file.type.includes("image")) {
      const base64Converter = new FileReader();
      base64Converter.readAsDataURL(file);
      base64Converter.onload = function(e) {
        setPreview({
          name: file.name,
          src: e.target.result,
        });
      }
    }

    reader.onload = async function(e) {                       // onload callback gets called after the reader reads the file data
      let wordArray = CryptoJS.lib.WordArray.create(reader.result);
      
      const ipfsFile = await ipfs.add({                       // Add the file to IPFS. This won't last, this will be only stored in local node, that is in the browser
        path: '.',
        content: reader.result
      });
      console.log('Added file:', ipfsFile.path, ipfsFile.cid.toString());
      
      const crust_seed = await getSeed();                     // Get the seed from the blockchain
      const crust = new crustPin(`${crust_seed}`);            // Crust will pin the file on it's IPFS nodes

      await crust.pin(ipfsFile.cid.toString())
      .then((pinResult) => {                                  // pinResult is boolean
        if (pinResult && file.type.includes("image")) {
          setImageHash(CryptoJS.SHA256(wordArray).toString());
          setImageCID(ipfsFile.cid.toString());
          setImageReady(true);
        }
        if (pinResult && file.type.includes("audio")) {
          setMusicHash(CryptoJS.SHA256(wordArray).toString());
          setMusicCID(ipfsFile.cid.toString())
          setMusicReady(true);
          }
        })
        .catch((err) => console.error("Error from Crust: ", err));
    }
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
  if (pageSwitch === 1) return <SetKey />

  return (
    <div id="adminMain" className="adminMain">
      <h1 className="title">Create NFT</h1>


      <div id="adminFlexBox" className="adminFlexBox">
        <div id="nft-details" className="nft-details">
          <label className="fieldName">Upload Media</label>
          {ipfsNode && <MediaDropzone onDrop={(files) => onDropMedia(files, ipfsNode)} accept={"image/*, audio/*"} />}
          <label className="fieldName">Title</label>
          <input type={"text"} value={title} className="nftTitleInput" onChange={(e) => setTitle(e.target.value)} />
          <label className="fieldName">Description</label>
          <input type={"textarea"} value={desc} className="descInput" onChange={(e) => setDesc(e.target.value)} />
          <label className="fieldName">Price</label>
          <input type={"number"} min={0} value={price} className="priceInput" onChange={(e) => setPrice(e.target.value)} />
        </div>

        <PreviewBox title={title} image={image} price={price}/>
      </div>

      <button onClick={createNFT} className="mainButton">CREATE</button>
    </div>
  )
}
