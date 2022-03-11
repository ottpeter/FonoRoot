const express = require('express');
const fileUpload = require("express-fileupload");
const path = require("path");
const CryptoJS = require('crypto-js');

const uploadHandler = require('../utils/uploadHandler.js');
const router = express.Router();

// Middleware
router.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50 MB
    },
    abortOnLimit: true
  })
);


router.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

router.post('/image', function(req, res) {
  uploadHandler(req, res, "image");
});

router.post('/music', function(req, res) {
  uploadHandler(req, res, "music");
});

module.exports = router;










/* Still need to reorganize below code to correct places:

reader.onload = async function () {                           // onload callback gets called after the reader reads the file data
  let wordArray = CryptoJS.lib.WordArray.create(reader.result);
  
  
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
};*/