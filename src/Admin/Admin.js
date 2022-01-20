import React, { useState, useEffect, useCallback } from 'react';
const IPFS = require('ipfs-core')
const all = require('it-all')
const { concat: uint8ArrayConcat } = require('uint8arrays/concat');//unused
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string');//unused
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');//unused
const CryptoJS = require('crypto-js');
const crustPin = require('@crustio/crust-pin').default;
import ImageDropzone from './ImageDropzone';
import MusicDropzone from './MusicDropzone';
import { setSeed, getSeed, mintRootNFT } from '../utils';

// cuid is a simple library to generate unique IDs
import cuid from "cuid";


export default function Admin() {
  const [ipfsNode, setIpfsNode] = useState(null);
  
  const [title, setTitle] = useState("theTitle");
  const [desc, setDesc] = useState("This theTitl the desc");
  const [price, setPrice] = useState(0);
  
  // For the image
  const [image, setImage] = useState({});                     // This will store actual data
  const [imageReady, setImageReady] = useState(false);
  const [imageCID, setImageCID] = useState("");
  const [imageHash, setImageHash] = useState("");
  
  // For the music
  const [musicReady, setMusicReady] = useState(false);
  const [musicCID, setMusicCID] = useState("");
  const [musicHash, setMusicHash] = useState("");

  useEffect(async () => {
    const tempIpfsNode = await IPFS.create();
    setIpfsNode(tempIpfsNode);
  }, [])
  
  const onDropImage = useCallback(async (acceptedFiles, ipfs) => {
    const file = acceptedFiles[0];                            // We can only accept 1 file
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);                           // Read as array buffer, because we need that for SHA256

    reader.onload = async function(e) {                       // onload callback gets called after the reader reads the file data
      setImage({ id: cuid(), src: e.target.result }); // this will not work
      let wordArray = CryptoJS.lib.WordArray.create(reader.result);
      setImageHash(CryptoJS.SHA256(wordArray).toString());

      const ipfsFile = await ipfs.add({                       // Add the file to IPFS. This won't last, this will be only stored in local node, that is in the browser
        path: '.',
        content: reader.result
      });
      console.log('Added file:', ipfsFile.path, ipfsFile.cid.toString());
      setImageCID(ipfsFile.cid.toString());
  
      
      const CRUST_ACCOUNT_SEEDS = await getSeed();              // Get the seed from the blockchain
      const crust = new crustPin(`${CRUST_ACCOUNT_SEEDS}`);     // Crust will pin the file on it's IPFS nodes
      await crust.pin(ipfsFile.cid.toString())
        .then((res) => {
          if (res) setImageReady(true);
          console.log("Crust result (picture)", res)
        })
        .catch((err) => console.error("Crust error (picture)", err));
    };
  


  });

  const onDropMusic = useCallback(async (acceptedFiles, ipfs) => {
    const file = acceptedFiles[0];                            // We can only accept 1 file
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);                           // Read as array buffer, because we need that for SHA256

    reader.onload = async function(e) {                       // onload callback gets called after the reader reads the file data
      let wordArray = CryptoJS.lib.WordArray.create(reader.result);
      setMusicHash(CryptoJS.SHA256(wordArray).toString());

      // This is very redundant, but I don't want to merge it into one function, yet
      const ipfsFile = await ipfs.add({                       // Add the file to IPFS. This won't last, this will be only stored in local node, that is in the browser
        path: '.',
        content: reader.result
      });
      console.log('Added file:', ipfsFile.path, ipfsFile.cid.toString());
      setMusicCID(ipfsFile.cid.toString())
      
      const CRUST_ACCOUNT_SEEDS = await getSeed();              // Get the seed from the blockchain
      const crust = new crustPin(`${CRUST_ACCOUNT_SEEDS}`);     // Crust will pin the file on it's IPFS nodes
      await crust.pin(ipfsFile.cid.toString())
        .then((res) => {
          if (res) setMusicReady(true);
          console.log("Crust result (music): ", res);
        })
        .catch((err) => console.error("Crust error (music): ", err));
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
    mintRootNFT(title, desc, imageCID, imageHash, musicCID, musicHash);
  }

  return (
    <div>
      <h1>Admin.</h1>

      <button onClick={() => setSeed(testingOnly)}>AES Set</button>
      <button onClick={testwrapper}>AES Get</button><br></br>
      
      <input type={"text"} value={title} onChange={(e) => setTitle(e.target.value)} /><br></br>
      <input type={"textarea"} value={desc} onChange={(e) => setDesc(e.target.value)} /><br></br>
      
      {ipfsNode && <ImageDropzone onDrop={(files) => onDropImage(files, ipfsNode)} accept={"image/*"} />}
      <img alt={`img - ${image.id}`} src={image.src} className="file-img" />      
      
      {ipfsNode && <MusicDropzone onDrop={(files) => onDropMusic(files, ipfsNode)} accept={"audio/*"} multiple={false} />}
      <input type={"number"} min={0} value={price} onChange={(e) => setPrice(e.target.value)} /><br></br>
      
      <button onClick={createNFT}>CREATE</button>

      <p>ImageCID: {imageCID}</p>
      <p>ImageHash: {imageHash}</p>
      <p>MusicCID: {musicCID}</p>
      <p>MusicHash: {musicHash}</p>
    </div>
  )
}
