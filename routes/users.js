var userlib = require("../lib/users.js");
var reclib = require("../lib/recommendations.js");
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
					if(target.privacy === 0 || rel === "friend" || rel === "from"){
						res.render('profile', {
							login:req.user.login,
							user:req.user.user,
							target:target
						});
					} else {
						res.render('500', {
							login:req.user.login,
							user:req.user.user,
							msg: "This user's profile is private and you're not a friend."
						});
					}
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

exports.update = function(req, res){
	if(!req.user.login){
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	if(typeof req.body.field === "undefined" || req.body.field === null ||
		req.body.field === ""){
		res.end(JSON.stringify({
			code:400,
			msg:"Bad Request. (No field name provided)"
		}));
		return;
	}
	var userInst = new userlib(req.db);
	var updater = {};
	updater[req.body.field] = req.body.value;
	userInst.updateUser(req.user.user.uid, updater,function(result, err){
			if(!result){
				res.end(JSON.stringify({
					code:400,
					msg:(typeof err === "string") ? err : "Database error"
				}));
				return;
			}
			res.end(JSON.stringify({
				code:200,
				msg:"OK"
			}));
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

exports.unfriend = function(req, res){
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
	userInst.unfriend(req.user.user.uid, parseInt(req.body.friend), function(success, msg){
		if(success){
			res.end(JSON.stringify({
				code:200,
				msg:"Removed"
			}));
		} else {
			res.end(JSON.stringify({
				code:400,
				msg:msg
			}));
		}
	});
};

exports.recommendFriend = function(req, res){
	if(!req.user.login){
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	var userInst = new userlib(req.db);
	var recInst = new reclib(req.db);
	recInst.recommendFriend(req.user.user.uid, 20, function(data){
		if(data.length === 0){
			res.end(JSON.stringify({
				code:200,
				recommend:data
			}));
			return;
		} else {
			userInst.getUsers(data, function(result){
				if(result === null){
					res.end(JSON.stringify({
						code:400,
						msg:'Error: Could not get user data'
					}));
					return;
				}else{
					var users = [];
					for(var i = 0; i < result.length; i++){
						delete result[i].password;
						users.push(result[i]);
					}
					res.end(JSON.stringify({
						code:200,
						recommend:users
					}));
				}
			});
		}
	});
};
