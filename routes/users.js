var userlib = require("../lib/users.js");
exports.profile = function(req, res){
	var userInst = new userlib(req.db);
	userInst.getUserByLogin(req.param("login"), function(data){
		if(data !== null){
			if(data.uid === req.user.user.uid){
				var target = data;
				target.isFriend = true;
				target.friendType = "friend";
				res.render('profile', {
					login:req.user.login,
					user:req.user.user,
					target:target
				});
			}else{
				userInst.getRelationship(req.user.user.uid, data.uid, function(rel){
					var target = data;
					target.isFriend = (rel === "friend");
					target.friendType = rel;
					res.render('profile', {
						login:req.user.login,
						user:req.user.user,
						target:target
					});
				});
			}
		}else{
			res.redirect(302, '/profile/' + req.user.user.username);
		}
	});
};

exports.settings = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	res.render('settings', {
			login:req.user.login,
			user:req.user.user,
			nonce:''
	});
};

exports.addfriend = function(req, res){
	if(!req.user.login){
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	if(typeof req.body.friend === "undefined" || req.body.friend === null ||
		req.body.friend === ""){
		res.end(JSON.stringify({
			code:400,
			msg:"Bad Request. (No friend uid provided)"
		}));
		return;
	}
	var userInst = new userlib(req.db);
	userInst.friendRequest(req.user.user.uid, parseInt(req.body.friend), function(success, msg){
		if(success){ 
			res.end(JSON.stringify({
				code:200,
				msg:"Added"
			}));
		} else {
			res.end(JSON.stringify({
				code:400,
				msg:msg
			}));
		}
	});
};
