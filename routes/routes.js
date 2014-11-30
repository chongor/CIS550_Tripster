exports.main = function(req, res){
	if(req.user.login){
		console.log(req.user);
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
		req.user.authenticate(req.body.username, req.body.password, function(result){
			if(result){
				res.redirect(302, '/');
			}else{
				res.redirect(302, '/login?error=2');
			}
		});
	}
};

exports.logout = function(req, res){
	res.user.logout();
	res.redirect(302,'/login?referer=logout');
};
