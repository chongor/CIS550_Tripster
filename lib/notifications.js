/**
 * Library for handling notifications
 * @leoloo
 * @cquanze updated
 */

var mysql = require('mysql');

module.exports = function(db){
	if(!db){
		throw new Error('Database not initialized for notifications');
	}
	
	this.get = function(owner_id, offset, callback){
		if(offset === null){
			offset = -1;
		}
		db.query('SELECT * FROM notifications WHERE owner_id = ? AND nid > ? ORDER BY nid DESC', [owner_id, offset], function(err, data){
			if(err){
				console.log(err);
				callback([]);
				return;
			} else {
				var nots = [];
				for(var i = 0; i < data.length; i++){
					try{
						var ndata = JSON.parse(data[i].notification);
					} catch(e){
						console.log(ndata);
						ndata = {};
					}
					nots.push({
						"nid": data[i].nid,
						"owner": data[i].owner_id,
						"data": ndata,
					});
				}
				callback(nots);
				return;
			}
		});
	};
	
	this.send = function(owner_id, notification, callback) {
		// First find nid
		db.query('SELECT MAX(nid) AS notificationCount FROM notifications',
			[owner_id], function(countErr, count) {
			if (countErr) {
				callback(false, countErr);
			}else {
				var nid = count[0].notificationCount;
				console.log(nid);
				if(nid === null){
					nid = 0;
				}
				
				db.query('INSERT INTO notifications (`owner_id`, `nid`, `notification`) VALUES (?)',
					[[owner_id, nid + 1, JSON.stringify(notification)]], function(insertErr) {
						if (insertErr) {
							callback(false);
						} else {
							callback(true);
						}
					}.bind(this));
			}
		}.bind(this));
	};
	
	this.clear = function(owner_id, nid, callback) {
		db.query('DELETE FROM notifications WHERE owner_id = ? AND nid = ?',
			[owner_id, nid], function(deleteErr) {
				callback(!deleteErr);
		}.bind(this));
	};
};
