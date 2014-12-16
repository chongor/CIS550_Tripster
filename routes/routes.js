var sharelib = require('../lib/shares.js');

exports.main = function(req, res){
	if(req.user.login){
		var shareinst = new sharelib(req.db);
		shareinst.getAlbumsByOwner(req.user.user.uid, function(albums){
			req.db.end();
			res.render('index', {
				login:req.user.login,
				user:req.user.user,
				albums:albums
			});
		});
	} else {
		req.db.end();
		res.redirect(302, '/login');
	}
};

exports.login = function(req, res){
	if(req.user.login){
		// Already logged in 
		req.db.end();
		res.redirect(302, '/');
	} else {
		req.db.end();
		res.render('login', {
			'referer':req.query.referer,
			'error':req.query.error,
			nonce: req.nonce.get('login')
		});
	}
};

exports.register = function(req, res){
	if(req.user.login){
		// Already logged in. Cannot register
		req.db.end();
		res.redirect(302, '/');
	} else {
		req.db.end();
		res.render('register', {
			error: req.query.error,
			nonce: req.nonce.get('register')
		});
	}
};

exports.loginPost = function(req, res){
	if(req.user.login){
		req.db.end();
		res.redirect(302, '/');
	} else {
		if(!req.body.username || !req.body.password || req.body.username === "" ||
			req.body.password === ""){
			req.db.end();
			res.redirect(302, '/login?error=1');
			return;	
		}
		req.user.authenticate(req.body.username, req.body.password, function(result, data){
			if(result){
				req.db.end();
				res.redirect(302, '/');
			}else{
				req.db.end();
				res.redirect(302, '/login?error=2');
			}
			console.log("LOGIN " + req.body.username + " " + (result ? "OK" : "FAIL") + " " + JSON.stringify(data));
		});
	}
};

exports.registerPost = function(req, res){
	if(req.user.login){
		req.db.end();
		res.redirect(302, '/');
	} else {
		if(!req.body.fullname || !req.body.username || !req.body.password || 
			req.body.fullname === "" || req.body.username === "" || req.body.password === ""){
			req.db.end();
			res.redirect(302, '/register?error=3');
			return;	
		}
		if(req.body.password !== req.body.passwordrpt){
			req.db.end();
			res.redirect(302, '/register?error=1');
			return;	
		}
		var userObj = {
			fullname: req.body.fullname,
			privacy: 0,
			phone: req.body.phone,
			affiliation: req.body.aff,
			interests: req.body.interests ? req.body.interests.split(',') : [],
			address: req.body.address,
			email: req.body.email
		};
		var userlib = require('../lib/users.js');
		userinst = new userlib(req.db);
		userinst.createUser(req.body.username, req.body.password, userObj, function(result, data){
			if(result){
				if(req.session && req.session.user){
					req.session.user.uid = data.uid;
				}else{
					req.session.user = {uid:data.uid};
				}
				req.db.end();
				res.redirect(302, '/');
			}else{
				if(data !== null){
					req.db.end();
					res.redirect(302, '/register?error=2');
				} else {
					req.db.end();
					res.redirect(302, '/register?error=4');
				}
			}
			console.log("REGISTER " + req.body.username + " " + (result ? "OK" : "FAIL") + " " + JSON.stringify(data));
		});
	}
};

exports.logout = function(req, res){
	req.user.logout();
	req.db.end();
	res.redirect(302,'/login?referer=logout');
};

exports.fourohfour = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	req.db.end();
	res.render('404', {
		login:req.user.login,
		user:req.user.user
	});
};
