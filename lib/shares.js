/**
 * Library for obtaining user information
 */

var mysql = require('mysql');


/*
	functions needed

	DONE:
	- getShareables
	- share to users
	- share to trip
	- get comments/rates for shareables
	- add comment/rate shareables
	- get album items (of particular album)
	- add shareable to db (take shareable add to db)
	- add shareable to album (take returned shareable id and place into album in db)
	- create an album
	- is viewable by user (takes shareable id returns uids)

	TODO:
	- comment shareables
	- 
	- change privacy of shareable

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
	
	var dbRecordToMedia = function(dbRecord){
		return {
			"type": dbRecord.type,
			"id": dbRecord.id,
			"owner_id": dbRecord.owner_id,
			"time": dbRecord.time,
			"url": dbRecord.url
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
	
	this.getMultimedia = function(sid, callback){
		db.query('SELECT * FROM multimedia M INNER JOIN shareables S ON S.id = M.id WHERE `id` = ?', [sid], function(err, data){
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
		db.query('INSERT INTO trip_shareables (item_id, trip_id, privacy, time) VALUES (?)', [[item_id, trip_id, privacy, CURRENT_TIMESTAMP()]],function(err,data){

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
		db.query('INSERT INTO shareables (type, owner_id, time) VALUES (?); ' + 
			'SELECT LAST_INSERT_ID()',  [[type, uid, 'NOW()']],function(err, data){
			if(err){
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
				callback(true, data[1][0]);
				return;
			}
		});
	};

	var addMultimedia = function(type, uid, title, url, time, callback){
		genShareable(type, uid, function(sid){
			db.query('INSERT INTO multimedia (id, title, url, time) VALUES (?)',[[sid, title, url, 'NOW()']], function(err, data){
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

	var addAlbum = function(type, uid, time, title, description, callback){
		genShareable(type, uid, function(sid){
			db.query('INSERT INTO shareable_albums (id, time, title, description) VALUES (?)',
				[[sid, time, title, description]], function(err, data){
				if(err){
					callback(false, null);
					return;
				}else{
					callback(true, sid);
					return;
				}
			});
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
					addMultimedia(type, uid, title, url, time, function(success, sid){
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
					addAlbum(type, uid, time, title, description, function(success, sid){
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
