const express = require('express');

const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
const router = express.Router();
const Match = require('../models/match');
const User = require('../models/user');
const validators = require('../validation/bet');

let score;

const getUsers = async () => {
  const users = await User.find({ points: { $gt: 0 } }, { _id: 0, username: 1, points: 1 }).sort([
    ['points', 'descending'],
  ]);
  return users;
};

const getMatches = async () => {
  const matches = await Match.find({ finished: true })
    .populate('teamA')
    .populate('teamB');
  return matches;
};


const populateMatch = ID => Match.findById(ID)
  .populate('teamA')
  .populate('teamB');

const verifyMatch = ID => Match.findById(ID);

const updateBet = (matchID, userID, resultA, resultB, res) => {
  const data = { resultA, resultB };

  // Validação
  const { errors, isValid } = validators.validateBet(data);
  if (!isValid) {
    return res.status(400).json({ errors, matchID });
  }
  //

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
  const data = { resultA: betFields.resultA, resultB: betFields.resultB };
  // Validação
  const { errors, isValid } = validators.validateBet(data);
  if (!isValid) {
    return res.status(400).json({ errors, matchID });
  }
  //

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

const updateUserPoints = (match, res) => {
  match.bets.forEach((bet) => {
    const points = definePoints(bet, match);
    User.findOneAndUpdate({ _id: bet.user }, { $inc: { points } }, { new: true })
      .then((user) => {
        console.log(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
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

  verifyMatch(matchID).then((match) => {
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

  verifyMatch(matchID).then((match) => {
    if (match.resultA && match.resultB) {
      Match.findOneAndUpdate({ _id: matchID }, { finished: true }, { new: true })
        .then((match) => {
          updateUserPoints(match, res);
          res.json({ msg: 'Usuarios atualizados com sucesso' });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      res.status(400).json({ msg: 'Preencha o placar da partida antes de finalizar' });
    }
  });
});

router.get('/ranking', async (req, res) => {
  const users = await getUsers();
  res.json(users);
});

router.get('/finished', async (req, res) => {
  const matches = await getMatches();
  res.json(matches);
});

module.exports = router;
