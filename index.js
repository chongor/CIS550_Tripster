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
var nonce = require('./middle/nonce.js');
// Load routest
var routes = require('./routes/routes.js');
var routes_users = require('./routes/users.js');
var routes_media = require('./routes/media.js');
var routes_trips = require('./routes/trips.js');
var routes_search = require('./routes/search.js');
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
app.use(nonce());

// Routes
// -- Basics
app.get('/', routes.main);
app.get('/login', routes.login);
app.post('/login', routes.loginPost);
app.get('/register', routes.register);
app.post('/register', routes.registerPost);
app.get('/logout', routes.logout);


// -- User Stuff
app.get('/user/settings', routes_users.settings);
app.get('/profile/:login', routes_users.profile);

// -- Search Stuff
app.get('/search', routes_search.search);

// -- Media Stuff (shares)
app.get('/photo/:id', routes_media.photos);
app.get('/video/:id', routes_media.videos);

app.get('/album/create', routes_media.createAlbum);
app.post('/album/create', routes_media.createAlbumPost);

app.get('/album/:id', routes_media.albums);

app.post('/media/post', routes_media.post);

// -- Trip Stuff
app.get('/trip/create', routes_trips.create);
app.post('/trip/create', routes_trips.createTrip);
app.get('/trip/:id', routes_trips.view);

// -- JS Endpoints
app.post('/api/user/friend', routes_users.addfriend);
app.post('/api/user/unfriend', routes_users.unfriend);
app.post('/api/user/update', routes_users.update);
app.post('/api/user/invite', routes_trips.inviteJoin);

app.get('/api/user/newsfeed', routes_users.newsfeed);
app.get('/api/user/:id/invitables', routes_trips.invitables);
app.get('/api/user/trips', routes_trips.mine);
app.get('/api/user/recommend/friends', routes_users.recommendFriend);

app.get('/api/media/:id/ratings', routes_media.ratings);
app.post('/api/media/:id/ratings', routes_media.ratings);

app.get('/api/trip/:id/checklist', routes_trips.checklist);
app.get('/api/trip/:id/members', routes_trips.members);
app.get('/api/trip/:id/requests', routes_trips.members);
app.get('/api/trip/:id/schedule', routes_trips.schedules);

app.post('/api/trip/request', routes_trips.requestJoin);
app.post('/api/trip/approve', routes_trips.approveJoin);

// -- Error and bad url handling
app.get('*', routes.fourohfour);


// Run the server
console.log('Tripster Server Going Live...');
app.listen(8080).on('error', function(){
	console.log("[Err] Express server init failed. Port in use?");
});;
console.log('Magic is happening on port 8080. \n  Now open http://localhost:8080/ in your browser!');

