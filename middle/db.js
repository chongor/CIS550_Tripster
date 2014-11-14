var Q = require("mysql");
var config = require("../config.js");

module.exports = function(){
	var connection = Q.createConnection(config.db);
	
	return function(req, res, next){
		connection.connect(function(err){
			if(err){
				console.log("Error connecting:" + err.stack)l
				req.db = null;
				next();
				return;
			}
			next();
		});
		req.db = connection;
	}
};
