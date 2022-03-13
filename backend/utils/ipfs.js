const { exec } = require('child_process');
const axios = require('axios');
const process = require('process');
const dotenv = require('dotenv');
dotenv.config();
const crustPin = require('@crustio/crust-pin').default;


/** 
 * This function will add the file to the local IPFS repo.
 * It will also start the pinning proccess, but that's an async function, and we are not awaiting for it.
 * It will return the CID before the file is pinned in outside services (Infura, Pinata, Crust)
 */
function addFileToIPFS(path, callback) {
  const alphaNumRegEx = /[a-zA-Z0-9]{22,}/g;

  exec(`ipfs add -Q ${path}`, function (error, stdout, stderr) {
      if (error) {
        console.log(`error: ${error.message}`);
        cid = -1;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        cid = -2;
      }
      const cid = stdout.match(alphaNumRegEx)[0];
      if (cid !== -1 && cid !== -2) pinEverywhere(cid);       // This will start the pinning process
      callback(cid);                                          // File is already added to local repo, we are sending back the CID to front-end
    });
}

async function pinEverywhere(cid) {
  pinToPinata(cid);                                           // Pin to Pinata
  pinToInfura(cid);                                           // Pin to Infura
  crustPin3Times(cid);                                        // Pin to Crust
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function crustPin3Times(cid) {
  console.log("Pinning to Crust...");
  const redundancyCount = 3;
  const tolerance = 2;                                        // Minimum success number
  const maxTry = 3;                                           // Max try for each pin
  let successNum = 0;

  for (let i = 1; i <= redundancyCount; i++) {                // We want to pin it 3 times, we will retry 3 times for each if failed
    let success = false;
    let tryCount = 0;
    do {
      const crust_seed = process.env.CRUST_SEED;              // Get the seed from the blockchain
      const crust = new crustPin(`${crust_seed}`);            // Crust will pin the file on it's IPFS nodes
      success = await crust.pin(cid);
      if (success) successNum++;
      await sleep(1000);
      tryCount++;
    } while (tryCount < maxTry && success === false);
  }
  console.log("Success Num: ", successNum);
  return (successNum >= tolerance);
}

async function pinToInfura(cid) {
  console.log("Pinning to Infura...");
  let success = false;

  const authString = process.env.INFURA_PROJECT_ID + ":" + process.env.INFURA_PROJECT_SECRET;
  const base64 = Buffer.from(authString).toString('base64')
  const auth = 'Basic ' + base64;

  await axios.post(`https://ipfs.infura.io:5001/api/v0/pin/add?arg=${cid}`, {}, { headers: { 'Authorization' : auth } })
    .then((res) => success = true)
    .catch((err) => console.error("Error: ", err));

  if (success) console.log("The file was pinned to Infura");
  else console.error("There was an error while pinning to Infura");
  return success;
}

async function pinToPinata(cid) {
  console.log("Pinning to Pinata...")
  
  const headers = { 
    pinata_api_key: process.env.PINATA_API_KEY, 
    pinata_secret_api_key: process.env.PINATA_API_SECRET,
  };
  const body = {
    hashToPin: cid,
    hostNodes: [
      process.env.LOCAL_IPFS_NODE                             // Because of the hostNodes property, Pinata will know that it should
    ]                                                         // look for the file in our server. Otherwise it would look for it in the whole IPFS network.
  }
  let success = false;

  await axios.post("https://api.pinata.cloud/pinning/pinByHash", body, { headers })
    .then((res) => success = true)
    .catch((err) => console.error(err));


  if (success) console.log("The file was pinned to Pinata");
  else console.error("There was an error while pinning to Pinata");
  return success;
}

module.exports = addFileToIPFS;