const express = require("express");
const app = express();
const storage = require('./db/storage.js')

app.get('/reviews/*', (req, res) => {
  res.send('Hello world');
});

storage.createAndPopulateDBS();


module.exports = app;