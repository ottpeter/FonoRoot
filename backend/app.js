const express = require('express');
const app = express();

var uploadRoutes = require('./routes/upload.js');

app.get('/', function (req, res) {
  res.send("Hello World!");
});

// Routes
app.use('/upload', uploadRoutes);

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});