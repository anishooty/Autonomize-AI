const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Create a SQLite database connection
let db = new sqlite3.Database('./github.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the github database.');
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  location TEXT,
  blog TEXT,
  bio TEXT,
  public_repos INTEGER,
  public_gists INTEGER,
  followers INTEGER,
  following INTEGER,
  created_at TEXT,
  deleted INTEGER DEFAULT 0
)`);

// Create table for friends
db.run(`CREATE TABLE IF NOT EXISTS friends (
  user_id INTEGER,
  friend_id INTEGER,
  PRIMARY KEY(user_id, friend_id)
)`);

// Task 1: Accept any GitHub username and save details from the GitHub API into the database.
app.post('/users', (req, res) => {
  const username = req.body.username;

  // Check if the user already exists in the database
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      // User already exists in the database
      res.send('User data already saved in the database');
    } else {
      // User does not exist in the database, fetch data from GitHub API
      try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        const user = response.data;

        db.run(`INSERT INTO users(username, id, location, blog, bio, public_repos, public_gists, followers, following, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.login, user.id, user.location, user.blog, user.bio, user.public_repos, user.public_gists, user.followers, user.following, user.created_at], function (err) {
            if (err) {
              return console.log(err.message);
            }
            res.send('User data saved to the database');
          });
      } catch (error) {
        res.send('Failed to fetch data from GitHub API');
      }
    }
  });
});

// Task 2: For a given user, find all the users where users mutually follow each other and save them as friends.
app.get('/users/:username/friends', (req, res) => {
  const username = req.params.username;

  Promise.all([
    axios.get(`https://api.github.com/users/${username}/following`),
    axios.get(`https://api.github.com/users/${username}/followers`)
  ]).then(([followingResponse, followersResponse]) => {
    const following = followingResponse.data.map(user => user.login);
    const followers = followersResponse.data.map(user => user.login);

    const friends = following.filter(user => followers.includes(user));

    // Save friends to the database
    const userId = db.get('SELECT id FROM users WHERE username = ?', [username]);
    friends.forEach(friend => {
      const friendId = db.get('SELECT id FROM users WHERE username = ?', [friend]);

      // Check if the friendship already exists
      const existingFriendship = db.get('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?', [userId, friendId]);
      if (!existingFriendship) {
        db.run(`INSERT INTO friends(user_id, friend_id) VALUES(?, ?)`, [userId, friendId]);
      }
    });

    res.json(friends);
  }).catch(err => {
    res.send('Failed to fetch data from GitHub API');
  });
});

// Task 3: Search the saved data from the database based on username, location etc.
app.get('/users/search', (req, res) => {
  const { username, location } = req.query;

  let query = 'SELECT * FROM users WHERE 1=1';
  if (username) {
    query += ` AND username LIKE '%${username}%'`;
  }
  if (location) {
    query += ` AND location LIKE '%${location}%'`;
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

// Task 4: Soft delete a record based on a given username from the database.
app.delete('/users/:username', (req, res) => {
  const username = req.params.username;

  db.run('UPDATE users SET deleted = 1 WHERE username = ?', [username], function (err) {
    if (err) {
      return console.log(err.message);
    }
    res.send('User has been soft deleted');
  });
});

// Task 5: Update fields like “location”, “blog”, “bio” etc for a given user in the database.
app.put('/users/:username', (req, res) => {
  const username = req.params.username;
  const { location, blog, bio } = req.body;

  db.run('UPDATE users SET location = ?, blog = ?, bio = ? WHERE username = ?', [location, blog, bio, username], function (err) {
    if (err) {
      return console.log(err.message);
    }
    res.send('User data has been updated');
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
