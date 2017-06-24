'use strict';
const express = require('express');
const expressValidator = require('express-validator');
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
app.use(expressValidator());

app.use(function (req, res, next) {
  var game = req.session.game;
  if (!game) {
    game = req.session.game = {};
    game.mode = 'easy';
    game.word = findRandomWord(game.mode);
    game.guessesLeft = 8;
    game.lettersGuessed = [];
    game.btnText = 'Make a guess';
    game.status = '';
    game.message = '';
    game.display = '';
    // game.display = buildDisplay(game);
  }
  game.display = buildDisplay(game);
  next();
});

//ROUTES
app.get('/', function(req, res) {
  req.session.game.display = buildDisplay(req.session.game);
  res.render('index', { game: req.session.game });
});

app.post('/', function(req, res) {
  var game = req.session.game;
  req.checkBody("guessLetter", "You must enter a letter!").notEmpty();
  var errors = req.validationErrors();
  console.log('ERRORS =', errors);
    if (errors) {
    game.message = errors[0].msg;
  } else {

  // var game = req.session.game;
  console.log('lettersGuessed ',game.lettersGuessed);
  // check if letter already guessed else if not found or found
  // if (allLettersGuessed.indexOf(req.body.guessLetter) > -1) {
  if (game.lettersGuessed.indexOf(req.body.guessLetter) > -1) {
    game.message = 'You already guessed letter ' + req.body.guessLetter;
  } else { 

    var n = game.word.indexOf(req.body.guessLetter);
    if (n == -1) {
      // if (req.body.guessLetter.indexOf(game.letter)) 
      game.message = 'Bad guess...try again!';
      game.guessesLeft -= 1;
      game.lettersGuessed.push(req.body.guessLetter);
      if (game.guessesLeft == 0) {
        game.message = 'YOU ARE A LOSER!!!!';
        game.status = 'lose';
      }
    } else {
      game.lettersGuessed.push(req.body.guessLetter);
      game.message = 'You guessed correctly.';
    }
  }

}


console.log("session IS", req.session);
  // res.render('index', { game: req.session.game });  // redirect ???
  res.redirect('/');
});

// LISTENER
app.listen(port, function() {
  console.log('The game server is up and running on port', port);
});

function buildDisplay(game) {
  var showText = [];
  for (let i = 0; i < game.word.length; i++) {
    if (game.lettersGuessed.indexOf(game.word[i]) > -1) {
       showText.push(game.word[i].toUpperCase());
     } else {
       if (game.status == 'lose') {
          showText.push(game.word[i].toUpperCase());
       } else {
          showText.push(' ');
       }
     }
  }
  return showText;
};

function findRandomWord(mode) {
  let randomWord;
  let wordLength = 0;
  let wordFound = false;
  // let randomNumber = Math.floor((Math.random() * words.length-1) + 1)
  // randomWord = words[randomNumber];

  while (!wordFound) {
    let randomNumber = Math.floor((Math.random() * words.length-1) + 1)
    randomWord = words[randomNumber];
    wordLength = randomWord.length;
    switch(mode) {
      case 'easy':   // 4-6 characters
          if (wordLength >= 4 && wordLength <= 6) {wordFound = true;}
          break;
      case 'normal': // 6-8 characters
          if (wordLength >= 6 && wordLength <= 8) {wordFound = true;}
          break;
      case 'hard':  // 8+ characters
          if (wordLength >= 8) {wordFound = true;}
          break;
      default:
          wordFound = true;
          break;
    }
  }

  return randomWord;
};