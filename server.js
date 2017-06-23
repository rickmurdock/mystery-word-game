const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sessionConfig = require("./sessionConfig");
const fs = require('file-system');
const app = express();
const port = process.env.port || 3007;
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

// SET VIEW ENGINE
app.engine("mustache", mustacheExpress());
app.set("views", "./public");
app.set("view engine", "mustache");

// MIDDLEWARE
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(sessionConfig));

app.use(function (req, res, next) {
  var game = req.session.game;
  if (!game) {
    game = req.session.game = {};
    // game.word = words[3900];  // make random
    let randomNumber = Math.floor((Math.random() * words.length-1) + 1)
    game.word = words[randomNumber];
    game.guessesLeft = 8;
    game.lettersGuessed = [];
  }
  console.log("session IS", req.session);
  next();
});


//ROUTES
app.get('/', function(req, res) {
  res.render('index', { game: req.session.game });
});

app.post('/', function(req, res) {
  var game = req.session.game;

  console.log('game.word', game.word);
  var n = game.word.indexOf(req.body.guessLetter);
  console.log("======N=====", n);
  if (n == -1) {
    game.guessesLeft -= 1;
    
  }

  res.render('index', { game: req.session.game });
});

// LISTENER
app.listen(port, function() {
  console.log('The game server is up and running on port', port);
});