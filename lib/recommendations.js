/**
 * Library for handling recommendations
 * @cquanze
 */

// Recommend trips your friends have been in but you have not
/*
(SELECT DISTINCT(T.tid) AS tid
FROM trip_members T
INNER JOIN friends F WHERE T.uid = F.dest_uid
WHERE T.role IN ('member:invite', 'member:request', 'member', 'admin')
	AND F.src_uid = ?
) MINUS (
SELECT T.tid
FROM trip_members T
WHERE T.uid = ?
)
*/
// Recommend trips where at least 2 of your friends are in
/*
SELECT T.tid
FROM trips T
INNER JOIN trip_members M WHERE M.trip_id = T.trip_id
INNER JOIN friends F WHERE M.uid = F.dest_uid
WHERE F.src_uid = ?
GROUP BY T.tid
HAVING COUNT(dest_uid) > 4;
*/
// Recommend trips where at

module.exports = function(db){
	if(!db){
		throw new Error('Database not passed in. Recommendations');
	}

	this.recommendFriend = function(uid, count, callback){
		db.query('SELECT FF.friend AS uid FROM (SELECT F2.friend FROM vFriends F1 INNER JOIN vFriends F2 ON (F1.friend = F2.uid AND F2.friend != F1.uid) WHERE F2.uid != ? AND F1.uid = ?) FF WHERE FF.friend NOT IN (SELECT friend FROM vFriends WHERE uid = ?)', [uid, uid, uid, count], function(err, data){
			if(err){
				console.log(err);
				callback([]);
				return;
			}
			var uids = [];
			for(var i = 0; i < data.length; i++){
				uids.push(data[i].uid);
			}
			callback(uids);
			return;
		});
	};

	this.recommendLocation = function(uid, count, callback){

	};

	this.recommendTrip = function(uid, count, callback){
		db.query('SELECT FT.tid AS tid FROM (SELECT DISTINCT(T.trip_id) AS tid FROM trip_members T INNER JOIN friends F ON T.uid = F.dest_uid WHERE T.role IN ("member:invite", "member:request", "member", "admin") AND F.src_uid = ?) FT WHERE FT.tid NOT IN ( SELECT T.trip_id AS tid FROM trip_members T WHERE T.uid = ?) LIMIT ?', [uid, uid, count], function(err, data){
			if(err){
				console.log(err);
				callback([]);
				return;
			}
			var tids = [];
			for(var i = 0; i < data.length; i++){
				tids.push(data[i].tid);
			}
			callback(tids);
			return;
		});
	};
};
