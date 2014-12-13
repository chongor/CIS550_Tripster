module.exports = function(db){
	if(!db){
		throw new Error('Database connection not passed in');
	}
	
	this.getUserNewsfeed = function(uid, limit, callback){
		if(limit !== null){
			var limitstr = typeof limit === "number" ? "LIMIT " + parseInt(limit) : "LIMIT " + limit.start + "," + limit.end;
		}else{
			limitstr = "";
		}
		db.query('(SELECT owner_id, from_id, fid, time, privacy, newsfeed FROM newsfeed_items WHERE owner_id = ?) UNION (SELECT N.owner_id AS owner_id, N.from_id AS from_id, N.fid AS fid, N.time as time, N.privacy AS privacy, N.newsfeed as newsfeed FROM newsfeed_items N INNER JOIN vFriends F ON F.friend = N.owner_id WHERE ((N.owner_id = N.from_id AND N.privacy = 0) OR (N.from_id = ?)) AND F.uid = ?) ORDER BY time DESC ' + limitstr, [uid, uid, uid], function(err, data){
			if(err){
				console.log(err);
				callback(null, err);
				return;
			}else{
				var newsfeed = [];
				for(var i = 0; i < data.length; i++){
					newsfeed.push(data[i]);
				}
				callback(newsfeed);
			}
		});
	};
	
	this.post = function(from, to, postdata, privacy, callback){
		db.query('INSERT INTO newsfeed_items (owner_id, from_id, time, privacy, newsfeed) VALUES(?)', [[from, to, 'NOW()', privacy, postdata]], function(err, data){
			if(err){
				callback(false, err);
				return;
			}else{
				callback(true);
			}
		});
	};
}
