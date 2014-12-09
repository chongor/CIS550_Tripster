/**
 * Library for obtaining trip information
 * @cquanze
 */
 var mysql = require('mysql');
 var _ = require('underscore'); // Used for auxiliary functions
 var moment = require('moment'); // Used to easily generate timezone-aware SQL timestamp from JS time
 var notifications = require('./notifications.js');

 module.exports = function(db){
 	if(!db){
 		throw new Error('Database Connection Not Passed In');
 	}
 	var dbRecordToTrip = function(record){
 		return {
 			"trip_id": record.trip_id,
 			"owner": record.owner_uid,
 			"name": record.title,
 			"description": record.description,
 			"start": record.start_date,
 			"end": record.end_date,
 			"privacy": record.privacy
 		};
 	};
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
 			db.query('SELECT * FROM trip_members WHERE `trip_id` = ? AND `uid` = ? AND `role` IN ("member","member:request", "member:invte", "admin", "invite")', [tid, uid], function(err, u){
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

	this.createTrip = function(uid, tripJson, callback) {
		// Do not rely on auto-increment as we need to get tripId
		// Hence tripId = size + 1
		db.query('SELECT COUNT(*) AS tripCount FROM trips', function(countErr, size) {
			if (countErr || size === null || size.length === 0) {
				callback(false);
				return;
			}
			var tid = size[0].tripCount + 1;
			db.query('INSERT INTO trips (trip_id, owner_uid, title, start_date, end_date, time, description, privacy) VALUES (?)',
				[[tid, uid, tripJson.title, tripJson.startDate, tripJson.endDate, moment().format('YYYY-MM-DD HH:mm:ss'), tripJson.description, tripJson.privacy]], function(tripErr) {
					if (tripErr) {
						callback(false);
						return;
					}
					db.query('INSERT INTO trip_members (trip_id, uid, role) VALUES (?)',
						[[tid, uid, 'admin']], function(tripMembersErr) {
							if (tripMembersErr) {
								callback(false);
								return;
							}
							callback(true, tid);
						}.bind(this));
				}.bind(this));
		}.bind(this));
	};

	this.getOwnerOfTrip = function(tid, callback) {
		db.query('SELECT owner_uid FROM trips WHERE trip_id = ?', tid, function(err, owner) {
			if (err) callback(false);
			else {
				callback(true, owner[0].owner_uid);
			}
		}.bind(this));
	};

	// Not being used yet but might be useful
	this.areMembersOfTrip = function(uids, tids, callback) {
		var potentialMembers = [];
		if (Object.prototype.toString.call(uids) === '[object Array]') {
			potentialMembers = uids;
		} else {
			potentialMembers.push(uids);
		}
		this.getMembers(tid, function(trip_uids) {
			if (trip_uids !== null) {
				// Only returns true if all uids are members of trip
				callback(true,
					potentialMembers.length === _.intersection(trip_uids, potentialMembers));
			}
			else {
				callback(false);
			}
		}.bind(this));
	};

	this.inviteUserToTrip = function(inviter_uid, member_uid, tid, callback) {
		// First ensure that inviter_uid is owner of trip
		this.getOwnerOfTrip(tid, function(err, ownerId) {
			if (err || ownerId === null || ownerId !== inviter_uid) callback(false);
			else {
				// Add to trip_members
				db.query('INSERT INTO trip_members (trip_id, uid, role) VALUES (?)', [[tid, member_uid, 'invite']], function(inviteErr) {
						if (inviteErr) callback(false);
						else {
							// Send notification, but first get inviter's name
							db.query('SELECT name FROM users WHERE uid = ?', inviter_uid, function(nameErr, name) {
								if (nameErr) callback(false);
								else {
									var inviterName = name[0].name;
									var notification = inviterName + ' invited you to a trip.';
									notifications.sendNotification(member_uid, notification, function(notificationErr) {
										callback(!notificationErr);
									}.bind(this));
								}
							}.bind(this));
						}
					}.bind(this));
			}
		}.bind(this));
	};

	this.requestToJoinTrip = function(requester_uid, tid, callback) {
		// First get owner of trip
		this.getOwnerOfTrip(tid, function(err, ownerId) {
			if (err) callback(false);
			else {
				// Add to trip_members
				db.query('INSERT INTO trip_members (trip_id, uid, role) VALUES (?)',
					[[tid, requester_uid, 'request']], function(inviteErr) {
						if (inviteErr) callback(false);
						else {
							// Send notification, but first get requester's name
							db.query('SELECT name FROM users WHERE uid = ?', requester_uid, function(nameErr, name) {
								if (nameErr) callback(false);
								else {
									var requesterName = name[0].name;
									var notification = requesterName + ' has requested to join your trip.';
									notifications.sendNotification(ownerId, notification, function(notificationErr) {
										callback(!notificationErr);
									}.bind(this));
								}
							}.bind(this));
						}
					}.bind(this));
			}
		}.bind(this));
	};

	this.joinTrip = function(uid, tid, callback) {
		db.query('UPDATE trip_members SET role="member" WHERE trip_id = ? AND uid = ?',
			[tid, uid], function(updateErr) {
				if (updateErr) callback(false);
				else {
					callback(true, tid);
				}
			}.bind(this));
	};


}
