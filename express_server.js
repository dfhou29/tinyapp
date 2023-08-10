const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const PORT = 8080;

const app = express();

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  edj3fl: {
    id: "edj3fl",
    email: "1@gamil.com",
    password: "123",
  },
  ekf94j: {
    id: "ekf94j",
    email: "2@yahoo.com",
    password: "345",
  },
};

// generate a random string with length of 6
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/login", (req, res) => {
  const user = req.body;

  for (const userId in users) {
    // check if email and password matches
    if (users[userId].email === user.email && users[userId].password === user.password) {
      res.cookie('user_id', users[userId].id);
      return res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render('register');
})

app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if user didn't provide username and password
  if (!email || !password) {
    return res.send('Please provide email and password!');
  }

  // if email is already registered
  for (const userId in users) {
    if (users[userId].email === email) {
      return res.send("Email is already registered!");
    }
  }

  // happy path: user provide email and password
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };
  console.log(users);
  res.cookie('user_id', userId);
  res.redirect("/urls");
})

app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_new', templateVars);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies['user_id']],
  };
  res.render('urls_show', templateVars);
});

// app.get("/u/:id", (req, res) => {
//   const longURL = urlDatabase[req.params.id];
//   res.redirect(longURL);
// });

app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});




// app.get("/hello", (req, res) => {
//   const templateVar = {greeting: 'Hello world!'};
//   res.render('hello_world', templateVar)  ;
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});