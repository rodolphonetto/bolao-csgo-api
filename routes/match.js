const express = require('express');
const isAuth = require('../config/is-auth');

const router = express.Router();
const Match = require('../models/match');
const validators = require('../validation/match');
const isEmpty = require('../validation/is-empty');

// Retornar partidas cadastrados
router.get('/', (req, res) => {
  const page = +req.query.page;
  const itemsPerPage = +req.query.maxItems;
  let totalItens;
  Match.find()
    .countDocuments()
    .then((numMatches) => {
      totalItens = numMatches;
      return Match.find()
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .populate('teamA')
        .populate('teamB');
    })
    .then((matches) => {
      if (isEmpty(matches)) {
        return res.status(404).json({ msg: 'Nenhum time encontrado' });
      }
      return res.json({
        matches,
        currentPage: page,
        hasNextPage: itemsPerPage * page < totalItens,
        hasPrevPage: page - 1 > 0,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItens / itemsPerPage),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Pesquisa de partidas
router.post('/search-match', isAuth, (req, res) => {
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
router.get('/edit-match/:matchID', isAuth, (req, res) => {
  const match = req.params.matchID;
  Match.findById(match)
    .populate('teamA')
    .populate('teamB')
    .then((match) => {
      if (!match) {
        return res.status(404).json({ msg: 'Partida não encontrada' });
      }
      return res.json(match);
    });
});

// Adicionar/Editar nova partida
router.post('/add-match', isAuth, (req, res) => {
  const matchFields = {};
  const matchID = req.body.matchID;
  if (req.body.desc) matchFields.desc = req.body.desc;
  if (req.body.teamA) matchFields.teamA = req.body.teamA;
  if (req.body.resultA) {
    matchFields.resultA = req.body.resultA;
  } else {
    matchFields.resultA = '0';
  }
  if (req.body.resultB) {
    matchFields.resultB = req.body.resultB;
  } else {
    matchFields.resultB = '0';
  }
  if (req.body.teamB) matchFields.teamB = req.body.teamB;
  if (req.body.event) {
    matchFields.event = req.body.event;
  } else {
    matchFields.event = '5c3f242dd136ae0638b20d30';
  }

  if (req.body.open === 'sim') {
    matchFields.open = true;
  } else {
    matchFields.open = false;
  }

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

// Deletar Partida
router.put('/del-match/:matchID', isAuth, (req, res) => {
  const matchID = req.params.matchID;

  Match.findById(matchID)
    .then((match) => {
      if (!match) {
        return res.status(404).json({ msg: 'Partida não encontrado' });
      }
      Match.remove({ _id: matchID }).then(() => res.json({ msg: 'Partida excluida com sucesso', matchID }));
    })
    .catch((err) => {
      res.status(400).json({ msg: 'Algo deu errado por favor entre em contato com o suporte!' });
    });
});

module.exports = router;
