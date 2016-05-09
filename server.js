/**
 * Created by Abu on 2/5/2016.
 */
// BASE SETUP
// ==================================


// CALL THE PACKAGES ----------------
var express    = require('express'); // call express
var app        = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan     = require('morgan'); // used to see request
var mongoose   = require('mongoose'); // for working w/ our database
var config     = require('./config');
var path       = require('path');

var superSecert = config.secert;

// APP CONFIGURATION ------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
    next();
});

// check the connection
mongoose.connection.on('open', function(ref) {
    console.log('Connected to mongo server.');
});

mongoose.connection.on('error', function(err) {
    console.log('Could not connect to mongo server!');
    console.log(err);
});

// log all requests to the console
app.use(morgan('dev'));


//connect to our database (hosted on modulus.io
mongoose.connect(config.database);
//mongoose.connect('mongodb://localhost:27017/test');

app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API
// =======================================


// API ROUTES ------------------------------ (These routes are handled by node)
var apiRoutes = require('./routes/api')(app, express);
app.use('/api', apiRoutes);


// MAIN CATCHALL ROUTE ----------------------
// SEND USERS TO FRONTEND -------------------
// has to be registered after API ROUTES
app.get('*', function(req, res){
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});


// REGISTER OUR ROUTES -------------------
// all of our routes will be prefixed with /api


// START THE SERVER
// =======================================
app.listen(config.port);
console.log('Magic happens on port ' + config.port);