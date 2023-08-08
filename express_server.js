const express = require('express');

const PORT = 8080;

const app = express();

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render('pages/index');
});

app.get("/urls/json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a: ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});