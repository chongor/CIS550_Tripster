/**
 * Library for obtaining user information
 */

var mysql = require('mysql');

module.exports = function(db){
	if(!db){
		throw new Error('Database Connection Not Passed In');
	}

	var dbRecordToShareable = function(dbRecord){
		return {
			"type": dbRecord.type,
			"id": dbRecord.id,
			"owner": dbRecord.owner_id,
			"time": dbRecord.time
		};
	}
	
	var dbRecordToMedia = function(dbRecord){
		return {
			"type": dbRecord.type,
			"id": dbRecord.id,
			"owner": {
				"uid": dbRecord.owner_id,
				"name": dbRecord.owner_name,
				"login": dbRecord.owner_login,
				"email": dbRecord.owner_email
			},
			"time": dbRecord.time,
			"url": dbRecord.url,
			"title": dbRecord.title
		};
	};

	var dbRecordToAlbum = function(dbRecord){
		return {
			"type": dbRecord.type,
			"id": dbRecord.id,
			"owner": {
				"uid":dbRecord.owner_id,
				"name":dbRecord.owner_name,
				"login":dbRecord.owner_login,
				"email":dbRecord.owner_email
			},
			"creationTime": dbRecord.creationTime,
			"updateTime": dbRecord.updateTime,
			"title": dbRecord.title,
			"description": dbRecord.description
		};
	}
	
	var getTableByType = function(type){
		switch(type){
			case "photo":
				return "multimedia";
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
	
	this.getShareable = function(sid, callback){
		db.query('SELECT * FROM shareables WHERE `id` = ?', [sid], function(err, data){
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
	this.getAlbumsByOwner = function(uid, callback){
		db.query('SELECT S.id as id, S.owner_id as owner_id, U.name AS owner_name, U.login AS owner_login, U.email AS owner_email, S.time as creationTime, A.updateTime as updateTime, A.title as title, A.description as description FROM shareables S INNER JOIN shareable_albums A ON S.id = A.id INNER JOIN users U ON U.uid = S.owner_id WHERE S.owner_id = ? AND S.type = "album" ORDER BY updateTime DESC', [uid], function(err, data){
			if(err){
				callback(null);
				return;
			} else {
				var albums = [];
				for(var i = 0; i < data.length; i++){
					albums.push(dbRecordToAlbum(data[i]));
				}
				callback(albums);
				return;
			}
		});
		return;
	};
	
	this.getAlbum = function(sid, callback){
		db.query('SELECT S.id as id, S.owner_id as owner_id, U.name AS owner_name, U.email AS owner_email, U.login AS owner_login, S.time as creationTime, A.updateTime as updateTime, A.title as title, A.description as description FROM shareables S INNER JOIN shareable_albums A ON S.id = A.id INNER JOIN users U ON U.uid = S.owner_id WHERE S.id = ? AND S.type = "album"', [sid], function(err, data){
			if(err){
				callback(null);
				return;
			} else {
				if (data.length === 0){
					callback(null);
					return;
				}
				var s = data[0];
				callback(dbRecordToAlbum(s));
				return;
			}
		});
		return;
	};
	
	this.getMultimedia = function(sid, callback){
		db.query('SELECT M.id as id, M.title as title, M.url as url, S.time as time, S.type as type, U.name as owner_name, U.login as onwer_login, U.uid as owner_id, U.email AS owner_email FROM multimedia M INNER JOIN shareables S ON S.id = M.id INNER JOIN users U ON U.uid = S.owner_id WHERE M.id = ?', [sid], function(err, data){
			if(err){
				callback(null);
				return;
			} else {
				if (data.length === 0){
					callback(null);
					return;
				}
				var s = data[0];
				callback(dbRecordToMedia(s));
				return;
			}
		});
	};

	this.getAlbumItems = function(a_id, callback){
		// Albums may only contain photos or videos
		db.query('SELECT AI.album_id AS album_id, AI.item_id AS id, S.type AS type, M.url AS url, M.title AS title, S.time AS time, S.owner_id AS owner_id, U.name AS owner_name, U.login AS owner_login, U.email AS owner_email FROM album_items AI INNER JOIN multimedia M ON M.id = AI.item_id INNER JOIN shareables S ON S.id = M.id INNER JOIN users U ON U.uid = S.owner_id WHERE AI.album_id = ? AND S.type IN ("photo", "video") ORDER BY time DESC', [a_id], function(err,data){
			if(err){
				console.log(err);
				callback(null);
				return;
			} else {
				var item_list = [];

				for (var i = 0; i < data.length; i++){
					item_list.push(dbRecordToMedia(data[i]));
				}
				callback(item_list);
				return;
			}
		});
	};

	this.getRating = function(s_id, start, end, callback){
		var limit = '';
		if(typeof start === "number" && typeof end === "number"){
			limit = 'LIMIT ' + start + "," + end;
		}
		db.query('SELECT SR.rating AS rating, SR.comment AS comment, SR.time AS time, U.uid AS rater_id, U.name AS rater_name, U.login AS rater_login, U.email AS email FROM shareable_ratings SR INNER JOIN users U ON U.uid = SR.rater_id WHERE SR.item_id = ? ORDER BY SR.time DESC ' + limit + '; SELECT AVG(rating) AS avg_rating FROM shareable_ratings WHERE `item_id` = ?;', [s_id, s_id], function(err, data){
			if(err){
				console.log(err);
				callback(null, -1);
				return;
			}
			else{
				var rating_list = [];
				if(data[1] != null && data[1].length > 0){
					var avg_rating = data[1][0].avg_rating;
				}else{
					var avg_rating = 0;
				}
				for (var i = 0; i < data[0].length; i++){
					rating_list.push({
						'rating': data[0][i].rating, 
						'comment':data[0][i].comment,
						'time':data[0][i].time,
						'user':{
							'uid':data[0][i].rater_id,
							'name':data[0][i].rater_name,
							'login':data[0][i].rater_login,
							'email':data[0][i].rater_email
						}
					});
				}
				callback(rating_list, avg_rating);
				return;
			}
		});
	};

	this.addRating = function( item_id, rating, comment, rater_id, callback){
		db_query('INSERT INTO shareable_ratings (item_id, rating, comment, rate_id) VALUES (?)', [[item_id, rating, comment, rater_id]], function(err, data){
			if(err){
				// couldn't insert new rating
				callback(false, null);
				return;
			}
			else{
				//inserted successfully, return pair(item_id, rater_id)
				callback(true, {
					'item_id' : item_id,
					'rater_id' : rater_id
				});
				return;
			}
		});
	};

	this.shareTripItem = function(item_id, trip_id, privacy, callback){
		db.query('INSERT INTO trip_shareables (item_id, trip_id, privacy, time) VALUES (?, NOW())', [[item_id, trip_id, privacy]],function(err,data){

			if(err){
				// couldn't insert share
				callback(false, null);
				return;
			}
			else{
				//if inserted, return pair(item_id, trip_id)
				callback(true, {
					'item_id' : item_id,
					'rater_id' : rater_id
				});
				return;
			}

		});

	};

	//return true or false
	this.isViewable = function(s_id, uid, callback){
		this.getShareable(s_id, function(record){
			if(record === null){
				callback(false, 'Share ID not given.');
				return;
			}
			if(record.owner_id === uid){
				callback(true, record);
				return;
			}
			db.query('SELECT * FROM trip_members WHERE trip_id IN '
				+ '(SELECT trip_id FROM trip_shareables WHERE item_id = ?)', 
				[s_id], function(err, data){
				if(err){
					callback(false, null);
					return;
				}else{
					if(data.length === 0){
						callback(false, 'No trip');
						return;
					}
					for(var i; i < data.length; i++){
						if(data[i].uid === uid){
							callback(true, record);
							return;
						}
					}
					callback(false, 'Not a member of trip');
					return;
				}
			});
		});
	};

	this.changePrivacy = function(s_id, uid, callback){
		
	};

	var genShareable = function(type, uid, callback){
		db.query('INSERT INTO shareables (id, type, owner_id, time) VALUES (NULL, ?, NOW()); ' + 
			'SELECT LAST_INSERT_ID() AS id',  [[type, uid]],function(err, data){
			if(err){
				console.log(err);
				callback(false, err);
				return;
			}
			else{
				if(data.length < 2){
					callback(false, data);
					return;
				}
				if(data[1].length < 1){
					callback(false, data);
					return;
				}
				callback(true, data[1][0].id);
				return;
			}
		});
	};

	var addMultimedia = function(type, uid, title, url, callback){
		genShareable(type, uid, function(sid){
			db.query('INSERT INTO multimedia (id, title, url) VALUES (?)',[[sid, title, url]], function(err, data){
				if(err) {
					callback(false, err);
					return;
				} else {
					callback(true, id);
					return;
				}
			});
		});
	};

	this.createAlbum = function(uid, title, description, callback){
		genShareable('album', uid, function(success, sid){
			if(!success){
				console.log(sid);
				callback(false, null);
			} else {
				db.query('INSERT INTO shareable_albums (id, updateTime, title, description) VALUES (?, NOW(), ?)',
					[sid, [title, description]], function(err, data){
					if(err){
						callback(false, sid);
						return;
					}else{
						callback(true, sid);
						return;
					}
				});
			}
		});
	};

	var addLink = function(type, uid, url, description, callback){
		genShareable(type, uid, function(sid){
			db.query('INSERT INTO shareable_links (id, url, description) VALUES (?)',
				[[sid,url, description]], function(err, data){
				if(err){
					//error, multimedia wasn't inserted
					callback(false, null);
					return;
				}
				else{
					callback(true, sid);
					return;
				}
			});
		});
	};

	var addAlbumItem = function(type, uid, album_id, callback){
		genShareable(type, uid, function(sid){
			db.query('INSERT INTO album_items (album_id, sid) VALUES (?)',
				[[sid, title, url, 'NOW()']], function(err, data){
				if(err){
					callback(false, null);
					return;
				} else {
					callback(true, id);
					return;
				}
			});
		});
	};
	this.addShareable = function(type, uid, title, url, time, title, description, album_id, callback){
		//add as a album_item
		if(album_id !== null){
			this.addAlbum_items(type, uid, album_id, function(success, sid){
				if(!success){
					callback(false, null);
					return;
				} else {
					callback(true, sid);
					return;
				}
			});
		} else {
			switch(type){
				case "photo":
				case "video":
					addMultimedia(type, uid, title, url, function(success, sid){
						if(!success){
							callback(false, null);
							return;
						} else {
							callback(true, sid);
							return;
						}
					});
					break;
				case "album":
					addAlbum(type, uid, title, description, function(success, sid){
						if(!success){
							callback(false, null);
							return;
						} else {
							callback(true, sid);
							return;
						}
					});
					break;
				case "url":
					addLink(type, uid, url, description, function(success, sid){
						if(!success){
							callback(false, null);
							return;
						} else {
							callback(true, sid);
							return;
						}
					});
					break;
				default:{
					callback(false, 'Type Unknown : ' + type);
					return;
				}
			}
		}
	};
}
