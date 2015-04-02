var localib = require('../lib/locations.js');

exports.location = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
	}
	var locainst = new localib(req.db);
	locainst.getLocation(req.param('id'), function(data){
		if(data === null){
			req.db.end();
			res.render('404', {
				login: req.user.login,
				user: req.user.user
			});
			return;
		}
		res.render('location', {
			login: req.user.login,
			user: req.user.user,
			location: data
		});
	});
};
