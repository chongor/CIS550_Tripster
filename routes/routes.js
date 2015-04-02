
var userlib = require("../lib/users.js");
// Update SQL user db with new info
// TODO: Creates unique session id from user info and stores in Redis
// TODO: Eventually host on images on S3
// Have to send Content-Type: application/json
exports.login = function(req, res) {
	var fbid = req.body.uid;
	var name = req.body.name;
	var gender = req.body.gender;
	// TODO: User needs a country
	var country = req.body.country;
	var profile_pic = req.body.profile_pic;
	var age = req.body.age;
	if (fbid == null || name == null) {
		res.json({"sc": 400, "error": "No fbid and name"});
		return;
	}
	var userinst = new userlib(req.db);
	userinst.getUser(fbid, function(data) {
		if (data == null) {
			// Create new user
			var userdata = {uid: fbid, name: name, gender: gender, country: country,
				profile_pic: profile_pic, age: age};
			userinst.insertUser(userdata, function(success) {
				if (success) {
					res.json({"sc": 200});
				} else {
					res.json({"sc": 500, "error": "Server error inserting user"});
				}
			});
		}
		else {
			res.json({"sc": 200, "data": data});
		}
	});


};

exports.fourohfour = function(req, res) {
	res.json({"sc": 404, "error": "Page does not exist"});
}
