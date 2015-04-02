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
var bpaser = require('body-parser');
var bparser = require('body-parser');
var busboy = require('connect-busboy');
// Load our own middleware
var db = require('./middle/db.js');
var s3 = require('./middle/s3.js');
// Load routest
var routes = require('./routes/routes.js');
// Setup app
var app = express();

// Load some useful middleware
app.use(cparser());
app.use(esession({
	store: new rstore(config.redis),
    secret: 'VfdQAKct5X_Hj6PXJm7Nc6vTSWgVW3Pb', // TODO: Change redis store secret
    resave: true,
    saveUninitialized: true
}));
app.use(estatic(__dirname + '/public', {maxAge:86400000}));
app.use(elogger('dev'));
app.use(bparser.json());
app.use(busboy());
// Load our own middleware
app.use(db());
app.use(s3());

// Routes
// -- Basics
app.post('/api/login/credentials', routes.login);
// -- Error and bad url handling
app.get('*', routes.fourohfour);


// Run the server
console.log('Metcha Server Going Live...');
app.listen(8080).on('error', function(){
	console.log("[Err] Express server init failed. Port in use?");
});;
console.log('Magic is happening on port 8080. \n  Now open http://localhost:8080/ in your browser!');

