const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateUser = function (data, pass, pass2) {
  const errors = {};
  data.username = !isEmpty(data.username) ? data.username : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  pass = !isEmpty(pass) ? pass : '';
  pass2 = !isEmpty(pass2) ? pass2 : '';

  if (!Validator.isLength(data.username, { min: 3, max: 30 })) {
    errors.username = 'Nome de usuario precisa ter entre 2 e 30 caracteres';
  }

  if (!Validator.isLength(pass, { min: 6, max: 30 })) {
    errors.password = 'Senha precisa ter entre 6 e 30 caracteres';
  }

  if (!Validator.equals(pass, pass2)) {
    errors.password = 'O campo senha e confirmação precisam ser iguais.';
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = 'Use um email valido';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
