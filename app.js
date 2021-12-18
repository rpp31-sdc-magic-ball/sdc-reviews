const express = require("express");
const app = express();
const storage = require('./db/storage.js')

storage.createAndPopulateTables();

app.get('/reviews/*', (req, res) => {
  res.send('Hello world');
});


module.exports = app;