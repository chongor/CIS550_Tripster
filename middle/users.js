var userlib = require('../lib/users.js');

var User = function(userdata, reqref){
	this.login = (typeof userdata === "object") && userdata !== null;
	this.user = userdata;
	
	this.logout = function(){
		reqref.session.user = null;
	};
	
	this.authenticate = function(username, password, callback){
		var userInst = new userlib(req.db);
		userlib.authenticate(username, password, function(result, userd){
			if(result){
				this.login = true;
				this.user = userd;
				reqref.session.user = {
					'uid': userd.uid
				}
				callback(true, userd);
			} else {
				this.login = false;
				this.user = null;
				callback(false, userd);
			}
		});
	};
};

module.exports = function(){
	return function(req, res, next){
		if(!req.db || !userlib || !req.session){
			req.user = new User(null, req);
			next();
			return;
		}
		
		if(!req.session.user || !req.session.user.id || req.session.user.id < 0){
			req.user = new User(null, req);
			next();
			return;
		}else{
			// Read the database
			var userInst = new userlib(req.db);
			userInst.getUser(req.session.user.id, function(){
				req.user = new User({
					"uid":0,
					"username": "testuser",
					"fullname": "Test User",
					"email": "userEmail@test.com"
				});
				req.user = new User();
				next();
			});
		}
	}
};
