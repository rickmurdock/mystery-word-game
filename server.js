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
    game.lettersGuessedWrong = [];
    game.lettersGuessedRight = [];
    game.btnText = 'Make a guess';
    game.status = '';
    game.message = '';
    // game.display = '';
    game.display = buildDisplay(game);
  }
  // console.log("session IS", req.session);
  next();
});

//ROUTES
app.get('/', function(req, res) {
  res.render('index', { game: req.session.game });
});

app.post('/', function(req, res) {
  var game = req.session.game;
  var allLettersGuessed = game.lettersGuessedWrong.concat(game.lettersGuessedRight);
  console.log('allLettersGuessed ',allLettersGuessed);
  // check if letter already guessed else if not found or found
  if (allLettersGuessed.indexOf(req.body.guessLetter) > -1) {
    game.message = 'You already guessed letter ' + req.body.guessLetter;
  } else { 

    var n = game.word.indexOf(req.body.guessLetter);
    if (n == -1) {
      // if (req.body.guessLetter.indexOf(game.letter)) 
      game.message = 'Bad guess...try again!';
      game.guessesLeft -= 1;
      game.lettersGuessedWrong.push(req.body.guessLetter);
    } else {
      game.lettersGuessedRight.push(req.body.guessLetter);
      game.message = 'You guessed correctly.';
    }
  }
console.log("session IS", req.session);
  res.render('index', { game: req.session.game });
});

// LISTENER
app.listen(port, function() {
  console.log('The game server is up and running on port', port);
});

function buildDisplay(game) {
  var showText = '';
  // game.word.forEach(function(letter) {
  //   showText += showText + letter + ' ';
  // });
  for (let i = 0; i < game.word.length; i++) {
    showText = showText + game.word[i] + ' ';
  }
  return showText;
};