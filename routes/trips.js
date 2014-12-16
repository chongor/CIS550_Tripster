var userlib = require("../lib/users.js");
var triplib = require("../lib/trips.js");

exports.create = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	req.db.end();
	res.render('trip-create', {
		login:req.user.login,
		user:req.user.user,
		error:req.query.error
	});
};

exports.createTrip = function(req, res){
	if(!req.user.login){
		req.db.end();
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
		req.db.end();
		res.redirect(302, '/trip/create?error=1');
		return;
	} else if (title === "" || startDate === "" || endDate === "" ){
		req.db.end();
		res.redirect(302, '/trip/create?error=1');
		return;
	}
	var dateformat = /^\d{4}-\d{1,2}-\d{1,2}$/;
	if(!dateformat.test(startDate) || !dateformat.test(endDate)){
		req.db.end();
		res.redirect(302, '/trip/create?error=3');
		return;
	}
	var tripJson = {title: title, startDate: startDate, endDate: endDate, time: time,
	description: description, privacy: privacy };
	var tripinst = new triplib(req.db);
	tripinst.createTrip(req.user.user.uid, tripJson, function(success, tid) {
		if (!success || tid === null) {
			req.db.end();
			res.redirect(302, '/trip/create?error=2');
			return;
		}
		req.db.end();
		res.redirect(302, '/trip/' + tid);
	}.bind(this));
};

exports.mine = function(req,res){
	// Returns both the trips you manage, and the trips you are only a member of
	if(!req.user.login){
		req.db.end();
		res.json({code: 500});
		return;
	}
	var uid = req.user.user.uid;
	var tripinst = new triplib(req.db);
	tripinst.getTripByOwner(uid, function(ownTrips) {
		if (ownTrips === null) {
			req.db.end();
			res.json({code: 400});
			return;
		}
		tripinst.getTripByMembership(uid, function(memberTrips) {
			if (memberTrips === null) {
				req.db.end();
				res.json({code: 400});
				return;
			}
			req.db.end();
			res.json({code:200, owntrips: ownTrips, membertrips: memberTrips});
		}.bind(this));
	}.bind(this));
};

exports.schedules = function(req,res){
	if(!req.user.login){
		req.db.end();
		res.json({
			code: 500,
			msg: 'Access Denied. Not logged in'
		});
		return;
	}
	var target = req.param('id');
	var tripinst = new triplib(req.db);
	tripinst.canView(req.user.user.uid, target, function(can){
		if(!can){
			req.db.end();
			res.json({
				code: 500,
				msg: 'Access Denied. Not permitted to view trip'
			});
			return;
		}
		tripinst.getSchedule(target, function(schedules, err){
			if(schedules === null){
				req.db.end();
				res.json({
					code: 400,
					msg: err
				});
				return;
			}
			req.db.end();
			res.json({
				code: 200,
				schedules: schedules
			});
			return;
		});
	});
};


exports.invitables = function(req,res){
	if(!req.user.login){
		req.db.end();
		res.json({code: 500});
		return;
	}
	var target = req.param('id');
	var inviter = req.user.user.uid;
	var tripinst = new triplib(req.db);
	tripinst.getInvitables(inviter, target, function(data) {
		if (data === null) {
			req.db.end();
			res.json({code: 500});
			return;
		}
		req.db.end();
		res.json({code: 200, invitables: data});
		return;
	}.bind(this));
};

exports.inviteJoin = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.json({code: 500});
		return;
	}
	var tid = req.body.tid;
	var target = req.body.target;
	var inviter = req.user.user.uid;
	var tripinst = new triplib(req.db);
	tripinst.inviteJoin(inviter, target, tid, function(success) {
		if (success) {
			req.db.end();
			res.json({code: 200});
		} else {
			req.db.end();
			res.json({code: 500});
		}
	}.bind(this));
};

exports.requestJoin = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.json({code: 500});
		return;
	}
	if(typeof req.body.requester === "undefined"){
		req.body.requester = req.user.user.uid;
	}
	var requester = req.body.requester;
	var tid = req.body.tid;
	var tripinst = new triplib(req.db);
	tripinst.requestJoin(requester, tid, function(success) {
		if (success) {
			req.db.end();
			res.json({code: 200});
		} else {
			req.db.end();
			res.json({code: 500});
		}
	}.bind(this));
};

exports.approveJoin = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.json({code: 500});
		return;
	}
	var newmember = req.body.newmember;
	var tid = req.body.tid;
	var tripinst = new triplib(req.db);
	tripinst.approveJoin(newmember, tid, function(success) {
		if (success) {
			req.db.end();
			res.json({code: 200});
		} else {
			req.db.end();
			res.json({code: 500});
		}
	}.bind(this));
};

exports.view = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	var tripinst = new triplib(req.db);
	tripinst.canView(req.user.user.uid, req.param("id"), function(canView, trip, msg){
		if(!canView){
			req.db.end();
			res.render('500', {
				login:req.user.login,
				user:req.user.user,
				msg:msg
			});
			return;
		}
		if(trip !== null){
			req.db.end();
			res.render('trip', {
				login:req.user.login,
				user:req.user.user,
				trip:trip
			});
		}else{
			req.db.end();
			res.render('404', {
				login:req.user.login,
				user:req.user.user
			});
		}
	});
};

exports.members = function(req, res){
	if(!req.user.login){
		req.db.end();
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
			req.db.end();
			res.end(JSON.stringify({
				code:500,
				msg:(trip === null ? "Nonexistant Trip" : "Not authorized")
			}));
			return;
		}
		tripinst.getMembers(tripid, function(members){
			if(members === null){
				req.db.end();
				res.end(JSON.stringify({
					code:500,
					msg:"Failed to get member list"
				}));
				return;
			}else{
				if(members.length === 0){
					req.db.end();
					res.end(JSON.stringify({
						code:200,
						isAdmin:(trip.owner === req.user.user.uid),
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
				var isAdmin = (usermap[req.user.user.uid] && usermap[req.user.user.uid].isAdmin) || req.user.user.uid === trip.owner;
				var isMember = (usermap[req.user.user.uid] && usermap[req.user.user.uid].isMember);
				userinst.getUsers(userlist, function(users) {
					if(users === null){
						req.db.end();
						res.end(JSON.stringify({
							code:500,
							msg:"Failed to get user data"
						}));
						return;
					}
					var list = [];
					for(var i = 0; i < users.length; i++){
						delete users[i].password;
						var userRole = usermap[users[i].uid];
						if (!isAdmin && userRole.isRequested && !userRole.isMember) {
							continue;
						}
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
					req.db.end();
					res.end(JSON.stringify({
						code:200,
						members:list,
						isAdmin:isAdmin,
						isMember: isMember
					}));
					return;
				}.bind(this));
			}
		});
	});
};

exports.checklist = function(req, res){
	if(!req.user.login){
		req.db.end();
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
			req.db.end();
			res.end(JSON.stringify({
				code:400,
				msg:err
			}));
			return;
		} else {
			req.db.end();
			res.end(JSON.stringify({
				code:200,
				checklist: items
			}));
			return;
		}
	});
};

exports.rating = function(req, res){
	if(!req.user.login){
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	console.log(req.body);
	var tripinst = new triplib(req.db);
	var trip = req.param('id');
	if(req.method == "GET"){
		tripinst.getRating(trip, 1, 24, function(ratings, err){
			if(ratings == null){
				res.end(JSON.stringify({
					code:400,
					msg:err
				}));
				return;
			} else {
				res.end(JSON.stringify({
					code:200,
					rating: ratings
				}));
				return;
			}
		});
	} else {
		// Post request
		var rating = req.body.rating;
		console.log(rating);
		var comment = req.body.comment;
		tripinst.addRating(trip, req.user.user.uid, rating, comment, function(success) {
			if (success) {
				res.json({code: 200});
			} else {
				res.json({code: 500});
			}
		});
	}
};

exports.addItem = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.end(JSON.stringify({
			code:503,
			msg:"Access denied."
		}));
		return;
	}
	var tripinst = new triplib(req.db);
	var tid = req.body.tid;
	var description = req.body.description;
	tripinst.addItem(tid, description, function(success, err){
		if(success){
			res.json({code: 200, desc: description});
			return;
		}
		res.json({code: 400, msg: err});
	}.bind(this));
};






