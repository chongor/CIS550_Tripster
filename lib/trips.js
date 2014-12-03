/**
 * Library for obtaining trip information
 * @cquanze
 */
var mysql = require('mysql');

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
}
