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
	- get album items

	TODO:
	- is viewable by user (takes shareable id returns uids)
	- change privacy of shareable
	- add shareable to album (take returned shareable id and place into album in db)
	- add shareable to db (take shareable add to db)
	- create an album

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
	
	this.getTableByType = function(type){
		switch(type){
			case "photo":
			case "video":
				return "multimedia";
			case "album":
				return "shareable_album";
			case "url":
				return "shareable_links";
			default:
				return null;
		}
	};
	
	this.getShareable = function(s_id, callback){
		db.query('SELECT * FROM shareables WHERE `id` = ?', [s_id], function(err, data){
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

				for (var i = 0; i < data.length - 1; i++){
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

				for (var i = 0; i < data.length - 1; i++){
					rating_list.push(data[i].rating, data[i].comment, data[i].rater_id);
				}
				callback(rating_list);
				return;
			}
		});
	};

	this.addRating = function( item_id, rating, comment, rater_id, callback){
		db_query('INSERT INTO shareable_ratings (item_id, rating, comment, rate_id) VALUES (?)', [[item_id, rating, comment, rater_id]], function(err, data){

			if(err){
				// couldn't insert new rating
				callback(null);
				return;
			}
			else{
				//inserted successfully, return pair(item_id, rater_id)
				callback(true, (item_id, rater_id));
				return;
			}
		});
	};

	this.user_share = function(item_id, src_uid, dest_uid, callback){
		db.query('INSERT INTO share (id, src_uid, dest_uid, time) VALUE (?)',[[item_id, src_uid, dest_uid, CURRENT_TIMESTAMP()]], function(err,data){

			if(err){
				// couldn't insert share
				callback(false, null);
				return;
			}
			else{
				//inserted successfully, return pair(item_id, trip_id)
				callback(true, (item_id, trip_id));
				return;
			}

		});
	};

	this.trip_share = function(item_id, trip_id, privacy, callback){

		db.query('INSERT INTO trip_shareables (item_id, trip_id, privacy, time) VALUES (?)', [[item_id, trip_id, privacy, CURRENT_TIMESTAMP()]],function(err,data){

			if(err){
				// couldn't insert share
				callback(false, null);
				return;
			}
			else{
				//if inserted, return pair(item_id, trip_id)
				callback(true, (item_id, trip_id));
				return;
			}

		});

	};

	//IS IT FOR TRIP_SHAREABLES OR SHARES ??
	this.isViewable = function(s_id, uid, callback){


	};

	this.changePrivacy = function(s_id, uid, callback){

	};

	this.addShareable = function(type, uid, callback){
		db.query('INSERT INTO shareables (type, owner_id, time) VALUES (?)',  [[type, uid, CURRENT_TIMESTAMP()]],function(err, data){

			if(err){
				//error, shareable wasn't inserted
				callback(null);
				return;
			}
		});

		//return new shareable id
		db.query('SELECT LAST_INSERT_ID()', function(err,data){

			if(err){
				//error, shareable wasn't found
				callback(null);
				return;
			}
			else{
				callback(data[0]);
			}
		});
	};

	this.addMultimedia = function(type, uid, title, url, time, callback){

	};

	this.addShareable_albums = function(type, uid, time, title, description, callback){

	};

	this.addShareable_links = function(type, uid, url, description, callback){

	};

	this.addAlbum_items = function(type, uid, album_id, callback){

	};

	//some of the fields can be null
	this.masterAddShareables = function(type, uid, title, url, time, title, description, album_id, callback){

	};

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
