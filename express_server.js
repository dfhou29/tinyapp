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

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  }
  res.render('urls_show', templateVars);
})

app.get("/hello", (req, res) => {
  const templateVar = {greeting: 'Hello world!'};
  res.render('hello_world', templateVar)  ;
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});