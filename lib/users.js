/**
 * Library for obtaining user information
 * @jim
 */
var mysql = require('mysql');
module.exports = function(db){
	if(!db){
		throw new Error('Database Connection Not Passed In');
	}
	var dbRecordToUser = function(dbRecord){
		return {
			"uid": dbRecord.uid,
			"name": dbRecord.name,
			"gender": dbRecord.gender,
			"country": dbRecord.country,
			"profile_pic": dbRecord.profile_pic,
			"age": dbRecord.age,
			"gender_setting": dbRecord.gender_setting,
			"language_preference": dbRecord.language_preference
		};
	}

	this.getRecord = dbRecordToUser;
	this.getUser = function(uid, callback) {
		db.query('SELECT * FROM users WHERE uid = ?', uid, function(err, data) {
			if(err || data == null || data.length === 0) {
				callback(null);
				return;
			}
			var u = data[0];
			callback(dbRecordToUser(data[0]));
		});
	};

	this.insertUser = function(d, callback) {
		db.query('INSERT INTO users (uid, name, gender, country, profile_pic, age, gender_setting, language_preference) VALUES (?);',[[d.uid, d.name, d.gender, d.country, d.profile_pic, d.age, 'everyone', 'English']], function(err,data) {
			callback(err == null);
		});
	}
}
