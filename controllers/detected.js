const handleDetected = db => async (req, res) => {
  const { username, detected } = req.body;

  try {
    let [user] = await db('users')
      .where({ username })
      .update({ detected }, '*');
    res.json(user);
  } catch {
    res.status(400).send('No such user');
  }
};

module.exports = { handleDetected };
