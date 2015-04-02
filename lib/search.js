/** 
 * Module for performing generic search 
 * This is likely one of the only few libs where we want to access dbs controlled in other libs directly!
 * @ cquanze
 */
var userlib = require('./users.js');
var triplib = require('./trips.js');
var localib = require('./locations.js');
module.exports = function(db){
	if(!db){
		throw new Error('No database connection passed in. Please check!');
	}
	var userinst = new userlib(db);
	var tripinst = new triplib(db);
	var locainst = new localib(db);
	this.search = function(querystring, recordLength, callback){
		
	};
	
	this.searchUsers = function(query, size, callback){
		// Search username
		query = query ? query.toLowerCase() : "-";
		if(size !== null){
			db.query("SELECT * FROM users WHERE LOWER(name) LIKE ? LIMIT ?", ["%" + query + "%", size], function(err,data){
				if(err){
					callback([]);
					return;
				} else {
					var list = [];
					for(var i = 0; i < data.length; i++){
						list.push(userinst.getRecord(data[i]));
					}
					callback(list);
				}
			});
		}else{
			db.query("SELECT * FROM users WHERE LOWER(name) LIKE ?", ["%" + query + "%"], function(err,data){
				if(err){
					callback([]);
					return;
				} else {
					var list = [];
					for(var i = 0; i < data.length; i++){
						list.push(userinst.getRecord(data[i]));
					}
					callback(list);
				}
			});
		}
	};
	
	this.searchTrips = function(query, size, callback){
		query = query ? query.toLowerCase() : "-";
		if(size !== null){
			db.query("SELECT * FROM trips WHERE LOWER(title) LIKE ? LIMIT ?", ["%" + query + "%", size], function(err,data){
				if(err){
					callback([]);
					return;
				} else {
					var list = [];
					for(var i = 0; i < data.length; i++){
						list.push(tripinst.getRecord(data[i]));
					}
					callback(list);
				}
			});
		}else{
			db.query("SELECT * FROM trips WHERE LOWER(title) LIKE ?", ["%" + query + "%"], function(err,data){
				if(err){
					callback([]);
					return;
				} else {
					var list = [];
					for(var i = 0; i < data.length; i++){
						list.push(tripinst.getRecord(data[i]));
					}
					callback(list);
				}
			});
		}
	};

	this.searchLocations = function(query, size, callback){
		query = query ? query.toLowerCase() : "-";
		if(size !== null){
			db.query("SELECT * FROM locations WHERE LOWER(name) LIKE ? LIMIT ?", ["%" + query + "%", size], function(err,data){
				if(err){
					callback([]);
					return;
				} else {
					var list = [];
					for(var i = 0; i < data.length; i++){
						list.push(locainst.getRecord(data[i]));
					}
					callback(list);
				}
			});
		}else{
			db.query("SELECT * FROM locations WHERE LOWER(name) LIKE ?", ["%" + query + "%"], function(err,data){
				if(err){
					callback([]);
					return;
				} else {
					var list = [];
					for(var i = 0; i < data.length; i++){
						list.push(locainst.getRecord(data[i]));
					}
					callback(list);
				}
			});
		}
	};
};
