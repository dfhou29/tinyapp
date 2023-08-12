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

module.exports = {
  urlDatabase,
  users,
  visitCount,
  uniqueVisit,
  visitRecord,
};