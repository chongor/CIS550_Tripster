/**
 * Library for obtaining trip information
 * @cquanze
 */
var mysql = require('mysql');
var userlib = require('./users.js');
var localib = require('./locations.js');
module.exports = function(db){
	if(!db){
		throw new Error('Database Connection Not Passed In');
	}
	var dbRecordToTrip = function(record){
		var t = {
			"trip_id": record.trip_id,
			"owner": record.owner_uid,
			"name": record.title,
			"description": record.description,
			"start": record.start_date,
			"end": record.end_date,
			"privacy": record.privacy
		};
		if(record.role){
			t.role = record.role;
		}
		return t;
	};

	//contains a join of schedules with locations
	var dbRecordToSchedule = function(record){
		return{
			"trip_id": record.trip_id,
			"trip_date": record.trip_date,
			"lid": record.lid,
			"name": record.name,
			"type": record.type,
			"yelp_id": record.yelp_id
		}
	}

	this.getRecord = dbRecordToTrip;
	this.mapRoles = function(role){
		if(role === null){
			return {
				isMember: false,
				isInvited: false,
				isRequested: false,
				isAdmin: false
			};
		}else if(role === "admin"){
			return {
				isMember: true,
				isInvited: false,
				isRequested: false,
				isAdmin: true
			};
		}else if(role === "member" || role === "member:request" || role === "member:invite"){
			return {
				isMember: true,
				isInvited: role === "member:invite",
				isRequested: role === "member:request",
				isAdmin: false
			};
		}else if(role === "invite"){
			return {
				isMember: false,
				isInvited: true,
				isRequested: false,
				isAdmin: false
			};
		}else if(role === "request"){
			return {
				isMember: false,
				isInvited: false,
				isRequested: true,
				isAdmin: false
			};
		}else{
			console.log(role);
			return {
				isMember: false,
				isInvited: false,
				isRequested: false,
				isAdmin: false
			}
		}
	};

	this.getTrip = function(tid, callback){
		db.query('SELECT * FROM trips WHERE `trip_id` = ?', tid, function(err, data){
			if(err){
				callback(null);
				return;
			}else{
				if(data.length === 0){
					callback(null);
					return;
				}
				var u = data[0];
				callback(dbRecordToTrip(data[0]));
				return;
			}
		});
		return;
	};

	this.getTripByOwner = function(uid, callback){
		db.query('SELECT * FROM trips WHERE `owner_uid` = ?', uid, function(err, data){
			if(err){
				callback(null);
				return;
			}else{
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push(dbRecordToTrip(data[i]));
				}
				callback(list);
				return;
			}
		});
		return;
	};

	this.getTripByMembership = function(uid, callback) {
		// Gets all trips that user is a member but not owner of
		db.query('SELECT DISTINCT * FROM trips T INNER JOIN trip_members M ON M.trip_id = T.trip_id WHERE M.uid = ? AND M.role IN ("member","member:request", "member:invite") AND T.owner_uid <> ?',
			[uid, uid], function(err, data) {
			if(err){
				callback(null);
				return;
			}else{
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push(dbRecordToTrip(data[i]));
				}
				callback(list);
				return;
			}
		});
	};

	this.getMembership = function(uid, tid, callback){
		var self = this;
		db.query('SELECT * FROM trip_members WHERE `trip_id` = ? AND `uid` = ?', [tid, uid], function(err, data){
			if(err){
				callback(self.mapRoles(null));
				return;
			}else{
				if(data.length < 1){
					callback(self.mapRoles(null)); // Not a member;
					return;
				}
				var user = data[0];
				callback(self.mapRoles(user.role));
				return;
			}
		});
	};

	this.getMembers = function(tid, callback){
		var self = this;
		db.query('SELECT * FROM trip_members WHERE `trip_id` = ?', tid, function(err, data){
			if(err){
				callback(null);
				return;
			}else{
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push({
						'uid': data[i].uid,
						'role': self.mapRoles(data[i].role)
					});
				}
				callback(list);
				return;
			}
		});
	};

	this.getChecklist = function(tid, callback){
		db.query('SELECT * FROM items_checklists IC INNER JOIN items I ON IC.iid = I.iid WHERE IC.trip_id = ?', tid, function(err, data){
			if(err){
				callback(null, err);
				return;
			}else{
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push({
						'item_id': data[i].iid,
						'desc': data[i].description
					});
				}
				callback(list);
				return;
			}
		});
	};

	this.addItem = function(tid, description, callback){
		if (tid === null || description === null) {
			callback(false);
			return;
		}
		// First make sure that the exact same description is not already present
		db.query('SELECT * FROM items I INNER JOIN items_checklists C ON C.iid = I.iid WHERE I.description = ? AND C.trip_id = ?', [description.toLowerCase().trim(), tid], function(err, data) {
			if (data !== null && data.length > 0) {
				callback(false, 'Item already exists');
				return;
			}
			db.query('SELECT * FROM items I WHERE description = ?', description, function(err, item) {
				if (item !== null && item.length > 0) {
					db.query('INSERT INTO items_checklists(trip_id, iid) VALUES(?, ?)',
						[tid, item[0].iid], function(err) {
							if (err) {
								callback(false, 'Failed to add item. Try again later.');
								return;
							}
							callback(true);
					}.bind(this));
				}
				else {
					db.query('INSERT INTO items(iid, description) VALUES(null, ?); INSERT INTO items_checklists(trip_id, iid) VALUES(?, LAST_INSERT_ID())',
						[description.toLowerCase().trim(), tid], function(err) {
							if (err) {
								callback(false, 'Failed to add item. Try again later.');
								return;
							}
							callback(true);
					}.bind(this));
				}
			}.bind(this));

		}.bind(this));

	};

	this.getParticipating = function(uid, callback){
		// Get trips that uid has participated in
		db.query('SELECT T.title as title, T.description AS description, T.owner_uid AS owner_uid, T.start_date AS start_date, T.end_date AS end_date, T.trip_id AS trip_id, T.privacy AS privacy, M.role AS role FROM trip_members M INNER JOIN trips T ON T.trip_id  = M.trip_id WHERE M.uid = ? AND M.role IN ("member","member:request", "member:invite", "admin") ORDER BY T.end_date DESC', [uid], function(err, data){
			if(err){
				callback(null, err);
				return;
			} else {
				var trips = [];
				for(var i = 0; i < data.length; i++){
					trips.push(dbRecordToTrip(data[i]));
				}
				callback(trips);
			}
		})
	};

	/** Below this point are true/false state reads **/
	this.canView = function(uid, tid, callback) {
		this.getTrip(tid, function(data){
			if(data === null){
				callback(false, null, 'Trip does not exist');
				return;
			}
			if(data.privacy === 0){
				callback(true, data);
				return;
			}
			if(data.owner === uid){
				callback(true, data);
				return;
			}
			db.query('SELECT * FROM trip_members WHERE `trip_id` = ? AND `uid` = ? ' +
				'AND `role` IN ("member","member:request", "member:invte", "admin", "invite")',
				[tid, uid], function(err, u){
				if(err){
					callback(false, null, 'Read members fail');
					return;
				}
				if(u.length > 0){
					callback(true, data);
				}else{
					callback(false, data, 'Non members cannot view private trips');
				}
			});
		});
	};

	// Get all trips that uid is an owner of and that target is not a member of
	this.getInvitables = function(uid, target, callback) {
		db.query('SELECT * FROM trips T WHERE T.owner_uid = ? AND T.trip_id NOT IN (SELECT M1.trip_id FROM trip_members M1 WHERE M1.uid = ?)',
		[uid, target], function(err, data) {
			if(err){
				callback(null);
				return;
			}else{
				// Format all trips before returning
				var trips = [];
				data.forEach(function(trip) {
					trips.push(dbRecordToTrip(trip));
				});
				callback(trips);
				return;
			}
		}.bind(this));
	};

	/** Below this point are writes **/
	this.createTrip = function(uid, tripJson, callback) {
		db.query('INSERT INTO trips (trip_id, owner_uid, title, start_date, end_date, time, description, privacy) VALUES (?);' +
			'INSERT INTO trip_members(trip_id, uid, role) VALUES(LAST_INSERT_ID(), ?, "admin"); SELECT LAST_INSERT_ID() AS tid',
			[[null, uid, tripJson.title, tripJson.startDate, tripJson.endDate, 'NOW()', tripJson.description, tripJson.privacy], uid], function(err, trip) {
				if (err) {
					callback(false, err);
					return;
				}
				console.log(trip);
				callback(true, trip[2][0].tid);
			}.bind(this));
	};

	this.inviteJoin = function(inviter, target, tid, callback) {
		// First ensure that inviter_uid has permissions to invite (e.g. is at least a member)
		this.getMembership(inviter, tid, function(relationship) {
			if (!relationship || !relationship.isMember){
				callback(false, 'Not permitted. Inviter must be a member');
			} else {
				// Add to trip_members
				db.query('INSERT INTO trip_members (trip_id, uid, role) VALUES (?)',
					[[tid, target, 'invite']], function(inviteErr) {
						if (inviteErr) {
							callback(false, inviteErr);
						} else {
							callback(true);
						}
				}.bind(this));
			}
		}.bind(this));
	};
	
	this.requestJoin = function(requester, tid, callback) {
		// First get owner of trip
		this.canView(tid, function(view, trip) {
			if (!view) {
				// User not allowed to view, so cannot request
				callback(false, 'Not Permitted.');
			} else {
				// Check role
				this.getMembership(requester, tid, function(role) {
					if (role.isInvited && !role.isMember) {
						db.query('UPDATE trip_members SET role = "member:invite" WHERE uid = ? AND trip_id = ?', [requester, tid], function(inviteErr) {
							console.log(inviteErr);
							callback(!inviteErr);
						});
					} else if (!role.isMember) {
						// Add to trip_members
						db.query('INSERT INTO trip_members (trip_id, uid, role) VALUES (?)',
							[[tid, requester, 'request']], function(requestErr) {
								if (requestErr) {
									callback(false, requestErr);
								}else {
									callback(true); // Handle invites outside this library
								}
						}.bind(this));
					} else {
						callback(false);
					}
				}.bind(this));
			}
		}.bind(this));
	};

	this.approveJoin = function(uid, tid, callback) {
		// Need to check status first
		db.query('SELECT M.role as role FROM trip_members M WHERE M.trip_id = ? AND uid = ?',
			[tid, uid], function(err, data) {
				if (err || data === null) {
					callback(false);
					return;
				}
				var role = data[0].role;
				if (role !== 'request') {		
					callback(false);		
					return;		
				}
				db.query('UPDATE trip_members SET role = ? WHERE trip_id = ? AND uid = ?',
					['member:' + role, tid, uid], function(updateErr) {
						if (updateErr) {
							callback(false);
							return;
						}
						callback(true);
					}.bind(this));
			}.bind(this));
	};

	this.getSchedule = function(tid, callback){
		db.query('SELECT S.trip_id AS trip_id, S.trip_date AS trip_date, S.lid AS lid, L.name AS name, L.type AS type FROM schedules AS S INNER JOIN locations AS L ON S.lid = L.lid WHERE S.trip_id = ? ORDER BY S.trip_date DESC', tid,function(err,data){
			if(err){
				console.log(err);
				callback(null, err);
				return;
			}
			else{
				var sch_list = [];
				for (var i = 0; i < data.length; i++){
					sch_list.push(dbRecordToSchedule(data[i]));
				}
				callback(sch_list);
				return;
			}
		});
	}

	this.addSchedule = function(tid, date, location, type, callback){
		if(type === null){
			type = 'unknown';
		}
		var locainst = new localib(db);
		locainst.getLocationByName(location, function(loc){
			if(loc === null){
				locainst.addLocation(type != '' ? type : 'unknown', location, function(success, lid){
					if(!success){
						callback(false, lid);
						return;
					}
					db.query('INSERT INTO schedules (trip_id, trip_date, lid) VALUES (?)', [[tid, date, lid]], function(err, data){
						if(err){
							callback(false, err);
							return;
						}
						callback(true, lid);
					});
				});
			}else{
				db.query('INSERT INTO schedules (trip_id, trip_date, lid) VALUES (?)', [[tid, date, loc.lid]], function(err, data){
					if(err){
						callback(false, err);
						return;
					}
					callback(true, loc.lid);
				});
			};
		});
	}

	this.getRating = function(trip_id, start, end, callback){
		var limit = '';
		if(typeof start === "number" && typeof end === "number"){
			limit = 'LIMIT ' + start + "," + end;
		}
		db.query('SELECT TR.rating AS rating, TR.comment AS comment, TR.time AS time, U.uid AS rater_id, U.name AS rater_name, U.login AS rater_login, U.email AS rater_email FROM trip_ratings TR INNER JOIN users U ON U.uid = TR.uid WHERE TR.trip_id = ? ORDER BY TR.time DESC ' + limit + '; SELECT AVG(rating) AS avg_rating FROM trip_ratings WHERE `trip_id` = ?;', [trip_id, trip_id], function(err, data){
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
				var userinst = new userlib(db);
				
				for (var i = 0; i < data[0].length; i++){
					rating_list.push({
						'rating': data[0][i].rating,
						'comment':data[0][i].comment,
						'time':data[0][i].time,
						'user':{
							'uid':data[0][i].rater_id,
							'name':data[0][i].rater_name,
							'login':data[0][i].rater_login,
							'email':data[0][i].rater_email,
							'avatar': userinst.getAvatar(data[0][i].rater_email)
						}
					});
				}
				callback(rating_list, avg_rating);
				return;
			}
		});
	};

	this.addRating = function( trip_id, rater_id, rating, comment, callback){
		db.query('INSERT INTO trip_ratings (trip_id, uid, rating, comment) VALUES (?)', [[trip_id, rater_id, rating, comment]], function(err, data){
			if(err){
				// couldn't insert new rating
				callback(false, err);
				console.log(err);
				return;
			}
			else{
				//inserted successfully, return pair(item_id, rater_id)
				callback(true, {
					'trip_id' : trip_id,
					'rater_id' : rater_id
				});
				return;
			}
		});
	};

	this.getAlbums = function(trip_id, callback){
		db.query('SELECT SA.title AS title, SA.description AS description, TS.item_id AS item_id, TS.trip_id AS trip_id, TS.privacy AS privacy, TS.time AS time, U.uid AS uid, U.name AS name, U.login AS login, U.password AS password, U.address AS address, U.phone AS phone, U.email AS email FROM trip_shareables TS INNER JOIN shareable_albums SA ON SA.id = TS.item_id INNER JOIN shareables S ON S.id = TS.item_id INNER JOIN users U ON U.uid = S.owner_id WHERE TS.trip_id = ?', trip_id,function(err,data){
			if(err){
				console.log(err);
				callback(null);
				return;
			}
			else{
				var userinst = new userlib(db);
				var album_list = [];
				for (var i = 0; i < data.length; i++){
					album_list.push({
						'title': data[i].title,
						'description': data[i].description,
						'item_id': data[i].item_id,
						'trip_id': data[i].trip_id,
						'privacy': data[i].privacy,
						'time': data[i].time,
						'user':{
							'uid':data[i].uid,
							'name':data[i].name,
							'login':data[i].login,
							'email':data[i].email,
							'avatar':userinst.getAvatar(data[i].email)
						}
					});
				}
				callback(album_list);
				return;
			}

		});
	};

	this.getTripList = function(trip_ids, callback){
		var clause = new Array(trip_ids.length);
		for(var i = 0; i < clause.length; i++){
			clause[i] = "?"
		}
		console.log(trip_ids);
		db.query('SELECT * FROM trips WHERE trip_id in (' + clause.join(", ") + ")", trip_ids, function(err,data){
			if (err){
				console.log(err);
				callback(null);
				return;
			} else {
				trip_list = [];
				for (var i = 0; i < data.length; i++){
					trip_list.push({
						"trip_id" : data[i].trip_id,
						"owner_uid" : data[i].owner_uid,
						"title" : data[i].title,
						"start_date" : data[i].start_date,
						"end_date" : data[i].end_date, 
						"time" : data[i].time,
						"description" : data[i].description,
						"privacy" : data[i].privacy
					});
				}
				callback(trip_list);
			}
		});
	}

}
