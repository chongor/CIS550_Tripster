module.exports = function(){
	var db;
	return function(req, res, next){
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
