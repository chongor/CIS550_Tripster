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
	tripinst.getTrip(req.param("id"), function(trip){
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
