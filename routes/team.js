const express = require('express');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'rodolphonetto',
  api_key: '643673452146514',
  api_secret: 'zs4ORkrq6ssCw8xkBEzhHltrTcA',
});

const isAuth = require('../config/is-auth');

const router = express.Router();
const Team = require('../models/team');
const validators = require('../validation/team');
const isEmpty = require('../validation/is-empty');

const logoUpload = image => cloudinary.v2.uploader.upload(image);

const teamControl = async (req, res) => {
  let result;
  if (req.file) {
    result = await logoUpload(req.file.path);
  }

  const teamFields = {};
  const teamID = req.body.teamID;
  if (req.file) teamFields.url = result.url;
  if (req.body.name) teamFields.name = req.body.name;
  if (req.file) teamFields.logo = result.public_id;
  if (req.body.country) teamFields.country = req.body.country;

  Team.findById(teamID).then((team) => {
    if (team) {
      // Validação
      const { errors, isValid } = validators.validateEditTeam(teamFields);
      if (!isValid) {
        return res.status(400).json(errors);
      }
      //

      Team.findOneAndUpdate({ _id: teamID }, { $set: teamFields }, { new: true })
        .then((team) => {
          res.json(team);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      Team.findOne({ name: teamFields.name }).then((team) => {
        if (team) {
          return res.status(400).json({ msg: 'Nome de time já cadastrado' });
        }
        // Validação
        const { errors, isValid } = validators.validateTeam(teamFields);
        if (!isValid) {
          return res.status(400).json(errors);
        }
        //
        new Team(teamFields)
          .save()
          .then(team => res.json(team))
          .catch((err) => {
            res.status(400).json(err);
          });
      });
    }
  });
};

// Retornar times cadastrados
router.get('/', isAuth, (req, res) => {
  const page = +req.query.page;
  const itemsPerPage = +req.query.maxItems;
  let totalItens;
  Team.find()
    .countDocuments()
    .then((numTeams) => {
      totalItens = numTeams;
      return Team.find()
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .populate('country');
    })
    .then((teams) => {
      if (isEmpty(teams)) {
        return res.status(404).json({ msg: 'Nenhum time encontrado' });
      }
      return res.json({
        teams,
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

// Pesquisa de times
router.post('/search-team', isAuth, (req, res) => {
  const teamName = req.body.teamName;
  Team.find({
    name: new RegExp(teamName, 'i'),
  })
    .then((teams) => {
      if (isEmpty(teams)) {
        return res.status(404).json({ msg: 'Nenhum time encontrado' });
      }
      return res.json(teams);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Detalha times
router.get('/edit-team/:teamID', isAuth, (req, res) => {
  const teamID = req.params.teamID;
  Team.findById(teamID)
    .populate({
      path: 'players',
      populate: { path: 'country' },
    })
    .then((team) => {
      if (!team) {
        return res.status(404).json({ msg: 'Time não encontrado' });
      }
      return res.json(team);
    });
});

// Adicionar/Editar novo time
router.post('/add-team', isAuth, (req, res) => {
  teamControl(req, res);
});

// Devolver time para edição
router.get('/edit-team/:teamID', isAuth, (req, res) => {
  const teamID = req.params.teamID;
  Team.findById(teamID).then((team) => {
    if (!team) {
      return res.status(404).json({ msg: 'Time não encontrado' });
    }
    return res.json(team);
  });
});

// Deletar Time
router.put('/del-team/:teamID', isAuth, (req, res) => {
  const teamID = req.params.teamID;

  Team.findById(teamID)
    .then((team) => {
      if (!team) {
        return res.status(404).json({ msg: 'Time não encontrado' });
      }
      Team.remove({ _id: teamID }).then(() => res.json({ msg: 'Time excluido com sucesso', teamID }));
    })
    .catch((err) => {
      console.log(err);
    });
});

// *** Gerenciamento de players *** //

// Adicionar player ao time
router.post('/add-player', isAuth, (req, res) => {
  const teamID = req.body.teamID;
  const playerID = req.body.playerID;

  Team.findById(teamID).then((team) => {
    if (!team || !playerID) {
      return res.status(404).json({ msg: 'Time ou jogador não encontrado' });
    }
    team.players.unshift(playerID);
    team.save().then((team) => {
      res.json(team);
    });
  });
});

// Remover player ao time
router.post('/remove-player', isAuth, (req, res) => {
  const teamID = req.body.teamID;
  const playerID = req.body.playerID;

  Team.findById(teamID).then((team) => {
    if (!team) {
      return res.status(404).json({ msg: 'Time não encontrado' });
    }
    const PlayerIndex = team.players.map(player => player._id.toString()).indexOf(playerID);

    team.players.splice(PlayerIndex, 1);

    team
      .save()
      .then((team) => {
        res.json(team);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

module.exports = router;
