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
    email: "1@gmail.com",
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

const findUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/login", (req, res) => {
  // redirect to /urls if user already logged in
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.post("/login", (req, res) => {
  const user = req.body;

  // if user didn't enter email or password
  if (!user.email || !user.password) {
    res.status(400);
    return res.send("Please enter email and password!");
  }

  //if email does not exist in users
  if (!findUserByEmail(user.email)) {
    res.status(403);
    return res.send("Email is not registered!");
  }

  for (const userId in users) {
    // if email and password matches, log in and redirect to /urls
    if (users[userId].email === user.email && users[userId].password === user.password) {
      res.cookie('user_id', users[userId].id);
      return res.redirect("/urls");
    }
  }

  // incorrect password
  res.status(403);
  res.send("Incorrect password. Please try again!");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  // redirect to /urls if user already logged in
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }

  res.render('register');
});

app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if user didn't provide email and password
  if (!email || !password) {
    res.status(400);
    return res.send('Please provide email and password!');
  }

  // if email is already registered
  if (findUserByEmail(email)) {
    res.status(400);
    return res.send('Email is already registered!');
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
});

app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_new', templateVars);
});


app.get("/urls/:id", (req, res) => {

  const id = req.params.id;

  const templateVars = {
    id: id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies['user_id']],
  };
  return res.render('urls_show', templateVars);

});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  for (const urlKey in urlDatabase) {
    if (urlKey === id) {
      const longURL = urlDatabase[id];
      return res.redirect(longURL);
    }
  }

  // show error message if user enter a non-exist url id
  res.status(404);
  res.send("shorten url not found.");
});

app.post("/urls", (req, res) => {
  // if user not logged in, user is not allowed to add shorten url to database
  if (!req.cookies['user_id']) {
    return res.send("Access denied. Please log in before adding new shorten url.");
  }

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});