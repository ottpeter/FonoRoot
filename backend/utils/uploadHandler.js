const path = require("path");
const addFileToIPFS = require('../utils/ipfs');
const allowedImage = ['.png','.jpg','.jpeg'];
const allowedMusic = ['.mp3'];

function uploadHandler(req, res, fileType) {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.myFile;
  const filePath = process.cwd() + "/files/" + file.name;
  const extensionName = path.extname(file.name);                                    // Fetch the file extension
  if (fileType === "image") {
    if(!allowedImage.includes(extensionName)){
      return res.status(422).send("Invalid Image");
    }
  }
  if (fileType === "music") {
    if(!allowedMusic.includes(extensionName)) {
      return res.status(422).send("Invalid Music");
    }
  }

  file.mv(filePath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    addFileToIPFS(filePath);                                                        // This function will call pinEverywhere
    return res.send({ status: "success", path: filePath });
  });
}

module.exports = uploadHandler;