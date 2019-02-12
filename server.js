const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const country = require('./routes/country');
const team = require('./routes/team');
const player = require('./routes/player');
const event = require('./routes/event');
const match = require('./routes/match');
const bet = require('./routes/bet');
const auth = require('./routes/auth');

const app = express();
const db = require('./config/keys').mongoURI;

mongoose
  .connect(db)
  .then(console.log('MongoDB conectado'))
  .catch(err => console.log(err));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*, GET, POST, OPTIONS, PUT');
  res.setHeader('Access-Control-Allow-Headers', '*, Content-Type, Authorization');
  next();
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png'
    || file.mimetype === 'image/jpg'
    || file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, filefilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/countries', country);
app.use('/teams', team);
app.use('/players', player);
app.use('/events', event);
app.use('/matches', match);
app.use('/bets', bet);
app.use('/auth', auth);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Servidor rodando na porta ${port} ${process.env.MONGO_DATABASE}`));
