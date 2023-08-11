
// generate random string
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

// find associated user in database with provided email
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

// find associated url with provided user_id
const urlsForUser = (id, database) => {
  const urls = {};
  for (const urlKey in database) {
    if (database[urlKey].userID === id) {
      urls[urlKey] = {
        longURL: database[urlKey].longURL,
        userID: database[urlKey].userID,
      };
    }
  }

  return urls;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
};