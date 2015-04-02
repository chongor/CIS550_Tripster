var Q = require('node-s3');
var config = require("../config.js");

module.exports = function(){
	return function(req, res, next){
		req.s3 = Q(config.s3);
		req.s3.url = "https://s3.amazonaws.com/" + config.s3.bucket + "/";
		next();
	}
};
