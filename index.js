try{
	var config = require('./config.js');
}catch(e){
	console.log("[Err] Could not find a 'config.js' file. Please make a copy of 'config.sample.js' as 'config.js' and fill in the corresponding credentials.");
	console.log("DO NOT DELETE config.sample.js!");
	console.log("DO NOT ADD config.js TO VERSION CONTROL!");
	process.exit(0);
}
// Load Express & Middleware
var express = require('express');
var estatic = require('serve-static');
var esession = require('express-session');
var rstore = require('connect-redis')(esession);
var cparser = require('cookie-parser');
var elogger = require('morgan');
var bparser = require('body-parser');
// Load our own middleware
var users = require('./middle/users.js');
var db = require('./middle/db.js');
// Load routest
var routes = require('./routes/routes.js');
// Setup app
var app = express();

// Set Engine to use
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Load some useful middleware
app.use(cparser());
app.use(esession({
	store: new rstore(config.redis),
    secret: 'VfdQAKct5X_Hj6PXJm7Nc6vTSWgVW3Pb',
    resave: true,
    saveUninitialized: true
}));
app.use(estatic(__dirname + '/public', {maxAge:86400000}));
app.use(elogger('dev'));
app.use(bparser.json());
app.use(bparser.urlencoded({ extended: false }));
// Load our user middleware
app.use(db());
app.use(users());

// Routes
app.get('/', routes.main);
app.get('/login', routes.login);
app.post('/login', routes.loginPost);
app.get('/logout', routes.logout);


// Run the server
console.log('Tripster Server Going Live...');
app.listen(8080).on('error', function(){
	console.log("[Err] Express server init failed. Port in use?");
});;
console.log('Magic is happening on port 8080. \n  Now open http://localhost:8080/ in your browser!');

