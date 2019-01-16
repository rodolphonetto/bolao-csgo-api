const Validator = require('validator')
const isEmpty = require('./is-empty')

exports.validateMatch = function (data) {
	let errors = {}

	data.desc = !isEmpty(data.desc) ? data.desc : ''

	if (Validator.isEmpty(data.desc)) {
		errors.descEmpty = 'A descrição da partida precisa ser preenchida'
	}
	
	if (!Validator.isLength(data.desc, {min: 2, max: 30})) {
		errors.name = 'A descrição da partida precisa ter entre 2 e 30 caracteres'
	}
	
	return {
		errors,
		isValid: isEmpty(errors)
	}
}