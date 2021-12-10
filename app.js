const express = require("express");
const app = express();

app.get('/reviews/*', (req, res) => {
  res.send('Hello world');
})

module.exports = app;