const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateEvent = function (data) {
  const errors = {};
  data.name = !isEmpty(data.name) ? data.name : '';
  data.logo = !isEmpty(data.logo) ? data.logo : '';

  if (Validator.isEmpty(data.name)) {
    errors.nameEmpty = 'Nome do evento precisa ser preenchido';
  }

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Nome do evento precisa ter entre 2 e 30 caracteres';
  }

  if (Validator.isEmpty(data.logo)) {
    errors.file = 'Selecione uma imagem para logo do evento';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.validateEditEvent = function (data) {
  const errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Nome do evento precisa ter entre 2 e 30 caracteres';
  }

  if (Validator.isEmpty(data.name)) {
    errors.nameEmpty = 'Nome do evento precisa ser preenchido';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
