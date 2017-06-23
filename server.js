const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sessionConfig = require("./sessionConfig");
const app = express();
const port = process.env.port || 3007;
// const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

// SET VIEW ENGINE
app.engine("mustache", mustacheExpress());
app.set("views", "./public");
app.set("view engine", "mustache");

// MIDDLEWARE
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(sessionConfig));


//ROUTES
app.get('/', function(req, res) {
  res.render('index');
});

app.post('/', function(req, res) {

});

// LISTENER
app.listen(port, function() {
  console.log('The game server is up and running on port', port);
});