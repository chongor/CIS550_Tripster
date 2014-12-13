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
		if(data.type !== "photo"){
			res.redirect(302, '/' + data.type + '/' + req.param('id'));
			return;
		}
		res.render('photo', {
			login:req.user.login,
			user:req.user.user,
			media: data
		});
	});
};

exports.videos = function(req, res){
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
		if(data.type !== "video"){
			res.redirect(302, '/' + data.type + '/' + req.param('id'));
			return;
		}
		res.render('video', {
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

exports.createAlbum = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	res.render('album-create', {
		login:req.user.login,
		user:req.user.user
	});
};

exports.createAlbumPost = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	res.redirect(302,'/album/');
};

exports.post = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	console.log(req.body);
	res.redirect(302, '/');
};

exports.ratings = function(req, res){
	if(!req.user.login){
		res.end(JSON.stringify({
			code:503,
			msg: 'Not logged in'
		}));
		return;
	}
	var shareInst = new sharelib(req.db);
	shareInst.getRating(req.param('id'), 0, 100, function(list, rating){
		if(list === null){
			res.end(JSON.stringify({
				code:400,
				msg:'Read Error!'
			}));
			return;
		}
		res.end(JSON.stringify({
			code:200,
			comments:list,
			rating:rating
		}));
	});
}
