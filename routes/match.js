const express = require('express');

const router = express.Router();
const Match = require('../models/match');
const validators = require('../validation/match');
const isEmpty = require('../validation/is-empty');

// Retornar partidas cadastrados
router.get('/', (req, res) => {
  Match.find()
    .then((matches) => {
      if (isEmpty(matches)) {
        return res.status(404).json({ msg: 'Nenhum time encontrado' });
      }
      return res.json(matches);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Pesquisa de partidas
router.post('/search-match', (req, res) => {
  const matchName = req.body.matchName;
  Match.find({
    name: new RegExp(matchName, 'i'),
  })
    .then((matches) => {
      if (isEmpty(matches)) {
        return res.status(404).json({ msg: 'Nenhum time encontrado' });
      }
      return res.json(matches);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Devolver partida para edição
router.get('/edit-match/:matchID', (req, res) => {
  const match = req.params.matchID;
  Match.findById(match).then((match) => {
    if (!match) {
      return res.status(404).json({ msg: 'Partida não encontrada' });
    }
    return res.json(match);
  });
});

// Adicionar/Editar nova partida
router.post('/add-match', (req, res) => {
  const matchFields = {};
  const matchID = req.body.matchID;
  if (req.body.desc) matchFields.desc = req.body.desc;
  if (req.body.teamA) matchFields.teamA = req.body.teamA;
  if (req.body.resultA) matchFields.resultA = req.body.resultA;
  if (req.body.resultB) matchFields.resultB = req.body.resultB;
  if (req.body.teamB) matchFields.teamB = req.body.teamB;
  if (req.body.event) matchFields.event = req.body.event;
  if (req.body.open === 1) matchFields.open = false;
  if (req.body.finished === 1) matchFields.finished = true;

  Match.findById(matchID)
    .then((match) => {
      if (match) {
        // Validação
        const { errors, isValid } = validators.validateEditMatch(matchFields);
        if (!isValid) {
          return res.status(400).json(errors);
        }
        //
        Match.findOneAndUpdate({ _id: matchID }, { $set: matchFields }, { new: true })
          .then((match) => {
            res.json(match);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        // Validação
        const { errors, isValid } = validators.validateMatch(matchFields);
        if (!isValid) {
          return res.status(400).json(errors);
        }
        //
        new Match(matchFields)
          .save()
          .then(match => res.json(match))
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// Deletar partida
router.post('/del-match', (req, res) => {
  const matchID = req.body.matchID;

  Match.findById(matchID)
    .then((match) => {
      if (!match) {
        return res.status(404).json({ msg: 'Partida não encontrada' });
      }
      match.remove({ _id: matchID }).then(() => res.json({ msg: 'Partida excluida com sucesso' }));
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
