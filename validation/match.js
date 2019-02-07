const Validator = require('validator');
const isEmpty = require('./is-empty');

exports.validateMatch = function (data) {
  const errors = {};

  const desc = !isEmpty(data.desc) ? data.desc : '';
  const teamA = !isEmpty(data.teamA) ? data.teamA : '';
  const teamB = !isEmpty(data.teamB) ? data.teamB : '';

  if (Validator.isEmpty(desc)) {
    errors.desc = 'A descrição da partida precisa ser preenchida';
  }

  if (Validator.isEmpty(teamA)) {
    errors.teamA = 'Time A precisa ser preenchido';
  }

  // TODO verificar questão dos numeros que da b.o com o Validator
  if (Validator.isEmpty(teamB)) {
    errors.teamB = 'Time B precisa ser preenchido';
  }

  if (!Validator.isLength(desc, { min: 2, max: 30 })) {
    errors.desc = 'A descrição da partida precisa ter entre 2 e 30 caracteres';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.validateEditMatch = function (data) {
  const errors = {};

  const desc = !isEmpty(data.desc) ? data.desc : '';

  if (Validator.isEmpty(desc)) {
    errors.desc = 'Campo descrição está em branco';
  }

  if (!Validator.isLength(desc, { min: 2, max: 30 })) {
    errors.desc = 'A descrição precisa ter entre 2 e 30 caracteres';
  }

  if (!Validator.isInt(data.resultA, { min: 0, max: 99 })) {
    errors.resultAEmpty = 'Campo resultado time A deve ser preenchido entre 0 e 99';
  }

  if (!Validator.isInt(data.resultB, { min: 0, max: 99 })) {
    errors.resultBEmpty = 'Campo resultado time B deve ser preenchido entre 0 e 99';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
