var userlib = require('../lib/users.js');

var User = function(userdata, reqref){
	this.login = (typeof userdata === "object") && userdata !== null;
	this.user = userdata;
	
	this.logout = function(){
		reqref.session.user = null;
	};
	
	this.authenticate = function(username, password, callback){
		var userInst = new userlib(reqref.db);
		userInst.authenticate(username, password, function(result, userd){
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
				reqref.session.user = {
					'uid': -1
				}
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
		if(!req.session.user || !req.session.user.uid || req.session.user.uid < 0){
			req.user = new User(null, req);
			next();
			return;
		}else{
			// Read the database
			var userInst = new userlib(req.db);
			userInst.getUser(req.session.user.uid, function(user){
				req.user = new User(user, req);
				next();
			});
		}
	}
};
