const express = require("express");
const db = require('./db/db.js')
const app = express();

app.get('/reviews/*', (req, res) => {
  res.send('Hello world');
})

module.exports = app;