const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const isAuth = require('../config/is-auth');

const router = express.Router();
const User = require('../models/user');
const validators = require('../validation/user');

// Login
router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ userNotFound: 'Usuario não encontrado' });
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        return res.status(401).json({ wrongPassword: 'Senha incorreta' });
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          username: loadedUser.username,
          userid: loadedUser._id.toString(),
          userAdmin: loadedUser.admin,
        },
        '!@#AquiNaoJaoAquiEProtegidoPorqueEuCrieiUmSegredoGrandePorqueONegocioDiziaQueEraFraco!@#',
        { expiresIn: '1h' },
      );
      res.status(200).json({ token });
    })
    .catch(err => console.log(err));
});

// Adicionar novo usuario
router.post('/signup', (req, res) => {
  const userFields = {};
  if (req.body.username) userFields.username = req.body.username;
  if (req.body.email) userFields.email = req.body.email;
  const pass = req.body.password;
  const pass2 = req.body.password2;

  // Validação
  const { errors, isValid } = validators.validateUser(userFields, pass, pass2);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  bcrypt
    .hash(pass, 12)
    .then((hashedPass) => {
      userFields.password = hashedPass;
      User.findOne({ email: userFields.email, username: userFields.username }).then((user) => {
        if (user) {
          return res.status(400).json({ username: 'Email ou nome de usuario já está cadastrado' });
        }
        new User(userFields)
          .save()
          .then(() => res.json({ msg: 'Usuario cadastrado com sucesso!!' }))
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch(err => console.log(err));
});

// Deletar usuario
router.post('/del-user', isAuth, (req, res) => {
  const userID = req.body.userID;

  User.findById(userID)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ msg: 'Usuario não encontrado' });
      }
      User.remove({ _id: userID }).then(() => res.json({ msg: 'Usuario excluido com sucesso' }));
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
