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
	res.render('settings', {
			login:req.user.login,
			user:req.user.user,
			nonce:''
	});
};
