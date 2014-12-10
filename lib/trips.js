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

	this.inviteJoin = function(inviter, target, tid, callback) {
		// First ensure that inviter_uid has permissions to invite (e.g. is at least a member)
		this.getMembership(inviter, tid, function(relationship) {
			if (!relationship || !relationship.isMember){
				callback(false, 'Not permitted. Inviter must be a member');
			} else {
				// Add to trip_members
				db.query('INSERT INTO trip_members (trip_id, uid, role) VALUES (?)', 
					[[tid, member_uid, 'invite']], function(inviteErr) {
						if (inviteErr) {
							callback(false, inviteErr);
						} else {
							callback(true);
						}
				}.bind(this));
			}
		}.bind(this));
	};
	
	this.requestJoin = function(requester_uid, tid, callback) {
		// First get owner of trip
		this.canView(tid, function(view, trip) {
			if (!view) {
				// User not allowed to view, so cannot request
				callback(false, 'Not Permitted.');
			} else {
				// Add to trip_members
				db.query('INSERT INTO trip_members (trip_id, uid, role) VALUES (?)',
					[[tid, requester_uid, 'request']], function(inviteErr) {
						if (inviteErr) {
							callback(false, inviteErr);
						}else {
							callback(true); // Handle invites outside this library
						}
				}.bind(this));
			}
		}.bind(this));
	};

	this.approveJoin = function(uid, tid, callback) {
		// Need to check status first
		db.query('UPDATE trip_members SET `role`="member" WHERE `trip_id` = ? AND `uid` = ?',
			[tid, uid], function(updateErr) {
				if (updateErr) { 
					callback(false);
				} else {
					callback(true, tid);
				}
		}.bind(this));
	};
}
