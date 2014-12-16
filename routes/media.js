var userlib = require("../lib/users.js");
var sharelib= require("../lib/shares.js");
var triplib = require("../lib/trips.js");
exports.photos = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	var shareinst = new sharelib(req.db);
	shareinst.getMultimedia(req.param("id"), function(data){
		console.log(data);
		if(data === null){
			req.db.end();
			res.render('404', {
				login:req.user.login,
				user:req.user.user
			});
			return;
		}
		if(data.type !== "photo"){
			req.db.end();
			res.redirect(302, '/' + data.type + '/' + req.param('id'));
			return;
		}
		req.db.end();
		res.render('photo', {
			login:req.user.login,
			user:req.user.user,
			media: data
		});
	});
};

exports.videos = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	var shareinst = new sharelib(req.db);
	shareinst.getMultimedia(req.param("id"), function(data){
		console.log(data);
		if(data === null){
			req.db.end();
			res.render('404', {
				login:req.user.login,
				user:req.user.user
			});
			return;
		}
		if(data.type !== "video"){
			req.db.end();
			res.redirect(302, '/' + data.type + '/' + req.param('id'));
			return;
		}
		req.db.end();
		res.render('video', {
			login:req.user.login,
			user:req.user.user,
			media: data
		});
	});
};

exports.albums = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	var shareInst = new sharelib(req.db);
	shareInst.getAlbum(req.param('id'), function(data){
		if(!data){
			req.db.end();
			res.render('404', {
				login:req.user.login,
				user:req.user.user
			});
			return;
		}
		shareInst.getAlbumItems(req.param('id'), function(items){
			req.db.end();
			res.render('album', {
				login:req.user.login,
				user:req.user.user,
				album:data,
				albumitems:items
			});
		});
	});
};

exports.listAlbums = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	var shareInst = new sharelib(req.db);
	shareInst.getAlbum(req.param('id'), function(data){
		if(!data){
			req.db.end();
			res.render('404', {
				login:req.user.login,
				user:req.user.user
			});
			return;
		}
		shareInst.getAlbumItems(req.param('id'), function(items){
			req.db.end();
			res.render('album', {
				login:req.user.login,
				user:req.user.user,
				album:data,
				albumitems:items
			});
		});
	});
};

exports.createAlbum = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	var tripInst = new triplib(req.db);
	tripInst.getParticipating(req.user.user.uid, function(trips){
		req.db.end();
		res.render('album-create', {
			login:req.user.login,
			user:req.user.user,
			trips:trips,
			error:req.query.error
		});
	});
};

exports.createAlbumPost = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	if(!req.body || typeof req.body.title === "undefined" || typeof req.body.description === "undefined"){
		req.db.end();
		res.redirect(302, '/album/create?error=1');
		return;
	}
	if(!req.body || req.body.title === ""){
		req.db.end();
		res.redirect(302, '/album/create?error=2');
		return;
	}
	var shareInst = new sharelib(req.db);
	shareInst.createAlbum(req.user.user.uid, req.body.title, req.body.description, function(result, id){
		if(!result){
			req.db.end();
			res.redirect(302, '/album/create?error=3');
			return;
		}
		req.db.end();
		res.redirect(302,'/album/' + id);
	});
};

exports.post = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/login');
		return;
	}
	// Create temp store for fields
	var fields = {}, fieldsFinish = false, s3Finish = false, returned = false;
	var fn = req.user.user.uid + "_" + (new Date()).getTime();
	
	var onComplete = function(){
		if(returned){
			return;
		}
		console.log(fields);
		var shareinst = new sharelib(req.db);
		var aid = parseInt(fields.album);
		shareinst.createMediaShare(fields.type, req.user.user.uid, fields.description, req.s3.url + fn, aid < 0 ? null : aid, function(success){
			if(!success){
				req.db.end();
				res.redirect(302, '/?error=1');
				return;
			}
			req.db.end();
			res.redirect(302, '/');
		});
		returned = true;
	};
	req.pipe(req.busboy);
	req.busboy.on('file', function(name, handle, filename, enc, mime){
		if(!filename){
			return;
		};
		handle.fileRead = [];
		handle.on('data', function(chunk){
			this.fileRead.push(chunk);
		});
		handle.on('error', function(err){
			console.log('File Error');
		});
		handle.on('end', function(){
			var buf = Buffer.concat(this.fileRead);
			var stream = req.s3.put('/' + fn, {
				headers: {
					'Content-Length':buf.length,
					'Content-Type': mime,
					'x-amz-acl': 'public-read'
				}
			}, function(err, req, resp){
				s3finish = true;
				if(err){
					console.log(err);
					if(fieldsFinish){
						onComplete();
					}
					return;
				}
				console.log(resp);
				if(fieldsFinish){
					onComplete();
				}
			});
			stream.write(buf);
			stream.end();
		});
	});
	req.busboy.on('field', function(name, val){
		fields[name] = val;
	});
	req.busboy.on('finish', function(){
		fieldsFinish = true;
		if(s3Finish){
			onComplete();
		}
	});
};

exports.ratings = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.end(JSON.stringify({
			code:503,
			msg: 'Not logged in'
		}));
		return;
	}
	var shareInst = new sharelib(req.db);
	shareInst.getRating(req.param('id'), 0, 100, function(list, rating){
		if(list === null){
			req.db.end();
			res.end(JSON.stringify({
				code:400,
				msg:'Read Error!'
			}));
			return;
		}
		req.db.end();
		res.end(JSON.stringify({
			code:200,
			comments:list,
			rating:rating
		}));
	});
}
