/*
 * Library for calculating passwords consistently
 */
var crypto = require('crypto');

exports.checkHash = function(pass, hash){
	if(hash === null){
		return false;
	}
	var hashArr = hash.split('|');
	var shasum = crypto.createHash('sha1');
	if(hashArr.length === 1){
		shasum.update(pass);
		return shasum.digest('hex') === hash;
	}else{
		shasum.update(pass + ":" + hashArr[1]);
		return (shasum.digest('hex') + "|" + hashArr[1]) === hash;
	}
	return false;
};