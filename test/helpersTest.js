const {findUserByEmail, urlsForUser} = require('../helpers');

const assert = require('chai').assert;

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  }
};

describe('Test for findUserByEmail', () => {

  it('should return a user with valid email.', () => {
    const actualUserId = findUserByEmail('user@example.com', testUsers).id;
    const expectedUserId = 'userRandomID';

    assert.equal(actualUserId, expectedUserId);
  });

  it('should return null user object with invalid email.', () => {
    const actualUser = findUserByEmail('user1@example.com', testUsers);
    const expectedUser = null;

    assert.equal(actualUser, expectedUser);
  });

});

describe('Test for urlsForUser', () => {

  it('should return url with associated userId in database with valid userId', () => {
    const actualUrl = urlsForUser('userRandomID', testDatabase);
    const expectedUrl = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID",
      }
    };

    assert.deepEqual(actualUrl, expectedUrl);
  });

  it('should return empty object with invalid userId', () => {
    const actualUrl = urlsForUser('user3RandomID', testDatabase);
    const expectedUrl = {};

    assert.deepEqual(actualUrl, expectedUrl);
  });
});

