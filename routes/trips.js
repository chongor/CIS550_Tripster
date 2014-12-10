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

exports.createTrip = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	var title = req.body.title;
	var startDate = req.body.startdate;
	var endDate = req.body.enddate;
	var time = null;
	var description = req.body.description || "";
	var privacy = +req.body.privacy;
	if (typeof title === "undefined" || 
	typeof startDate === "undefined" || typeof endDate === "undefined" || typeof privacy === "undefined") {
		res.redirect(302, '/trip/create?error=1');
		return;
	}
	var tripJson = {title: title, startDate: startDate, endDate: endDate, time: time,
	description: description, privacy: privacy };
	var tripinst = new triplib(req.db);
	tripinst.createTrip(req.user.user.uid, tripJson, function(success, tid) {
		if (!success || tid === null) {

			res.redirect(302, '/trip/create?error=2');
			return;
		}
		res.redirect(200, '/trip/' + tid);
	}.bind(this));
};

exports.invitables = function(req,res){
	if(!req.user.login){
		res.json({code: 500});
		return;
	}
	var target = req.param('id');
	var inviter = req.user.user.uid;
	var tripinst = new triplib(req.db);
	tripinst.getInvitables(inviter, target, function(data) {
		if (data === null) {
			res.json({code: 500});
			return;
		}
		res.json({code: 200, invitables: data});
		return;
	}.bind(this));
};

exports.inviteJoin = function(req, res){
	if(!req.user.login){
		res.json({code: 500});
		return;
	}
	var tid = req.body.tid;
	var target = req.body.target;
	var inviter = req.user.user.uid;
	var tripinst = new triplib(req.db);
	tripinst.inviteJoin(inviter, target, tid, function(success) {
		if (success) {
			res.json({code: 200});
		}
		else {
			res.json({code: 500});
		}
	}.bind(this));
};

exports.requestJoin = function(req, res){
	if(!req.user.login){
		res.json({code: 500});
		return;
	}
	var requester = req.body.requester;
	var tid = req.body.tid;
	var tripinst = new triplib(req.db);
	tripinst.requestJoin(requester, tid, function(success) {
		if (success) {
			res.json({code: 200});
		} else {
			res.json({code: 500});
		}
	}.bind(this));
};

exports.approveJoin = function(req, res){
	if(!req.user.login){
		res.json({code: 500});
		return;
	}
	var newmember = req.body.newmember;
	var tid = req.body.tid;
	var tripinst = new triplib(req.db);
	tripinst.approveJoin(newmember, tid, function(success) {
		if (success) {
			res.json({code: 200});
		} else {
			res.json({code: 500});
		}
	}.bind(this));
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
