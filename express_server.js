const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {generateRandomString, findUserByEmail, urlsForUser} = require('./helpers');

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
    password: "$2a$10$Iwp5pZfRnm4zXqVYpLR.6.xhQ0CDPWnDAXGgSy9tn5V7vK1Egbhkq",
  },
  ekf94j: {
    id: "ekf94j",
    email: "2@yahoo.com",
    password: "$2a$10$Zk7zCiesyUEE4N3eaEDsn.DqU.eYTRPnrkTOQcnJGEdbFBm1n5I1i",
  },
};

// create cookie object to store shorten url view count
const visitCount = {

};

// create cookie object to store all unique visitor id
const uniqueVisit = {

};

// create cookie object to store all view activities (visitor and registered users)
const visitRecord = {

};

// view engine
app.set('view engine', 'ejs');

// middlewares
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['cookie'],
  maxAge: 12 * 60 * 60 * 60 // session expires after 12 hours
}));

// user authentication
app.get("/login", (req, res) => {

  // redirect to /urls if user already logged in
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.post("/login", (req, res) => {

  // get request body
  const user = req.body;

  // if user didn't enter email or password
  if (!user.email || !user.password) {
    res.status(400);
    return res.send("Please enter email and password!");
  }

  //if email does not exist in users
  if (!findUserByEmail(user.email, users)) {
    res.status(401);
    return res.send("Email is not registered!");
  }

  for (const userId in users) {
    // if email and password matches, log in and redirect to /urls
    if (users[userId].email === user.email && bcrypt.compareSync(user.password, users[userId].password)) {
      // use_ instead of camelcase for readability (intentional eslint error)
      req.session.user_id = users[userId].id;
      return res.redirect("/urls");
    }
  }

  // incorrect password
  res.status(401);
  res.send("Incorrect password. Please try again!");
});

app.get("/register", (req, res) => {

  // redirect to /urls if user already logged in
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  res.render('register');
});

app.post("/register", (req,res) => {

  // get email and password for req body
  const email = req.body.email;
  // hash password
  const password = bcrypt.hashSync(req.body.password, 10);

  // if user didn't provide email and password
  if (!email || !password) {
    res.status(400);
    return res.send('Please provide email and password!');
  }

  // if email is already registered
  if (findUserByEmail(email, users)) {
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

  // redirect to /login for user to test out new account
  res.redirect("/login");
});

app.post("/logout", (req, res) => {

  req.session.user_id = null;
  res.redirect("/login");
});

// content request
app.get("/urls", (req, res) => {

  // if no session found
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  // filter url database entries to only show what logged user created
  const filterUrls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: filterUrls,
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {

  // if no session found
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {

  // if no session found
  if (!req.session.user_id) {
    res.status(401);
    return res.send("Please log in first!");
  }

  // url id
  const id = req.params.id;


  // filter url database entries to only show what logged user created
  const filterUrls = urlsForUser(req.session.user_id, urlDatabase);

  for (const urlId in filterUrls) {
    if (urlId === id) {
      const templateVars = {
        id: id,
        longURL: filterUrls[req.params.id].longURL,
        user: users[req.session.user_id],
        visitCount: (visitCount[id] || 0), // if visitCount[id] is undefined, use 0
        uniqueVisit: (uniqueVisit[id] || 'no one yet.'),
        visitRecord: (visitRecord[id] || ''),
      };
      return res.render('urls_show', templateVars);
    }
  }

  // url belongs to another user
  res.status(401);
  res.send("Access denied. Please log in associated account to view this url.");
});

app.get("/u/:id", (req, res) => {

  const id = req.params.id;

  // check for matching shorten url in database
  for (const urlKey in urlDatabase) {
    if (urlKey === id) {
      const longURL = urlDatabase[id].longURL;

      // for visitCount
      // visitCount[id]++ when user clicks on the shorten url link (refresh required)
      visitCount[id] = (visitCount[id] || 0) + 1;


      if (!uniqueVisit[id]) {
        uniqueVisit[id] = [];
      }

      // create cookie object to store all view activities (visitor and registered users)
      if (!visitRecord[id]) {
        visitRecord[id] = {};
      }

      let visitorId = '';

      if (req.session.user_id) { // visitor is a register user

        if (!uniqueVisit[id].includes(`User: ${users[req.session.user_id].email}`)) { // registered user hasn't visited before
          uniqueVisit[id].push(`User: ${users[req.session.user_id].email}`); // add registered user to uniqueVisit[id]
          visitRecord[id][new Date().toString()] = `User: ${users[req.session.user_id].email}`;
        } else {
          visitRecord[id][new Date().toString()] = `User: ${users[req.session.user_id].email}`;
        }

      } else { // visitor has not been registered
          visitorId = generateRandomString();
          uniqueVisit[id].push(`Visitor: ${visitorId}`);
          visitRecord[id][new Date().toString()] = `Visitor: ${visitorId}`;
      }


      return res.redirect(longURL);
    }
  }

  // show error message if user enter a non-exist url id
  res.status(404);
  res.send("shorten url not found.");
});

// content modification
app.post("/urls", (req, res) => {

  // if user not logged in, user is not allowed to add shorten url to database
  if (!req.session.user_id) {
    return res.send("Access denied. Please log in before adding new shorten url.");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.user_id,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.delete("/urls/:id", (req, res) => {

  // check if user is logged in
  if (!req.session.user_id) {
    res.status(403);
    return res.send("Please log in first!");
  }

  // url id
  const id = req.params.id;

  //check if id exist
  for (const urlId in urlDatabase) {
    if (id === urlId) { // id found in database

      if (urlDatabase[urlId].userID === req.session.user_id) { // user id match, perform delete

        delete urlDatabase[req.params.id];
        return res.redirect("/urls");

      } else { // id found but user id not match, refuse update

        res.status(403);
        return res.send("Access denied. Please log in associated account to update this url");

      }
    }
  }

  // invalid url
  res.status(400);
  res.send("Please enter an valid shorten url");

});

app.put("/urls/:id", (req, res) => {

  // check if user is logged in
  if (!req.session.user_id) {
    res.status(401);
    return res.send("Please log in first!");
  }

  // url id
  const id = req.params.id;

  //check if id exist
  for (const urlId in urlDatabase) {
    if (id === urlId) { // id found in database

      if (urlDatabase[urlId].userID === req.session.user_id) { // user id match, perform update

        urlDatabase[id].longURL = req.body.longURL;
        return res.redirect("/urls");

      } else { // id found but user id not match, refuse update

        res.status(401);
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