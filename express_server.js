const express = require('express');

const PORT = 8080;

const app = express();

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.send('Hello');
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get("/hello", (req, res) => {
  const templateVar = {greeting: 'Hello world!'};
  res.render('hello_world', templateVar)  ;
});
//
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a: ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});