var userlib = require("../lib/users.js");
var triplib = require("../lib/trips.js");

exports.create = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	res.render('trip-create', {
		login:req.user.login,
		user:req.user.user
	});
};

exports.view = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	var tripinst = new triplib(req.db);
	tripinst.canView(req.user.user.uid, req.param("id"), function(canView, trip, msg){
		if(!canView){
			res.render('500', {
				login:req.user.login,
				user:req.user.user,
				msg:msg
			});
			return;
		}
		if(trip !== null){
			res.render('trip', {
				login:req.user.login,
				user:req.user.user,
				trip:trip
			});
		}else{
			res.render('404', {
				login:req.user.login,
				user:req.user.user
			});
		}
	});
};

exports.members = function(req, res){
	if(!req.user.login){
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	var tripinst = new triplib(req.db);
	var tripid = req.param('id');
	
	tripinst.canView(req.user.user.uid, tripid, function(canView, trip, msg){
		if(!canView){
			res.end(JSON.stringify({
				code:500,
				msg:(trip === null ? "Nonexistant Trip" : "Not authorized")
			}));
			return;
		}
		tripinst.getMembers(tripid, function(members){
			if(members === null){
				res.end(JSON.stringify({
					code:500,
					msg:"Failed to get member list"
				}));
				return;
			}else{
				if(members.length === 0){
					res.end(JSON.stringify({
						code:200,
						members:[]
					}));
					return;
				}
				var userinst = new userlib(req.db);
				var userlist = [], usermap = {};
				for(var i = 0; i < members.length; i++){
					userlist.push(members[i].uid);
					usermap[members[i].uid] = members[i].role;
				}
				userinst.getUsers(userlist, function(users) {
					if(users === null){
						res.end(JSON.stringify({
							code:500,
							msg:"Failed to get user data"
						}));
						return;
					}
					var list = [];
					for(var i = 0; i < users.length; i++){
						delete users[i].password;
						list.push({
							user: {
								uid:users[i].uid,
								login:users[i].username,
								fullname:users[i].fullname,
								avatar:users[i].avatar
							},
							role: usermap[users[i].uid]
						});
					};
					res.end(JSON.stringify({
						code:200,
						members:list
					}));
					return;
				});
			}
		});
	});
};

exports.checklist = function(req, res){
	if(!req.user.login){
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	var tripinst = new triplib(req.db);
	var trip = req.param('id');
	tripinst.getChecklist(trip, function(items, err){
		if(items === null){
			res.end(JSON.stringify({
				code:400,
				msg:err
			}));
			return;
		} else {
			res.end(JSON.stringify({
				code:200,
				checklist: items
			}));
			return;
		}
	});
};
