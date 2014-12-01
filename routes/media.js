var userlib = require("../lib/users.js");
exports.photos = function(req, res){
	res.render('photo', {
		login:req.user.login,
		user:req.user.user
	});
};

exports.albums = function(req, res){
	res.render('album', {
		login:req.user.login,
		user:req.user.user
	});
};
