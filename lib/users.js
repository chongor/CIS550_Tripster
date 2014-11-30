/**
 * Library for obtaining user information
 */
var mysql = require('mysql');
var passwords = require('./passwords.js');
module.exports = function(db){
	if(!db){
		throw new Error('Database Connection Not Passed In');
	}
	
	this.getUser = function(uid, callback){
		db.query('SELECT * FROM users WHERE uid = ?', uid, function(err, data){
			if(err){
				callback(null);
				return;
			}else{
				if(data.length === 0){
					callback(null);
					return;
				}
				var u = data[0];
				callback({
					"fullname": data[0].name,
					"username": data[0].login,
					"uid":data[0].uid,
					"affiliation":data[0].affiliation,
					"interests":(data[0].interests !== null ? data[0].interests.split(",") : []),
					"password":data[0].password,
					"address":data[0].address,
					"phone":data[0].phone,
					"email":data[0].email,
					"privacy":data[0].privacy
				});
				return;
			}
		});
		return;
	};

	this.getUserByLogin = function(login, callback){
		db.query('SELECT * FROM users WHERE login = ?', login, function(err, data){
			if(err){
				callback(null);
				return;
			}else{
				if(data.length === 0){
					callback(null);
					return;
				}
				var u = data[0];
				callback({
					"fullname": data[0].name,
					"login":data[0].login,
					"uid":data[0].uid,
					"affiliation":data[0].affiliation,
					"interests":(data[0].interests !== null ? data[0].interests.split(",") : []),
					"password":data[0].password,
					"address":data[0].address,
					"phone":data[0].phone,
					"email":data[0].email,
					"privacy":data[0].privacy
				});
				return;
			}
		});
		return;
	};
	
	this.authenticate = function(login, password, callback){
		this.getUserByLogin(login, function(user){
			if(user !== null){
				if(passwords.checkHash(password, user.password)){
					callback(true, user);
				}else{
					callback(false, user);
				}
			}else{
				callback(false, null);
				return;
			}
		});
		return;
	};
}
