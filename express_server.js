const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const PORT = 8080;

const app = express();

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  }
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

const urlsForUser = (id) => {
  const urls = {};
  for (const urlKey in urlDatabase) {
    if (urlDatabase[urlKey].userID === id) {
      urls[urlKey] = {
        longURL: urlDatabase[urlKey].longURL,
        userID: urlDatabase[urlKey].userID,
      }
    }
  }

  return urls;
}

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
  if (!req.cookies['user_id']) {
    res.status(403);
    return res.send("Please log in first!");
  }

  // filter url database entries to only show what logged user created
  const filterUrls = urlsForUser(req.cookies['user_id']);
  const templateVars = {
    urls: filterUrls,
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

  if (!req.cookies['user_id']) {
    res.status(403);
    return res.send("Please log in first!");
  }

  // url id
  const id = req.params.id;

  // filter url database entries to only show what logged user created
  const filterUrls = urlsForUser(req.cookies['user_id']);

  for (const urlId in filterUrls) {
    if (urlId === id) {
      const templateVars = {
        id: id,
        longURL: filterUrls[req.params.id].longURL,
        user: users[req.cookies['user_id']],
      };
      return res.render('urls_show', templateVars);
    }
  }
  console.log(filterUrls);
  res.status(403);
  res.send("Access denied. Please log in associated account to view this url.");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  for (const urlKey in urlDatabase) {
    if (urlKey === id) {
      const longURL = urlDatabase[id].longURL;
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

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies['user_id'],
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:id/delete", (req, res) => {

  // check if user is logged in
  if (!req.cookies['user_id']) {
    res.status(403);
    return res.send("Please log in first!");
  }

  // url id
  const id = req.params.id;

  //check if id exist
  for (const urlId in urlDatabase) {
    if (id === urlId) { // id found in database

      if (urlDatabase[urlId].userID === req.cookies['user_id']) { // user id match, perform delete

        delete urlDatabase[req.params.id];
        return res.redirect("/urls");

      } else { // id found but user id not match, refuse update

        res.status(403);
        return res.send("Access denied. Please log in associated account to update this url");

      }
    }
  }

  res.status(404);
  res.send("Please enter an valid shorten url");

});

app.post("/urls/:id", (req, res) => {
  // check if user is logged in
  if (!req.cookies['user_id']) {
    res.status(403);
    return res.send("Please log in first!");
  }

  // url id
  const id = req.params.id;

  //check if id exist
  for (const urlId in urlDatabase) {
    if (id === urlId) { // id found in database

      if (urlDatabase[urlId].userID === req.cookies['user_id']) { // user id match, perform update

        urlDatabase[id].longURL = req.body.longURL;
        return res.redirect("/urls");

      } else { // id found but user id not match, refuse update

        res.status(403);
        return res.send("Access denied. Please log in associated account to update this url");

      }
    }
  }

  // id not found in database
  res.status(404);
  res.send("Please enter an valid shorten url");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});