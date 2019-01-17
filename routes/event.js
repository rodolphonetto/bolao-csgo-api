const express = require('express');

const router = express.Router();
const Evento = require('../models/events');
const isEmpty = require('../validation/is-empty');
const validators = require('../validation/events');
const fileDelete = require('../config/file');

// Retornar eventos cadastrados
router.get('/', (req, res) => {
  Evento.find()
    .populate('country')
    .then((events) => {
      if (isEmpty(events)) {
        return res.status(404).json({ msg: 'Nenhum evento encontrado' });
      }
      return res.json(events);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Pesquisa de eventos
router.post('/search-event', (req, res) => {
  const eventName = req.body.name;
  Evento.find({
    name: new RegExp(eventName, 'i'),
  })
    .populate('country')
    .then((events) => {
      if (isEmpty(events)) {
        return res.status(404).json({ msg: 'Nenhum evento encontrado' });
      }
      return res.json(events);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Devolver evento para edição
router.get('/edit-event/:eventoID', (req, res) => {
  const eventoID = req.params.eventoID;
  Evento.findById(eventoID)
    .populate('country')
    .then((evento) => {
      if (!evento) {
        return res.status(404).json({ msg: 'Evento não encontrado' });
      }
      return res.json(evento);
    });
});

// Adicionar/editar novo evento
router.post('/add-event', (req, res) => {
  const eventFields = {};
  const eventID = req.body.eventID;
  if (req.file) eventFields.logo = req.file.filename;
  if (req.body.name) eventFields.name = req.body.name;
  if (req.body.country) eventFields.country = req.body.country;

  Evento.findById(eventID)
    .then((event) => {
      if (event) {
        // Validação
        const { errors, isValid } = validators.validateEditEvent(eventFields);
        if (!isValid) {
          fileDelete.deleteFile(eventFields.logo);
          return res.status(400).json(errors);
        }
        //
        Evento.findOneAndUpdate({ _id: eventID }, { $set: eventFields }, { new: true })
          .then((event) => {
            fileDelete.deleteFile(event.logo);
            res.json(event);
          })
          .catch((err) => {
            fileDelete.deleteFile(eventFields.logo);
            console.log(err);
          });
      } else {
        // Validação
        const { errors, isValid } = validators.validateEvent(eventFields);
        if (!isValid) {
          fileDelete.deleteFile(eventFields.logo);
          return res.status(400).json(errors);
        }
        //
        new Evento(eventFields)
          .save()
          .then(event => res.json(event))
          .catch((err) => {
            fileDelete.deleteFile(eventFields.logo);
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// Deletar evento
router.post('/del-event', (req, res) => {
  const eventID = req.body.eventID;

  Evento.findById(eventID)
    .then((event) => {
      if (!event) {
        return res.status(404).json({ msg: 'Evento não encontrado' });
      }
      fileDelete.deleteFile(event.logo);
      return event
        .remove({ _id: eventID })
        .then(() => res.json({ msg: 'Evento excluido com sucesso' }));
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
