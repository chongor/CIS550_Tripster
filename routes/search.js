var searchlib = require("../lib/search.js");

exports.search = function(req, res){
	if(!req.user.login){
		res.redirect(302, '/login');
		return;
	}
	var searchInst = new searchlib(req.db);
	var searchString = req.query ? req.query.s : "";
	if(typeof searchString !== "string"){
		searchString = "";
	}
	searchInst.searchUsers(searchString, 1000, function(users){
		res.render('search', {
			login:req.user.login,
			user:req.user.user,
			resultsUsers:users
		});
	});
};

