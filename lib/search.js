/** 
 * Module for performing generic search 
 * This is likely one of the only few libs where we want to access dbs controlled in other libs directly!
 * @ cquanze
 */

module.exports = function(db){
	if(!db){
		throw new Error('No database connection passed in. Please check!');
	}
	this.search = function(querystring, recordLength, callback){
		
	};
	this.searchUsers = function(query, size, callback){
		
	};
	this.searchTrips = function(query, size, callback){
		
	};
	this.searchLocations = function(query, size, callback){
		
	};
};
