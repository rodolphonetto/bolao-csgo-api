const express = require('express');

const mongoose = require('mongoose');

const router = express.Router();
const Match = require('../models/match');
const validators = require('../validation/bet');
const isEmpty = require('../validation/is-empty');

const populateMatch = ID => Match.findById(ID)
  .populate('teamA')
  .populate('teamB');

const verifyClosed = ID => Match.findById(ID);

// Adicionar/Editar nova aposta
router.post('/add-bet', (req, res) => {
  const betFields = {};
  const matchID = req.body.matchID;
  const ObjectId = mongoose.Types.ObjectId;
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
          Match.findOneAndUpdate(
            { _id: ObjectId(matchID), 'bets.user': ObjectId(userID) },
            { $set: { 'bets.$.resultA': betFields.resultA, 'bets.$.resultB': betFields.resultB } },
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
        } else {
          Match.findOneAndUpdate({ _id: matchID }, { $push: { bets: betFields } }, { new: true })
            .then((match) => {
              populateMatch(match._id).then(bet => res.json(bet));
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        }
      });
    } else {
      res.status(400).json({ msg: 'Vocẽ não pode apostar em uma partida fechada' });
    }
  });
});

module.exports = router;
