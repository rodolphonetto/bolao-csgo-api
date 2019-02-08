const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateBet = function (data) {
  const errors = {};

  const resultA = !isEmpty(data.resultA) ? data.resultA : '';
  const resultB = !isEmpty(data.resultB) ? data.resultB : '';

  if (Validator.isEmpty(resultA)) {
    errors.resultAEmpty = 'Campo resultado time A em branco, preencha o campo do placar com 0 em caso de derrota';
  }

  if (!Validator.isInt(resultA, { min: 0, max: 99 })) {
    errors.resultAValor = 'Campo resultado time A deve ser preenchido entre 0 e 99';
  }

  if (Validator.isEmpty(resultB)) {
    errors.resultBEmpty = 'Campo resultado time B em branco, preencha o campo do placar com 0 em caso de derrota';
  }

  if (!Validator.isInt(resultB, { min: 0, max: 99 })) {
    errors.resultBValor = 'Campo resultado time B deve ser preenchido entre 0 e 99';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.validateEditBet = function (data) {
  const errors = {};

  const resultA = !isEmpty(data.resultA) ? data.resultA : '';
  const resultB = !isEmpty(data.resultB) ? data.resultB : '';

  if (Validator.isEmpty(resultA)) {
    errors.resultAEmpty = 'Campo resultado time A em branco, preencha o campo do placar com 0 em caso de derrota';
  }

  if (!Validator.isInt(resultA, { min: 0, max: 99 })) {
    errors.resultAEmpty = 'Campo resultado time A deve ser preenchido entre 0 e 99';
  }

  if (Validator.isEmpty(resultB)) {
    errors.resultBEmpty = 'Campo resultado time B em branco, preencha o campo do placar com 0 em caso de derrota';
  }

  if (!Validator.isInt(resultB, { min: 0, max: 99 })) {
    errors.resultBEmpty = 'Campo resultado time B deve ser preenchido entre 0 e 99';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
