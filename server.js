const express = require('express');
const argon2 = require('argon2');
const cors = require('cors');

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

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json('Connection established');
});

app.get('/profile/:user', (req, res) => {
  const name = req.params.user;
  const reqUser = database.users.find(user => user.name === name);

  if (reqUser) res.json(reqUser);
  else res.status(404).json("The requested user doesn't exist.");
});

app.post('/signin', async (req, res) => {
  const { name, password } = req.body;
  const reqUser = database.users.find(user => user.name === name);
  if (!reqUser)
    return res.status(404).json("This username doesn't exist in our database.");

  const hashVerified = await argon2.verify(reqUser?.passHash, password);
  if (hashVerified) res.json({ status: 'Success', object: reqUser });
  else res.status(400).json('Wrong Password');
});

app.post('/register', async (req, res) => {
  const { name, password } = req.body;

  if (database.users.some(item => item.name === name))
    res.json('Account Name Already Taken');
  else {
    try {
      const passHash = await argon2.hash(password);
      const newUser = new User(name, passHash);
      database.users.push(newUser);
      res.json(newUser);
    } catch {
      res.json('Problem occurred, please try again!');
    }
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
