module.exports = function(){
	return function(req, res, next){
		if(!req.db){
			req.user = {"login": false, "user": null};
			next();
			return;
		}
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
