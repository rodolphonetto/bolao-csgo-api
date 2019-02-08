const express = require('express');

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
  console.log(req.body);
  const betFields = {};
  let betID;
  const matchID = req.body.matchID;

  if (req.body.resultA) betFields.resultA = req.body.resultA;
  if (req.body.resultB) betFields.resultB = req.body.resultB;
  if (req.body.matchID) betFields.match = req.body.matchID;
  if (req.body.userID) betFields.user = req.body.userID;
  if (req.body.betID) betID = req.body.betID;

  Bet.findById(betID)
    .then((bet) => {
      if (bet) {
        // Validação
        const { errors, isValid } = validators.validateEditBet(betFields);
        if (!isValid) {
          return res.status(400).json(errors);
        }
        //
        Match.findOneAndUpdate({ _id: matchID }, { $set: { bets: betFields } }, { new: true })
          .then((match) => {
            console.log('oi2');
            res.json(match);
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json(err);
          });
      } else {
        // Validação
        const { errors, isValid } = validators.validateBet(betFields);
        if (!isValid) {
          return res.status(400).json(errors);
        }
        //
        Match.findOneAndUpdate({ _id: matchID }, { $set: { bets: betFields } }, { new: true })
          .then((match) => {
            res.json(match);
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// Deletar Aposta
router.post('/del-bet', (req, res) => {
  const betID = req.body.betID;

  Bet.findById(betID)
    .then((bet) => {
      if (!bet) {
        return res.status(404).json({ msg: 'Aposta não encontrada' });
      }
      Bet.remove({ _id: betID }).then(bet => res.json({ msg: 'Aposta excluida com sucesso' }));
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
