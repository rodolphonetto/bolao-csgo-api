const express = require('express');
const isAuth = require('../config/is-auth');

const router = express.Router();
const Country = require('../models/country');
const validators = require('../validation/country');
const isEmpty = require('../validation/is-empty');
const fileDelete = require('../config/file');

const ITEMS_PER_PAGE = 12;

let oldImage;

// Rota que devolve os paises
router.get('/', isAuth, (req, res) => {
  const page = +req.query.page;

  let totalItens;
  Country.find()
    .countDocuments()
    .then((numCountries) => {
      totalItens = numCountries;
      return Country.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((countries) => {
      if (isEmpty(countries)) {
        return res.status(404).json({ msg: 'Nenhum país encontrado' });
      }
      return res.json({
        countries,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItens,
        hasPrevPage: page - 1 > 0,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItens / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Função busca de países
router.post('/search-country', isAuth, (req, res) => {
  const countryName = req.body.countryName;
  Country.find({
    name: new RegExp(countryName, 'i'),
  })
    .then((countries) => {
      if (isEmpty(countries)) {
        return res.status(404).json({ msg: 'Nenhum país encontrado' });
      }
      return res.json(countries);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Rota que adiciona um novo pais
router.post('/add-country', isAuth, (req, res) => {
  const countryFields = {};
  const countryID = req.body.countryID;
  if (req.body.name) countryFields.name = req.body.name;
  if (req.file) countryFields.flag = req.file.filename;

  Country.findById(countryID).then((country) => {
    if (country) {
      oldImage = country.flag;
      // Validação
      const { errors, isValid } = validators.validateEditCountry(countryFields);
      if (!isValid) {
        if (countryFields.flag) {
          fileDelete.deleteFile(countryFields.flag);
        }
        console.log(errors);
        return res.status(400).json(errors);
      }
      //
      Country.findOneAndUpdate({ _id: countryID }, { $set: countryFields }, { new: true })
        .then((country) => {
          if (countryFields.flag) {
            fileDelete.deleteFile(oldImage);
          }
          res.json(country);
        })
        .catch((err) => {
          fileDelete.deleteFile(countryFields.flag);
          console.log(err);
        });
    } else {
      Country.findOne({ name: countryFields.name }).then((country) => {
        if (country) {
          return res.status(400).json({ name: 'Nome de país já cadastrado' });
        }
        // Validação
        const { errors, isValid } = validators.validateCountry(countryFields);
        if (!isValid) {
          if (countryFields.flag) {
            fileDelete.deleteFile(countryFields.flag);
          }
          return res.status(400).json(errors);
        }
        //
        new Country(countryFields)
          .save()
          .then(result => res.json(result))
          .catch((err) => {
            fileDelete.deleteFile(countryFields.flag);
            console.log(err);
          });
      });
    }
  });
});

// Rota devolve pais para edição
router.get('/edit-country/:countryID', isAuth, (req, res) => {
  const countryID = req.params.countryID;
  Country.findById(countryID)
    .then((country) => {
      if (!country) {
        return res.status(404).json({ msg: 'Pais não encontrado' });
      }
      return res.json(country);
    })
    .catch(err => console.log(err));
});

// Rota que deleta um país
router.put('/del-country/:countryID', isAuth, (req, res) => {
  const countryID = req.params.countryID;
  Country.findById(countryID)
    .then((country) => {
      if (!country) {
        return res.status(404).json({ msg: 'Pais não encontrado' });
      }
      fileDelete.deleteFile(country.flag);
      Country.remove({ _id: countryID }).then(() => res.json({ msg: 'Pais excluido com sucesso', countryID }));
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
