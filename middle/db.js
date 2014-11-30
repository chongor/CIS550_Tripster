var Q = require("mysql");
var config = require("../config.js");

module.exports = function(){
	return function(req, res, next){
		var connection = Q.createConnection(config.db);
		connection.connect(function(err){
			if(err){
				console.log("Error connecting:" + err.stack);
				req.db = null;
				next();
				return;
			}
			next();
		});
		req.db = connection;
	}
};
