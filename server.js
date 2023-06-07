const express = require('express');
const argon2 = require('argon2');

const app = express();
class User {
  static createdCount = 0;
  constructor(name, passHash) {
    this.id = (++User.createdCount).toString().padStart(8, '0');
    this.name = name;
    this.passHash = passHash;
    this.facesDetected = 0;
    this.registrationDate = new Date();
  }
}

const database = {
  users: [],
};

argon2.hash('strongestpass').then(hash => {
  database.users.push(new User('Jonkata', hash));
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('This is working');
});

app.get('/profile/:user', (req, res) => {
  const name = req.params.user;
  const reqUser = database.users.find(user => user.name === name);
  if (reqUser) res.json(reqUser);
  else res.status(404).json('No such user');
});

app.post('/signin', async (req, res) => {
  const { name, password } = req.body;
  const reqUser = database.users.find(user => user.name === name);
  const hashVerified = await argon2.verify(reqUser?.passHash, password);
  if (hashVerified) res.json({ status: 'Success', object: reqUser });
  else res.status(400).json('Login Failed');
});

app.post('/register', async (req, res) => {
  const { name, password } = req.body;
  if (database.users.some(item => item.name === name))
    res.json('Account Name Already Taken');
  else {
    const passHash = await argon2.hash(password);
    const newUser = new User(name, passHash);
    database.users.push(newUser);
    res.json(newUser);
  }
});

app.put('/detected', (req, res) => {
  const { name, facesDetected } = req.body;
  const reqUser = database.users.find(user => user.name === name);
  if (reqUser) {
    reqUser.facesDetected += facesDetected;
    res.json(reqUser);
  } else res.status(400).send('No such user');
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
