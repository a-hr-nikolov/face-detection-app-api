const handleSignin = (db, argon2) => async (req, res) => {
  const { username, password } = req.body;

  try {
    let [user] = await db('login').select('*').where({ username });

    const hashVerified = await argon2.verify(user.hash, password);
    if (!hashVerified) throw 'Wrong credentials';

    [user] = await db('users').select('*').where({ username });

    res.json(user);
  } catch (err) {
    return res.status(400).json('Wrong credentials, try again.');
  }
};

module.exports = { handleSignin };
