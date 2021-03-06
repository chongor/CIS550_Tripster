var userlib = require("../lib/users.js");
var reclib = require("../lib/recommendations.js");
var newslib = require("../lib/newsfeed.js");
var notelib = require("../lib/notifications.js");
var triplib = require('../lib/trips.js');

exports.profile = function(req, res){
	var userInst = new userlib(req.db);
	userInst.getUserByLogin(req.param("login"), function(data){
		if(data !== null){
			if(data.uid === req.user.user.uid){
				var target = data;
				target.isFriend = true;
				target.friendType = "friend";
				req.db.end();
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
						req.db.end();
						res.render('profile', {
							login:req.user.login,
							user:req.user.user,
							target:target
						});
					} else {
						req.db.end();ss
						res.render('500', {
							login:req.user.login,
							user:req.user.user,
							msg: "This user's profile is private and you're not a friend."
						});
					}
				});
			}
		}else{
			req.db.end();
			res.redirect(302, '/profile/' + req.user.user.username);
		}
	});
};

exports.settings = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	req.db.end();
	res.render('settings', {
			login:req.user.login,
			user:req.user.user,
			nonce:''
	});
};

exports.update = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	if(typeof req.body.field === "undefined" || req.body.field === null ||
		req.body.field === ""){
		req.db.end();
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
				req.db.end();s
				res.end(JSON.stringify({
					code:400,
					msg:(typeof err === "string") ? err : "Database error"
				}));
				return;
			}
			req.db.end();
			res.end(JSON.stringify({
				code:200,
				msg:"OK"
			}));
	});
};

exports.friends = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.json({
			code:503,
			msg:"Access denied. Not logged in."
		});
		return;
	}
	var userInst = new userlib(req.db);
	var target = req.param('id');
	userInst.getRelationship(req.user.user.uid, parseInt(target), function(rel){
		if(rel !== 'friend' && req.user.user.uid !== parseInt(target)){
			req.db.end();
			res.json({
				code:503,
				msg:"Access denied. Not a friend."
			});
			return;
		}
		userInst.getFriends(target, function(friends){
			if(!friends){
				req.db.end();
				res.json({
					code:400,
					msg:"DB error"
				});
				return;
			}
			var f = [];
			for(var i = 0 ; i < friends.length; i++){
				delete friends[i].password;
				f.push(friends[i]);
			}
			req.db.end();
			res.json({
				code:200,
				friends:f
			});
			return;
		});
	});
};

exports.newsfeed = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied. Not logged in."
		}));
		return;
	}
	var newsInst = new newslib(req.db);
	newsInst.getUserNewsfeed(req.user.user.uid, 30, function(nf, err){
		if(nf === null){
			req.db.end();
			res.end(JSON.stringify({
				code:400,
				msg:err
			}));
			return;
		}else{
			req.db.end();
			res.end(JSON.stringify({
				code:200,
				feed:nf
			}));
			return;
		}
	});
};

exports.addfriend = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	if(typeof req.body.friend === "undefined" || req.body.friend === null ||
		req.body.friend === ""){
		req.db.end();
		res.end(JSON.stringify({
			code:400,
			msg:"Bad Request. (No friend uid provided)"
		}));
		return;
	}
	var userInst = new userlib(req.db);
	userInst.friendRequest(req.user.user.uid, parseInt(req.body.friend), function(success, msg){
		if(success){
			userInst.getRelationship(req.user.user.uid, parseInt(req.body.friend), function(rel){
				if(rel === "friend"){
					var msg = req.user.user.fullname + " has approved your friend request.";
				} else {
					var msg = req.user.user.fullname + " has sent you a friend request.";
				}
				var noteinst = new notelib(req.db);
				noteinst.send(parseInt(req.body.friend), {
					"text":msg,
					"url":"/profile/" + req.user.user.username,
					"meta":"friendRequest"
				}, function(){			
					req.db.end();
					res.end(JSON.stringify({
						code:200,
						msg:"Added"
					}));
				});
			});
		} else {
			req.db.end();
			res.end(JSON.stringify({
				code:400,
				msg:msg
			}));
		}
	});
};

exports.unfriend = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	if(typeof req.body.friend === "undefined" || req.body.friend === null ||
		req.body.friend === ""){
		req.db.end();
		res.end(JSON.stringify({
			code:400,
			msg:"Bad Request. (No friend uid provided)"
		}));
		return;
	}
	var userInst = new userlib(req.db);
	userInst.unfriend(req.user.user.uid, parseInt(req.body.friend), function(success, msg){
		if(success){
			req.db.end();
			res.end(JSON.stringify({
				code:200,
				msg:"Removed"
			}));
		} else {
			req.db.end();
			res.end(JSON.stringify({
				code:400,
				msg:msg
			}));
		}
	});
};

exports.recommendFriend = function(req, res){
	if(!req.user.login){
		req.db.end();
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
			req.db.end();
			res.end(JSON.stringify({
				code:200,
				recommend:data
			}));
			return;
		} else {
			userInst.getUsers(data, function(result){
				if(result === null){
					req.db.end();
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
					req.db.end();
					res.end(JSON.stringify({
						code:200,
						recommend:users
					}));
				}
			});
		}
	});
};

exports.recommendTrip = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	var tripInst = new triplib(req.db);
	var recInst = new reclib(req.db);
	recInst.recommendTrip(req.user.user.uid, 20, function(data){
		if(data.length === 0){
			req.db.end();
			res.end(JSON.stringify({
				code:200,
				recommend:data
			}));
			return;
		} else {
			tripInst.getTripList(data, function(result){
				if(result === null){
					req.db.end();
					res.end(JSON.stringify({
						code:400,
						msg:'Error: Could not get user data'
					}));
					return;
				}else{
					var trips = [];
					for(var i = 0; i < result.length; i++){
						trips.push(result[i]);
					}
					req.db.end();
					res.end(JSON.stringify({
						code:200,
						recommend:trips
					}));
				}
			});
		}
	});
};
