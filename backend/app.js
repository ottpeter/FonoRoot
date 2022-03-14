const express = require('express');
const app = express();
const uploadRoutes = require('./routes/upload.js');

// CORS (we allow everything)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/', function (req, res) {
  res.send("Hello World!");
});

// Routes
app.use('/upload', uploadRoutes);

app.listen(3000, function () {
  console.log("IPFS pinner app listening on port 3000!");
});