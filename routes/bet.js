const express = require('express');

const mongoose = require('mongoose');

const router = express.Router();
const Bet = require('../models/bet');
const Match = require('../models/match');
const validators = require('../validation/bet');
const isEmpty = require('../validation/is-empty');

// Retornar apostas cadastrados
// TODO Ajustar populate para campos necessários apenas.
router.get('/', (req, res) => {
  Bet.find()
    .populate('match')
    .populate('user')
    .then((bets) => {
      if (isEmpty(bets)) {
        return res.status(404).json({ msg: 'Nenhuma aposta encontrada' });
      }
      return res.json(bets);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Detalha aposta
// TODO Ajustar populate para campos necessários apenas.
router.get('/edit-bet/:betID', (req, res) => {
  const betID = req.params.betID;
  Bet.findById(betID)
    .populate('match')
    .populate('user')
    .then((bet) => {
      if (!bet) {
        return res.status(404).json({ msg: 'Aposta não encontrada' });
      }
      return res.json(bet);
    });
});

// Adicionar/Editar nova aposta
// TODO Criar validação para travar duas apostas no mesmo jogo.
router.post('/add-bet', (req, res) => {
  const betFields = {};
  const matchID = req.body.matchID;
  const ObjectId = mongoose.Types.ObjectId;
  const userID = req.body.userID;
  if (req.body.resultA) betFields.resultA = req.body.resultA;
  if (req.body.resultB) betFields.resultB = req.body.resultB;
  if (req.body.matchID) betFields.match = req.body.matchID;
  if (req.body.userID) betFields.user = req.body.userID;

  Match.aggregate([
    {
      $unwind: '$bets',
    },
    { $match: { _id: ObjectId(matchID), 'bets.user': ObjectId(userID) } },
  ]).then((teste) => {
    if (teste.length > 0) {
      Match.updateOne(
        { _id: ObjectId(matchID), 'bets.user': ObjectId(userID) },
        { $set: { 'bets.$.resultA': betFields.resultA, 'bets.$.resultB': betFields.resultB } },
      )
        .then((match) => {
          res.json(match);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      Match.findOneAndUpdate({ _id: matchID }, { $push: { bets: betFields } }, { new: true })
        .then((match) => {
          res.json(match);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    }
  });
});

module.exports = router;
