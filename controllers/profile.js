const handleProfileRequest = db => async (req, res) => {
  const username = req.params.user;

  try {
    let [user] = await db('users').select('*').where({ username });
    res.json(user);
  } catch {
    res.status(404).json("Couldn't get the requested user");
  }
};

module.exports = { handleProfileRequest };
