/**
 * Library for obtaining user information
 * @jim
 */
var mysql = require('mysql');
var passwords = require('./passwords.js');
module.exports = function(db){
	if(!db){
		throw new Error('Database Connection Not Passed In');
	}
	var getAvatar = function(email){
		if(email === null){
			email = '';
		}
		return "http://www.gravatar.com/avatar/" + passwords.md5(email.toLowerCase());
	};
	var dbRecordToUser = function(dbRecord){
		return {
			"fullname": dbRecord.name,
			"username": dbRecord.login,
			"uid":dbRecord.uid,
			"affiliation":dbRecord.affiliation,
			"interests":(dbRecord.interests !== null ? dbRecord.interests.split(",") : []),
			"password":dbRecord.password,
			"address":dbRecord.address,
			"phone":dbRecord.phone,
			"email":dbRecord.email,
			"privacy":dbRecord.privacy,
			"avatar":getAvatar(dbRecord.email)
		};
	}
	this.getAvatar = getAvatar;
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
				callback(dbRecordToUser(data[0]));
				return;
			}
		});
		return;
	};
	
	this.getUsers = function(list, callback){
		db.query('SELECT * FROM users WHERE uid IN (?)', [list], function(err, data){
			if(err){
				callback(null);
				return;
			}else{
				var u = [];
				for(var i = 0; i < data.length; i++){
					u.push(dbRecordToUser(data[i]));
				}
				callback(u);
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
				callback(dbRecordToUser(data[0]));
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
	
	this.getRelationship = function(uid1, uid2, callback){
		db.query('SELECT * FROM friends WHERE (`src_uid` = ? AND `dest_uid` = ?) OR (`src_uid` = ? AND `dest_uid` = ?)', [uid1, uid2, uid2, uid1], function(err, data){
			console.log(data);
			if(err){
				callback("none");
				return;
			}else{
				if(data.length === 0){
					callback("none");
					return;
				}
				var isFriend = false;
				var isFollower = false;
				for(var i = 0; i < data.length; i++){
					if(data[i].src_uid === uid1){
						isFriend = true;
					}
					if(data[i].dest_uid === uid1){
						isFollower = true;
					}
				}
				if(isFriend){
					callback(isFollower ? "friend" : "to");
				} else{
					callback(isFollower ? "from" : "none");
				}
				return;
			}
		});
	};
	
	/* Create */
	this.createUser = function(login, password, fields, callback){
		var self = this;
		if(login === null || password === null || fields === null ||
			typeof login !== "string" || typeof password !== "string" || 
			typeof fields !== "object"){
			callback(false, null, null);
			return;	
		}else{
			this.getUserByLogin(login, function(resp){
				if(resp !== null){
					callback(false, resp, null);// User exists!
				}else{
					var uobj = {
						'name': fields.fullname ? fields.fullname : login,
						'login': login,
						'password': passwords.createPassword(password),
						'privacy': fields.privacy ? fields.privacy : 0,
						'address': fields.address ? fields.address : '',
						'phone': fields.phone ? fields.phone : '',
						'affiliation': fields.affiliation ? fields.affiliation : 'None',
						'interests': fields.interests ? fields.interests.join(',') : '',
						'email': fields.email ? fields.email : ''
					};
					db.query('INSERT INTO users (name, login, password, privacy, address, phone, affiliation, interests, email) VALUES (?)',
						[[uobj.name, uobj.login, uobj.password, uobj.privacy, uobj.address, 
						uobj.phone, uobj.affiliation, uobj.interests, uobj.email]], function(err, data){
						if(err){
							callback(false, null, err);
						}else{
							self.getUserByLogin(login, function(resp){
								callback(resp !== null, resp, null);
							});
						}
					});
				}
			});
		}
	};
	
	this.friendRequest = function(from, to, callback){
		this.getRelationship(from, to, function(rel){
			if(rel !== "to"){
				db.query("INSERT INTO friends (`src_uid`, `dest_uid`) VALUES(?, ?)", [from, to], function(err, data){
					if(err){
						callback(false, err);
						return;
					}
					// Success
					if(rel === "none"){
						callback(true, "to");
					}else{
						callback(true, "friend");
					}
					return;
				});
			} else {
				callback(true, "Already friends");
			}
		});
	};
	
	this.unfriend = function(from, to, callback){
		this.getRelationship(from, to, function(rel){
			if(rel !== "none"){
				db.query("DELETE FROM friends WHERE (`src_uid` = ? AND `dest_uid` = ?) OR (`src_uid` = ? AND `dest_uid` = ?)", [from, to, to, from], function(err, data){
					if(err){
						callback(false, err);
						return;
					}
					// Success
					callback(true);
					return;
				});
			} else {
				callback(true, "Already unfriended");
			}
		});
	};
}
