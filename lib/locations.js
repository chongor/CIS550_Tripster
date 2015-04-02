module.exports = function(db){
	if(!db){
		throw new Error('Database connection not passed in');
	}
	var getRecord = function(record){
		return record;
	};
	this.getRecord = getRecord;
	this.getLocation = function(lid, callback){
		db.query('SELECT * FROM locations WHERE lid = ?', lid, function(err, data){
			if(err){
				console.log(err);
				callback(null);
				return;
			}
			if(data.length < 1){
				callback(null);
				return;
			}
			callback(getRecord(data[0]));
			return;
		});
	};
	
	this.getLocationByName = function(name, callback){
		db.query('SELECT * FROM locations WHERE name = ?', name, function(err, data){
			if(err){
				console.log(err);
				callback(null);
				return;
			}
			if(data.length < 1){
				callback(null);
				return;
			}
			callback(getRecord(data[0]));
			return;
		});
	};
	
	this.getLocationsByType = function(type, callback){
		db.query('SELECT * FROM locations WHERE type = ?', type, function(err, data){
			if(err){
				console.log(err);
				callback(null);
				return;
			}
			var locations = [];
			for(var i = 0; i < data.length; i++){
				locations.push(getRecord(data[i]));
			}
			callback(locations);
			return;
		});
	};
	
	this.addLocation = function(type, name, callback){
		db.query('INSERT INTO locations (lid, type, name, yelp_id) VALUES (?); SELECT LAST_INSERT_ID() AS id',[[null, type, name, '']], function(err,data){
			if(err){
				console.log(err);
				callback(false, err);
				return;
			}
			if(data.length < 2){
				callback(false, data);
				return;
			}
			if(data[1].length < 1){
				callback(false, data);
				return;
			}
			callback(true, data[1][0].id);
		});
	};
}
