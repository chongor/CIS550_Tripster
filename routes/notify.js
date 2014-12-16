var notelib = require('../lib/notifications.js');

exports.get = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.json({code: 500});
		return;
	}
	var noteinst = new notelib(req.db);
	noteinst.get(req.user.user.uid, req.query.offset ? req.query.offset : null, function(notes){
		if(notes === null){
			req.db.end();
			res.json({code:400, msg:"Error retrieving notifications"});
			return;
		}
		
		req.db.end();
		res.json({
			code: 200,
			notify: notes
		});
	});
};

exports.read = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.json({code: 500});
		return;
	}
	var noteinst = new notelib(req.db);
	noteinst.clear(req.user.user.uid, req.body.nid, function(success){
		if(!success){
			req.db.end();
			res.json({code:400, msg:"Error"});
			return;
		}
		req.db.end();
		res.json({
			code: 200
		});
	});
};
