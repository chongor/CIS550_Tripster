var userlib = require("../lib/users.js");
exports.photos = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	res.render('photo', {
		login:req.user.login,
		user:req.user.user
	});
};

exports.albums = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	res.render('album', {
		login:req.user.login,
		user:req.user.user
	});
};
