const express = require('express');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
const router = express.Router();
const Match = require('../models/match');
const User = require('../models/user');
const validators = require('../validation/bet');

// Funções Globais
const populateMatch = ID => Match.findById(ID)
  .populate('teamA')
  .populate('teamB');

const verifyMatch = ID => Match.findById(ID);

const inputValidation = (data) => {
  const { errors, isValid } = validators.validateBet(data);
  if (!isValid) {
    return errors;
  }
};
//

// Endpoint: /add-bet
// Adicionar ou editar uma aposta
const updateBet = async (betFields, res) => {
  try {
    const {
      match: matchID, user: userID, resultA, resultB,
    } = betFields;
    const data = { resultA, resultB };
    const errors = inputValidation(data);
    if (errors) {
      return res.status(400).json({ errors, matchID });
    }

    const match = await Match.findOneAndUpdate(
      { _id: ObjectId(matchID), 'bets.user': ObjectId(userID) },
      { $set: { 'bets.$.resultA': resultA, 'bets.$.resultB': resultB } },
      {
        new: true,
      },
    );
    const bet = await populateMatch(match._id);
    res.json(bet);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const newBet = async (betFields, res, next) => {
  try {
    const {
      match: matchID, user: userID, resultA, resultB,
    } = betFields;

    const data = { resultA, resultB };
    const errors = inputValidation(data);
    if (errors) {
      return res.status(400).json({ errors, matchID });
    }
    const match = await Match.findOneAndUpdate(
      { _id: matchID },
      { $push: { bets: betFields } },
      { new: true },
    );
    const bet = await populateMatch(match._id);
    res.json(bet);
  } catch (err) {
    console.log(err);
    const error = new Error('Erro ao adicionar nova aposta.');
    error.httpStatusCode = 500;
    return next(error);
  }
};

router.post('/add-bet', async (req, res, next) => {
  const betFields = {};
  const {
    matchID, userID, resultA, resultB,
  } = req.body;

  if (resultA) betFields.resultA = resultA;
  if (resultB) betFields.resultB = resultB;
  if (matchID) betFields.match = matchID;
  if (userID) betFields.user = userID;

  const match = await verifyMatch(matchID);
  if (match.open) {
    const bets = await Match.aggregate([
      {
        $unwind: '$bets',
      },
      { $match: { _id: ObjectId(matchID), 'bets.user': ObjectId(userID) } },
    ]);
    if (bets.length > 0) {
      updateBet(betFields, res);
    } else {
      newBet(betFields, res, next);
    }
  } else {
    res.status(400).json({ msg: 'Você não pode apostar em uma partida fechada' });
  }
});

// Endpoint: /fin-match/:matchID
// Finanlizar as partidas e calcular o novo ranking
const definePoints = (bet, match) => {
  let score;
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
      .then(() => {})
      .catch((err) => {
        res.status(400).json(err);
      });
  });
};

router.put('/fin-match/:matchID', (req, res) => {
  const matchID = req.params.matchID;

  verifyMatch(matchID).then((match) => {
    if (match.resultA > 0 || match.resultB > 0) {
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

// Endpoint: /ranking
// Gerar o ranking dos usuarios por pontos
const getRanking = async () => {
  const users = await User.find({ points: { $gt: 0 } }, { _id: 0, username: 1, points: 1 }).sort([
    ['points', 'descending'],
  ]);
  return users;
};

router.get('/ranking', async (req, res) => {
  const users = await getRanking();
  res.json(users);
});

// Endpoint: /finished
// Exibir as partidas finalizadas para os usuarios

const getMatches = async () => {
  const matches = await Match.find({ finished: true })
    .populate('teamA')
    .populate('teamB');
  return matches;
};

router.get('/finished', async (req, res) => {
  const matches = await getMatches();
  res.json(matches);
});

module.exports = router;
