import React, { useState, useEffect, useCallback } from 'react';
const IPFS = require('ipfs-core')
const all = require('it-all')
const CryptoJS = require('crypto-js');
const crustPin = require('@crustio/crust-pin').default;
import MediaDropzone from './MediaDropzone';
import { getSeed, mintRootNFT, setSeed } from '../utils';
import PreviewBox from './PreviewBox';
import Loading from './Loading';
import SmallUploader from './SmallUploader';
import infoLogo from '../assets/info.svg';
import ConnectWallet from './ConnectWallet';


export default function Admin({newAction}) {
  const [ipfsNode, setIpfsNode] = useState(null);
  const [pageSwitch, setPageSwitch] = useState(0);                               // If no Crust seed is set yet, the user has to provide one
  
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

  const [mnemonic, setMnemonic] = useState("");

  function saveMnemonic() {
    if (mnemonic.length === 0) return;
    
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?")+1);
    history.pushState(null, "SetSeed", href + "?admin=1&setseed=1");             // This is important because of the notification we fire 
    const setSeedPromise = new Promise(async (resolve, reject) => {              // when we got redirected to our page from near.org
      await setSeed(mnemonic);
    })
    newAction({
      thePromise: setSeedPromise, 
      pendingPromiseTitle: "Prepairing transaction...", pendingPromiseDesc: "plase wait",
      successPromiseTitle: "Redirecting to transaction", successPromiseDesc: "Please sign the transaction in the next screen!",
      errorPromiseTitle: "Redirecting to transaction", errorPromiseDesc: "Please sign the transaction in the next screen!"
    });
  }
  
  useEffect(async () => {
    const urlParams = window.location.search;
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?"));
    history.pushState(null, "Admin", href + "?admin=1");
    
    if (urlParams.includes('errorCode')) {
      newAction({
        errorMsg: "There was an error during the transaction!", errorMsgDesc: URLSearchParams.get('errorCode'),
      }); 
    } else if (urlParams.includes('transactionHashes') && urlParams.includes('setseed')) {
      newAction({
        successMsg: "Saved!", successMsgDesc: "The seed was saved.",
      });
    } else if (urlParams.includes('transactionHashes')) {
      newAction({
        successMsg: "NFT Minted!", successMsgDesc: "The new RootNFT was successfully minted",
      });
    }

    const seedBoolean = await getSeed() && true;
    if (seedBoolean) setPageSwitch(2);                        // Key is already set
    else setPageSwitch(1);                                    // Need to set key
    const tempIpfsNode = await IPFS.create();
    setIpfsNode(tempIpfsNode);
  }, [])

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function crustPin3Times(ipfsFile) {
    const redundancyCount = 3;
    const tolerance = 2;                                        // Minimum success number
    const maxTry = 3;                                           // Max try for each pin
    let successNum = 0;

    for (let i = 1; i <= redundancyCount; i++) {                // We want to pin it 3 times, we will retry 3 times for each if failed
      let success = false;
      let tryCount = 0;
      do {
        const crust_seed = await getSeed();                     // Get the seed from the blockchain
        const crust = new crustPin(`${crust_seed}`);            // Crust will pin the file on it's IPFS nodes
        success = await crust.pin(await ipfsFile.cid.toString());
        if (success) successNum++;
        await sleep(1000);
        tryCount++;
      } while (tryCount < maxTry && success === false);
    }
    console.log("Success Num: ", successNum);
    return (successNum >= tolerance);
  }

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

    reader.onload = async function () {                           // onload callback gets called after the reader reads the file data
      let wordArray = CryptoJS.lib.WordArray.create(reader.result);
      
      const ipfsPromise = ipfs.add({                              // Add the file to IPFS. This won't last, this will be only stored in local node, that is in the browser
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
    
      // This wrapper promise is necesarry, because the Crust API 
      // would resolve the promise even when the pinning fails 
      const uploadPromise = new Promise(async (resolve, reject) => {
        let successBoolean = false;
        
        await crustPin3Times(ipfsFile)
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

  /**
   * This is the code that we would be using for the site cloning, 
   * the IPFS-side of it works, but we couldn't create new contract instance 
   * from browser, so we don't have this feature. The following code is creating
   * an almost equal IPFS site, but the `projectConfig.json` can be different.
   * It would be also possible to add a different background image for example.
   */
  async function folderExperiment() {
    if (!ipfsNode) { console.log("The IPFS node is not ready."); return; }

    //await deployContract();
    

    const configObj = {
      test: 5,
      "contractName": "dev-1644223381077-49369947423471",
    }
    const strConfig = JSON.stringify(configObj);
    let configFileName = null;
    
    const cid = 'QmQ6siYQBGKQKWqPBhCMWKJQZ3MxTSwpk7Ldc5vW1BGop2';
    const lsResult = await all(ipfsNode.files.ls('/'));
    lsResult.map(async (line) => await ipfsNode.files.rm('/' + line.name, { recursive: true }));
    
    for await (const file of ipfsNode.ls(cid)) {
      if (file.name.includes('projectConfig')) configFileName = file.name;
      await ipfsNode.files.cp('/ipfs/' + file.path, '/' + file.name);
    }

    console.log("configFileName: ", configFileName);
    const configByteArray = new TextEncoder().encode(strConfig);
    console.log("configByteArray: ", configByteArray)
    await ipfsNode.files.rm('/' + configFileName);
    await ipfsNode.files.write('/' + configFileName, configByteArray, { create: true, flush: true });

    const res = await all(ipfsNode.files.read('/' + configFileName));
    console.log("TRS", res[0])
    const decoded = new TextDecoder().decode(res[0]);
    console.log(decoded)

    const newnewstat = await ipfsNode.files.stat("/");
    const newnewlsResult = await all(ipfsNode.files.ls('/'));
    console.log("stat: ", newnewstat);
    console.log("ls: ", newnewlsResult);

  
    await crustPin3Times(newnewstat)
    .then((pinResult) => {                                  // pinResult is boolean
      if (pinResult) console.log("pinResult is true!");
      console.log("CID: ", newnewstat.cid.toString());
    })
    .catch((err) => console.error("Error from Crust: ", err));
  }


  if (!window.walletConnection.isSignedIn()) return <ConnectWallet />
  if (pageSwitch === 0) return <Loading />

  return (
    <main id="adminMain">
      {pageSwitch === 1 && <div id="keyInput" className="keyInput">
        <p>Enter CRUST Key</p>
        <input onChange={(e) => setMnemonic(e.target.value)}></input>
        <button onClick={saveMnemonic}>Enter</button>
      </div>}
      <div id="adminMain" className={pageSwitch === 1 ? "adminMain blurred" : "adminMain"}>
        {pageSwitch === 1 && <div id="darkeningOverlay" className="darkeningOverlay"></div>}
        <h1 className="title">Mint NFT</h1>


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
                <div className="infoDiv">
                  <img src={infoLogo}></img>
                  <p>{"Supported formats .jpg .png and .mp3"}</p>
                </div>
              </>
            )}
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
