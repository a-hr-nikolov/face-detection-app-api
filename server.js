const express = require('express');
const crypto = require('crypto');

const app = express();
class User {
  static createdCount = 0;
  constructor(name, password) {
    this.id = ++User.createdCount;
    this.name = name;
    this.password = password;
    this.facesDetected = 0;
    this.registrationDate = new Date();
  }
}
const database = {
  users: [new User('Jonkata', 'strongestpass')],
};

app.use(express.json());

app.get('/', (req, res) => {
  res.send('This is working');
});

app.get('/profile/:userId', (req, res) => {
  res.send(req.params);
});

app.post('/signin', (req, res) => {
  const { name, password } = req.body;
  const reqUser = database.users.find(user => user.name === name);
  if (reqUser && reqUser.password === password) res.json('Success');
  else res.json('Failure');
});

app.post('/register', (req, res) => {
  console.log(req.body);
  res.send('Suxes');
});

app.put('/detected', (req, res) => {
  console.log(req.body);
  res.send('gotit');
});

app.listen(3000);

/* 

Routes:
/ - get, responds with "Successful";
/signin - post, responds with success/fail
/register - post, responds with the new user object
/profile/:userId - GET = user
/tracked - PUT/PATCH - updates the user with increased count, returns the updated user/count

*/
