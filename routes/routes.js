exports.main = function(req, res){
	if(req.user.login){
		res.render('index', {
			login:req.user.login,
			user:req.user.user
		});
	} else {
		res.redirect(302, '/login');
	}
};

exports.login = function(req, res){
	if(req.user.login){
		// Already logged in 
		res.redirect(302, '/');
	} else {
		res.render('login', {
			'referer':req.query.referer,
			'error':req.query.error
		});
	}
};

exports.loginPost = function(req, res){
	if(req.user.login){
		res.redirect(302, '/');
	} else {
		if(!req.body.username || !req.body.password || req.body.username === "" ||
			req.body.password === ""){
			res.redirect(302, '/login?error=1');
			return;	
		}
		req.user.authenticate(req.body.username, req.body.password, function(result, data){
			if(result){
				res.redirect(302, '/');
			}else{
				res.redirect(302, '/login?error=2');
			}
			console.log("LOGIN " + req.body.username + " " + (result ? "OK" : "FAIL") + " " + JSON.stringify(data));
		});
	}
};

exports.logout = function(req, res){
	req.user.logout();
	res.redirect(302,'/login?referer=logout');
};
