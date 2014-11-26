var userlib = require('../lib/users.js');

module.exports = function(){
	return function(req, res, next){
		if(!req.db || !userlib){
			req.user = {"login": false, "user": null};
			next();
			return;
		}
		var userInst = new userlib(req.db);
		setTimeout(function(){
			// Read the database
			req.user = {
				"login":true,
				"user":{
					"uid":0,
					"username": "testuser",
					"displayname": "Test User",
					"email": "userEmail@test.com"
				}
			};
			next();
		}, 100);
	}
};
