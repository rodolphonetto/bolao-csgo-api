const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validaTeam(data) {
	let errors = {}

	data.name = !isEmpty(data.name) ? data.name : ''
	data.file = !isEmpty(data.file) ? data.file : ''
	
	if (Validator.isEmpty(data.name)) {
		errors.nameEmpty = 'Nome do time está em branco'
	}
	
	if (!Validator.isLength(data.name, {min: 2, max: 30})) {
		errors.name = 'Nome do time precisa ter entre 2 e 30 caracteres'
	}

	if (Validator.isEmpty(data.file)) {
		errors.file = 'Selecione uma imagem para o logotipo do time'
	}


	return {
		errors,
		isValid: isEmpty(errors)
	}

}