var passwords = require('../lib/passwords');
var Nonce = function(req){
	this.check = function(field, nonce){
		if(!req){
			return true;// No nonce support
		}
		if(this.get(field) === nonce){
			return true;
		}
		return false;
	};
	
	this.get = function(field){
		if(!req){
			return '';
		}
		if(req.session.nonce[field]){
			return req.session.nonce[field];
		}
		req.session.nonce[field] = passwords.createRandomString(10);
		return req.session.nonce[field];
	};
	
	this.invalidate = function(field){
		if(!req){
			return;
		}
		req.session.nonce[field] = passwords.createRandomString(10);
		return req.session.nonce[field];
	};
};

module.exports = function(){
	return function(req, res, next){
		if(!req.session){
			console.log('Error: No session! nonces will not work!');
			req.nonce = new Nonce(null);
			next();
			return;
		}
		if(!req.session.nonce || typeof req.session.nonce !== "object"){
			req.session.nonce = {};
		};
		req.nonce = new Nonce(req);
		next();
	}
};
