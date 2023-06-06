const express = require('express');
const crypto = require('crypto');

const app = express();
class User {
  static createdCount = 0;
  constructor(name, password) {
    this.id = (++User.createdCount).toString().padStart(8, '0');
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

app.get('/profile/:user', (req, res) => {
  const name = req.params.user;
  const reqUser = database.users.find(user => user.name === name);
  res.json(reqUser);
});

app.post('/signin', (req, res) => {
  const { name, password } = req.body;
  const reqUser = database.users.find(user => user.name === name);
  if (reqUser && reqUser.password === password)
    res.json({ status: 'Success', object: reqUser });
  else res.json('Failure');
});

app.post('/register', (req, res) => {
  const { name, password } = req.body;
  if (database.users.some(item => item.name === name))
    res.json('Notgonnahappen');
  else {
    const newUser = new User(name, password);
    database.users.push(newUser);
    res.json(newUser);
  }
});

app.put('/detected', (req, res) => {
  const { name, facesDetected } = req.body;
  const reqUser = database.users.find(user => user.name === name);
  reqUser.facesDetected += facesDetected;
  res.json(reqUser);
});

app.listen(3000);

/* 

Routes:
/ - get, responds with "Successful";
/signin - post, responds with success/fail
/register - post, responds with the new user object
/profile/:userId - GET = user
/detected - PUT/PATCH - updates the user with increased count, returns the updated user/count

*/
