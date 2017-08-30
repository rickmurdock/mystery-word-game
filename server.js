'use strict';
const express = require('express');
const expressValidator = require('express-validator');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sessionConfig = require("./sessionConfig");
const fs = require('file-system');
const app = express();
const port = process.env.port || 3000;
// const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const words = [
  "fish", "gold", "song", "dirt", "moon", "burn", "boat", "jump", "fork", "unit", "code",
  "music", "solar", "grass", "water", "south", "party", "human", "robot", "silly",
  "school", "cement", "monkey", "memory", "search", "estate", "buzzer", "quartz",
  "eclipse", "recycle", "thought", "provoke", "drifter", "lantern", "dazzled",
  "software", "dinosaur", "railroad", "currency", "zucchini", "joyfully", "hijacked",
  "equalizer", "publicize", "piggyback", "equipment", "objection", "multiplex",
  "basketball", "graduation", "government", "subjective", "vaporizing", "immobilize",
  "nationality", "subtraction", "jeopardized", "uncivilized", "emphasizing",
  "transmission", "metropolitan", "extravaganza", "unquenchable", "computerized",
  "communication", "consciousness", "skateboarding", "international", "mathematician",
  "infrastructure", "accomplishment", "procrastinator", "transportation"
];

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
    game.mode = '';
    game.guessesLeft = 8;
    game.lettersGuessed = [];
    game.btnText = 'Play game';
    game.status = '';
    game.lose = false;
    game.playing = false;
    game.message = '';
    game.display = '';
  }
  next();
});

//ROUTES
app.get('/', function(req, res) {
  if (req.session.game.playing || req.session.game.btnText != 'Play game') {
    req.session.game.display = buildDisplay(req.session.game);
  }
  res.render('index', { game: req.session.game });
});

app.post('/', function(req, res) {
  var game = req.session.game;
  if (game.playing) {
    req.checkBody("guessLetter", "You must enter a letter!").notEmpty().isAlpha();
    var errors = req.validationErrors();
    if (errors) {
      game.message = errors[0].msg;
    } else {
      // check if letter already guessed else if not found or found
      if (game.lettersGuessed.indexOf(req.body.guessLetter.toUpperCase()) > -1) {
        game.message = 'You already guessed letter ' + req.body.guessLetter.toUpperCase();;
      } else { 
        var n = game.word.indexOf(req.body.guessLetter.toUpperCase());
        if (n == -1) {  // Bad Guess
          game.message = 'Bad guess...try again!';
          game.guessesLeft -= 1;
          game.lettersGuessed.push(req.body.guessLetter.toUpperCase());
          if (game.guessesLeft == 0) {
            game.message = '';
            game.btnText = 'Try again';
            game.status = 'You lose!';
            game.playing = false;
            game.lose = true;
          }
        } else {  // Correct Guess
          game.lettersGuessed.push(req.body.guessLetter.toUpperCase());
          game.message = '';
          // check for win
          req.session.game.display = buildDisplay(req.session.game);
          if (game.display.indexOf('<div class="letters" style="color:red"> </div>') ==  -1) {
            game.message = '';
            game.btnText = 'Try again';
            game.status = 'You win!';
            game.playing = false;
            game.lose = true;
          }
        }
      }
    }
  } else { // !game.playing
    game.playing = true;
    game.btnText = "Make a guess";
    game.status = '';
    game.mode = req.body.mode;
    game.word = findRandomWord(game.mode);
    game.lose = false;
    game.guessesLeft = 8;
    game.lettersGuessed = [];
  }
  res.redirect('/');
});

// LISTENER
app.listen(port, function() {
  console.log('The game server is up and running on port', port);
});

function buildDisplay(game) {
  var showText = [];
  var value;
  for (let i = 0; i < game.word.length; i++) {
    if (game.lettersGuessed.indexOf(game.word[i]) > -1) {
      value = '<div class="letters" style="color:blue">' + game.word[i].toUpperCase() + '</div>'
      showText.push(value);
    } else {
      if (game.lose == true) {
        value = '<div class="letters" style="color:red">' + game.word[i].toUpperCase() + '</div>'
        showText.push(value);
      } else {   
        var value = '<div class="letters" style="color:red"> </div>'
        showText.push(value);
      }
    }
  }
  return showText;
};

function findRandomWord(mode) {
  let randomWord;
  let wordLength = 0;
  let wordFound = false;

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

  return randomWord.toUpperCase();
};