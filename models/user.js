function User(req){
	this.__request = req;
};

User.prototype.on = function(event, callback){
	
};

User.prototype.getUserInfo = function(callback){
	callback({
		"isLoggedIn":true,
		"nonces":{
			"default":""
		},
		"user":{
			"username": "test",
			"fullname": "Test User",
			"email": "testuser@test.com",
		}
	});
};

module.exports = exports = User;
