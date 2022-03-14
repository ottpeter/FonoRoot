const express = require('express');
const fileUpload = require("express-fileupload");
const path = require("path");

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