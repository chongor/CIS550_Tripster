var userlib = require("../lib/users.js");
var sharelib= require("../lib/shares.js");
var triplib = require("../lib/trips.js");
var newslib = require("../lib/newsfeed.js");
var notelib = require("../lib/notifications.js");

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

exports.cover = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.redirect(302, '/img/album-empty.jpg');
		return;
	}
	var shareInst = new sharelib(req.db);
	shareInst.getAlbumCover(req.param('id'), function(items){
		if(!items){
			req.db.end();
			res.redirect(302, '/img/album-empty.jpg');
			return;
		}
		if(items.length === 0){
			req.db.end();
			res.redirect(302, '/img/album-empty.jpg');
			return;
		}else{
			req.db.end();
			res.redirect(302, items[0].url);
			return;
		}
	});
};

exports.userAlbums = function(req, res){
	if(!req.user.login){
		req.db.end();
		res.json({
			code:503,
			msg:"Permission Denied. Not logged in."
		});
		return;
	}
	var shareInst = new sharelib(req.db);
	shareInst.getAlbumsByOwner(req.param('id'), function(data){
		if(data === null){
			req.db.end();
			res.json({
				code:404,
				msg:"Read albums failed"
			});
			return;
		}
		req.db.end();
		res.json({
			code:200,
			albums: data
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
		var parent = parseInt(req.body.parent);
		var privacy = parseInt(req.body.privacy);
		if(parent >= 0){
			// We need to parent this to a trip
			shareInst.parentShareable(id, parent, privacy, function(success, err){
				if(!success){
					req.db.end();
					res.redirect(302, '/album/' + id);
					return;
				}
				// parented 
				shareInst.getAlbum(id, function(result){
					console.log(result);
					if(!result){
						req.db.end();
						res.redirect(302, '/album/' + id);
						return;
					}
					result.type = 'album';
					var newsInst = new newslib(req.db);
					newsInst.post(req.user.user.uid, 0, JSON.stringify(result),function(result, err){
						if(!result){
							console.log('Error adding album to newsfeed!');
							req.db.end();
							res.redirect(302,'/album/' + id);
							return;
						}
						req.db.end();
						res.redirect(302,'/album/' + id);
						return;
					});
				});
				
				// yeah
			})
		}else{
			shareInst.getAlbum(id, function(result){
				console.log(result);
				if(!result){
					req.db.end();
					res.redirect(302, '/album/' + id);
					return;
				}
				result.type = 'album';
				var newsInst = new newslib(req.db);
				newsInst.post(req.user.user.uid, 0, JSON.stringify(result),function(result, err){
					if(!result){
						console.log('Error adding album to newsfeed!');
						req.db.end();
						res.redirect(302,'/album/' + id);
						return;
					}
					req.db.end();
					res.redirect(302,'/album/' + id);
					return;
				});
			});
		}
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
		shareinst.createMediaShare(fields.type, req.user.user.uid, fields.description, req.s3.url + fn, aid < 0 ? null : aid, function(success, sid){
			if(!success){
				req.db.end();
				res.redirect(302, '/?error=1');
				return;
			}
			shareinst.getMultimedia(sid, function(data){
				if(data === null){
					req.db.end();
					res.redirect(302, '/?error=2');
					return;
				}
				var newsInst = new newslib(req.db);
				newsInst.post(req.user.user.uid, 0, JSON.stringify(data), function(result, err) {
					if(!result){
						console.log(err);
					}
					req.db.end();
					res.redirect(302, '/?success=1');
					return;
				});
			});
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
	if(req.method.toUpperCase() === "GET"){
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
	} else {
		shareInst.addRating(req.param('id'), req.body.rating, req.body.comment, req.user.user.uid, function(success,err){
			if(!success){
				req.db.end();
				console.log(err);
				res.json({
					code:400,
					msg:err
				});
				return;
			}
			var noteinst = new notelib(req.db);
			shareInst.getShareable(req.param('id'), function(sb){
				if(sb === null || sb.owner === req.user.user.uid){	
					req.db.end();
					res.json({
						code:200
					});
					return;
				};
				noteinst.send(sb.owner, {
					"text":req.user.user.fullname + " added a rating to your " + sb.type,
					"url":"/" + sb.type + "/" + req.param('id'),
					"meta":"mediaRating"
				}, function(){	
					req.db.end();
					res.json({
						code:200
					});
				});
			});
		});
	}
}
