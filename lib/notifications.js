/**
 * Library for handling notifications
 * @leoloo
 */

 var mysql = require('mysql');

 exports.sendNotification = function(owner_id, notification, callback) {
	// First find nid
	db.query('SELECT COUNT(*) AS notificationCount FROM notifications WHERE owner_id = ?',
		owner_id, function(countErr, count) {
			if (countErr) callback(false);
			else {
				var nid = count[0].notificationCount;
				db.query('INSERT INTO notifications (owner_id, nid, notification) VALUES (?)'
					[[owner_id, nid, notification]], function(insertErr) {
						if (insertErr) callback(false);
						else {
							callback(true);
						}
					}.bind(this));
			}
		}.bind(this));
 };

 exports.removeNotification = function(owner_id, nid, callback) {
	db.query('DELETE FROM notifications WHERE owner_id = ? AND nid = ?',
		[owner_id, nid], function(deleteErr) {
			callback(!deleteErr);
		}.bind(this));
 };

