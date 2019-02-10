const express = require('express');

const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
const router = express.Router();
const Match = require('../models/match');
const User = require('../models/user');
const validators = require('../validation/bet'); // TODO ADICIONAR VALIDAÇÕES
const isEmpty = require('../validation/is-empty'); // ADICIONAR VALIDAÇÕES

let score;

const populateMatch = ID => Match.findById(ID)
  .populate('teamA')
  .populate('teamB');

const verifyClosed = ID => Match.findById(ID);

const updateBet = (matchID, userID, resultA, resultB, res) => {
  Match.findOneAndUpdate(
    { _id: ObjectId(matchID), 'bets.user': ObjectId(userID) },
    { $set: { 'bets.$.resultA': resultA, 'bets.$.resultB': resultB } },
    {
      new: true,
    },
  )
    .then((match) => {
      populateMatch(match._id).then(bet => res.json(bet));
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const newBet = (matchID, betFields, res) => {
  Match.findOneAndUpdate({ _id: matchID }, { $push: { bets: betFields } }, { new: true })
    .then((match) => {
      populateMatch(match._id).then(bet => res.json(bet));
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const definePoints = (bet, match) => {
  if (bet.resultA === match.resultA && bet.resultB === match.resultB) {
    score = 5;
    return score;
  }
  if (
    (bet.resultA > bet.resultB && match.resultA > match.resultB)
    || (bet.resultA < bet.resultB && match.resultA < match.resultB)
  ) {
    score = 3;
    return score;
  }
  return 0;
};

const updateUserPoints = (match) => {
  match.bets.forEach((bet) => {
    const points = definePoints(bet, match);
    User.findOneAndUpdate({ _id: bet.user }, { $inc: { points } }, { new: true });
  });
};

// Adicionar/Editar nova aposta
router.post('/add-bet', (req, res) => {
  const betFields = {};
  const matchID = req.body.matchID;
  const userID = req.body.userID;

  if (req.body.resultA) betFields.resultA = req.body.resultA;
  if (req.body.resultB) betFields.resultB = req.body.resultB;
  if (req.body.matchID) betFields.match = req.body.matchID;
  if (req.body.userID) betFields.user = req.body.userID;

  verifyClosed(matchID).then((match) => {
    if (match.open) {
      Match.aggregate([
        {
          $unwind: '$bets',
        },
        { $match: { _id: ObjectId(matchID), 'bets.user': ObjectId(userID) } },
      ]).then((bets) => {
        if (bets.length > 0) {
          updateBet(matchID, userID, betFields.resultA, betFields.resultB, res);
        } else {
          newBet(matchID, betFields, res);
        }
      });
    } else {
      res.status(400).json({ msg: 'Vocẽ não pode apostar em uma partida fechada' });
    }
  });
});

router.put('/fin-match/:matchID', (req, res) => {
  const matchID = req.params.matchID;

  Match.findOneAndUpdate({ _id: matchID }, { finished: true }, { new: true }).then((match) => {
    updateUserPoints(match, res);
    res.json({ msg: 'Usuarios atualizados com sucesso' });
  });
});

module.exports = router;
