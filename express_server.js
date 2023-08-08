const express = require('express');
const morgan = require('morgan');
const PORT = 8080;

const app = express();

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate a random string with length of 6
function generateRandomString() {
  const alphabets = 'abcdefghijklmnopqrstuvwxyz';
  let randomString = '';
  for (let x = 0; x < 6; x++) {
    randomString += alphabets[Math.floor(Math.random() * (25 + 1))];
  }
  return randomString;
}

app.set('view engine', 'ejs');

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send('Hello');
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new');
})

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send('OK');
})

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  }
  res.render('urls_show', templateVars);
})


// app.get("/hello", (req, res) => {
//   const templateVar = {greeting: 'Hello world!'};
//   res.render('hello_world', templateVar)  ;
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});