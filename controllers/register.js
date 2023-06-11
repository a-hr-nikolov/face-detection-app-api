const handleRegister = (db, argon2) => async (req, res) => {
  const { username, password } = req.body;
  if (username === '')
    return res.status(409).json('Empty username/password not allowed');

  try {
    await db.transaction(async trx => {
      const [entry] = await trx('users').insert(
        {
          username: username,
          joined: new Date(),
        },
        '*'
      );
      try {
        const passHash = await argon2.hash(password);
        await trx('login').insert({
          username: username,
          hash: passHash,
        });
      } catch (err) {
        throw { code: 500, message: 'Hash fail' };
      }

      res.json(entry);
    });
  } catch (err) {
    if (err.code === 500)
      return res.status(500).json({ error: 'Internal Server Error' });
    return res.status(409).json({ error: 'Username is already taken' });
  }
};

module.exports = { handleRegister };
