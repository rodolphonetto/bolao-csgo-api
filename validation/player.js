const Validator = require('validator')
const isEmpty = require('./is-empty')

exports.validatePlayer = function (data) {
	let errors = {}
	data.name = !isEmpty(data.name) ? data.name : ''
	data.photo = !isEmpty(data.photo) ? data.photo : ''

	if (Validator.isEmpty(data.name)) {
		errors.nameEmpty = 'Nome do jogador precisa ser preenchido'
	}
	
	if (!Validator.isLength(data.name, {min: 2, max: 30})) {
		errors.name = 'Nome do jogador precisa ter entre 2 e 30 caracteres'
	}
	
	if (Validator.isEmpty(data.photo)) {
		errors.file = 'Selecione uma imagem para foto do jogador'
	}

	return {
		errors,
		isValid: isEmpty(errors)
	}
}


exports.validateEditPlayer = function (data) {
	let errors = {}

	data.name = !isEmpty(data.name) ? data.name : ''
	
	if (!Validator.isLength(data.name, {min: 2, max: 30})) {
		errors.name = 'Nome do jogador precisa ter entre 2 e 30 caracteres'
	}
	
	if (Validator.isEmpty(data.name)) {
		errors.nameEmpty = 'Nome do jogador precisa ser preenchido'
	}

	return {
		errors,
		isValid: isEmpty(errors)
	}
}