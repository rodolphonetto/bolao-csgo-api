const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateBet = function (data) {
  const errors = {};

  const resultA = !isEmpty(data.resultA) ? data.resultA : '';
  const resultB = !isEmpty(data.resultB) ? data.resultB : '';

  if (Validator.isEmpty(resultA)) {
    errors.result = 'Campo resultado time A em branco, preencha o campo do placar com 00 em caso de derrota';
  }

  if (!Validator.isLength(resultA, { min: 1, max: 2 })) {
    errors.result = 'O placar precisa ter dois digitos (16x00, 16x09)';
  }

  if (Validator.isEmpty(resultB)) {
    errors.result = 'Campo resultado time B em branco, preencha o campo do placar com 00 em caso de derrota';
  }

  if (!Validator.isLength(resultB, { min: 1, max: 2 })) {
    errors.result = 'O placar precisa ter dois digitos (16x00, 16x09)';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
