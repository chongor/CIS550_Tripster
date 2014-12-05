/**
 * Library for obtaining user information
 */

 //this = private method
 //var func = global
 //module.exports loads all the functions needed when required
var mysql = require('mysql');


/*
	functions needed

	DONE:
	- getShareables
	- share to users
	- share to trip
	- get comments/rates for shareables
	- add comment/rate shareables

	TODO:
	- is viewable by user (takes shareable id returns uids)
	- change privacy of shareable
	- add shareable to album (take returned shareable id and place into album in db)
	- get album items
	- add shareable to db (take shareable add to db)
	
	//generally callback, return the id
*/


module.exports = function(db){
	if(!db){
		throw new Error('Database Connection Not Passed In');
	}

	var dbRecordToShareable = function(dbRecord){
		return {
			"type": dbRecord.type,
			"id": dbRecord.id,
			"owner_id": dbRecord.owner_id,
			"time": dbRecord.time
		};
	}

	this.getShareable = function(s_id, callback){
		db.query('SELECT * FROM shareabls WHERE id = ?', s_id, function(err, data){
			if(err){
				callback(null);
				return;
			}
			else{
				if (data.length === 0){
					callback(null);
					return;
				}
				var s = data[0];
				callback(dbRecordToShareable(s));
				return;
			}
		});
		return;
	};

	this.getAlbumItems = function(a_id, callback){
		db.query('SELECT * FROM album_items WHERE id = ?', a_id, function(err,data){
			if(err){
				callback(null);
				return;
			}
			else{
				var item_list = [];

				for (int i = 0; i < data.length - 1; i++){
					item_list.push(data[i].item_id, data[i].type);
				}
				callback(item_list);
				return;
			}
		});
	};

	this.getRating = function(s_id, callback){
		db.query('SELECT * FROM shareable_ratings WHERE id = ?', s_id, function(err, data){
			if(err){
				callback(null);
				return;
			}
			else{
				var rating_list = [];

				for (int i = 0; i < data.length - 1; i++){
					rating_list.push(data[i].rating, data[i].comment, data[i].rater_id);
				}
				callback(rating_list);
				return;
			}
		});
	};

	this.addRating = function( type, id, rating, comment, rater_id, callback){
		db_query('INSERT INTO shareable_ratings (type, id, rating, comment, rate_id) VALUES (?)', [[type, id, rating, comment, rater_id]], function(err, data){

			if(err){
				// couldn't insert new rating
				callback(null);
				return;
			}
			else{
				//inserted successfully, return rating's id
				callback(true, id);
				return;
			}
		});
	};

	this.user_share = function(type, id, src_uid, dest_uid, time, callback){
		db.query('INSERT INTO share (type, id, src_uid, dest_uid, time) VALUE (?)',[[type, id, src_uid, dest_uid, time]], function(err,data){

			if(err){
				// couldn't insert share
				callback(false, null);
				return;
			}
			else{
				//inserted successfully, return shared media's id
				callback(true, id);
				return;
			}

		});
	};

	this.trip_share = function(id, type, trip_id, privacy, callback){

		db.query('INSERT INTO trip_shareables (id, type, trip_id, privacy) VALUES (?)', [[id, type, trip_id, privacy]],function(err,data){

			if(err){
				// couldn't insert share
				callback(false, null);
				return;
			}
			else{
				//inserted successfully, return shared media's id
				callback(true, id);
				return;
			}

		});

	};

	this.addShareable = function(type, data, uid, time, callback){
		db.query('INSERT INTO shareables (type, id, owner_id, time) VALUES (?)',  ,function(err, data){
			db.query('INSERT INTO ', ,function(err,data)
			{
				db.query('', ,function(err,data)){
					callback
				}
			}
		}

	});

}

//----------- USERS FUNCTIONS ----------

module.exports = function(db){
	if(!db){
		throw new Error('Database Connection Not Passed In');
	}
	var getAvatar = function(email){
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
}