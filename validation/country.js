const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateCountry = function (data) {
  const errors = {};
  data.name = !isEmpty(data.name) ? data.name : '';
  data.flag = !isEmpty(data.flag) ? data.flag : '';

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Nome de pais precisa ser preenchido';
  }

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Nome do pais precisa ter entre 2 e 30 caracteres';
  }

  if (Validator.isEmpty(data.flag)) {
    errors.file = 'Selecione uma imagem para bandeira do pais';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.validateEditCountry = function (data) {
  const errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Nome do pais precisa ter entre 2 e 30 caracteres';
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Nome de pais precisa ser preenchido';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
