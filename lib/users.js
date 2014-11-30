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
		callback();
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
				callback(data[0]);
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
