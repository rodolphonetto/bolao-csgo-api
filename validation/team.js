const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateTeam = function (data) {
  const errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.logo = !isEmpty(data.logo) ? data.logo : '';

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Nome do time está em branco';
  }

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Nome do time precisa ter entre 2 e 30 caracteres';
  }

  if (Validator.isEmpty(data.logo)) {
    errors.file = 'Selecione uma imagem para o logotipo do time';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.validateEditTeam = function (data) {
  const errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Nome do time está em branco';
  }

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Nome do time precisa ter entre 2 e 30 caracteres';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
