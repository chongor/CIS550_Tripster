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
