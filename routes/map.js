const express = require('express');
const isEmpty = require('../validation/is-empty');

const router = express.Router();
const Match = require('../models/match');

// TODO Popular interno de array
router.get('/map', (req, res) => {
  Match.find()
    .populate({
      path: 'maps',
      populate: {
        path: 'teamA',
        populate: {
          path: 'team',
        },
      },
    })
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

// Adicionar/Editar novo mapa
router.post('/add-map', (req, res) => {
  const mapFields = {
    teamA: {},
    teamB: {},
  };
  const matchID = req.body.matchID;
  if (req.body.teamRA) mapFields.teamRA.team = req.body.teamRA;
  if (req.body.resultA) mapFields.teamRA.result = req.body.resultA;
  if (req.body.teamRB) mapFields.teamRB.team = req.body.teamRB;
  if (req.body.resulBt) mapFields.teamRB.result = req.body.resultB;
  Match.findById(matchID)
    .then((match) => {
      if (match) {
        const arrayNovo = [...match.maps];
        arrayNovo.push(mapFields);

        Match.findOneAndUpdate({ _id: matchID }, { $set: { maps: arrayNovo } }, { new: true })
          .then((match) => {
            res.json(match);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
