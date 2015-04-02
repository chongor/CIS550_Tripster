/*
 * Library for calculating passwords consistently
 */
var crypto = require('crypto');

exports.createRandomString = function(len){
	var characters = 'abcdefgihjklmnopqrstuvwxyz0123456789'.split('');
	var output = '';
	while(len-- > 0){
		output += characters[Math.floor(Math.random() * characters.length)];
	};
	return output;
};

exports.createPassword = function(pass){
	var shasum = crypto.createHash('sha1');
	var salt = exports.createRandomString(5);
	shasum.update(pass + ":" + salt);
	return shasum.digest('hex') + "|" + salt;
};

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
		return (shasum.digest('hex')) === hashArr[0];
	}
	return false;
};

exports.md5 = function(string){
	var md5sum = crypto.createHash('md5');
	md5sum.update(string);
	return md5sum.digest('hex');
};
