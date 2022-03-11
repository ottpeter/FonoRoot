const { exec } = require("child_process");

function addFileToIPFS(path) {
  exec(`ipfs add -Q ${path}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return -1;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return -2;
    }
    console.log("stdout:", stdout);
    // If success pinEveryWhere(stdout)
  });
}

module.exports = addFileToIPFS;