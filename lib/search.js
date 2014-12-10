/** 
 * Module for performing generic search 
 * This is likely one of the only few libs where we want to access dbs controlled in other libs directly!
 * @ cquanze
 */
var userlib = require('./users.js');
module.exports = function(db){
	if(!db){
		throw new Error('No database connection passed in. Please check!');
	}
	var userinst = new userlib(db);
	this.search = function(querystring, recordLength, callback){
		
	};
	
	this.searchUsers = function(query, size, callback){
		// Search username
		if(size !== null){
			db.query("SELECT * FROM users WHERE name LIKE ? LIMIT ?", ["%" + query + "%", size], function(err,data){
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
			db.query("SELECT * FROM users WHERE name LIKE ?", ["%" + query + "%"], function(err,data){
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
		
	};
	this.searchLocations = function(query, size, callback){
		
	};
};
