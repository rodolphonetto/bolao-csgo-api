const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const rawToken = req.get('Authorization');
  if (!rawToken) {
    res.status(401).json({ msg: 'Você não tem autorização para acessar essa area' });
  }
  const token = rawToken.split(' ')[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  } catch (err) {
    return res.status(404).json({ msg: 'Você não tem autorização para acessar essa area' });
  }

  if (!decodedToken) {
    return res.status(401).json({ msg: 'Você não tem autorização para acessar essa area' });
  }
  req.userId = decodedToken.userid;
  req.username = decodedToken.username;
  req.email = decodedToken.email;
  next();
};
