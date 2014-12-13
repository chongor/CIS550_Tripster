var userlib = require("../lib/users.js");
var sharelib= require("../lib/shares.js");
exports.photos = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	var shareinst = new sharelib(req.db);
	shareinst.getMultimedia(req.param("id"), function(data){
		console.log(data);
		if(data === null){
			res.render('404', {
				login:req.user.login,
				user:req.user.user
			});
			return;
		}
		res.render('photo', {
			login:req.user.login,
			user:req.user.user,
			media: data
		});
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
