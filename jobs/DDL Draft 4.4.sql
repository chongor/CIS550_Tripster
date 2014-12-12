-- 0 - public, 1 - private = friends only

CREATE TABLE users (
	uid INT NOT NULL AUTO_INCREMENT,
	name TEXT NOT NULL,
	login VARCHAR(56) NOT NULL,
	password TEXT NOT NULL,
	privacy INT NOT NULL,
	address TEXT NOT NULL,
	phone TEXT NOT NULL,
	email TEXT NOT NULL,
	affiliation TEXT NOT NULL,
	interests TEXT NOT NULL,
	PRIMARY KEY (uid),
	UNIQUE (login)
);

-- CREATE INDEX index_users ON users(uid);

CREATE TABLE notifications (
	owner_id INT NOT NULL,
 	nid INT NOT NULL,
	notification TEXT NOT NULL,
	PRIMARY KEY (owner_id, nid),
	FOREIGN KEY (owner_id) REFERENCES users(uid)
);

CREATE TABLE newsfeed_items (
	owner_id INT NOT NULL,
 	fid INT NOT NULL,
	newsfeed TEXT NOT NULL,
	PRIMARY KEY (owner_id, fid),
	FOREIGN KEY (owner_id) REFERENCES users(uid)
);

CREATE TABLE friends (
	src_uid INT NOT NULL,
	dest_uid INT NOT NULL,
	PRIMARY KEY (src_uid, dest_uid),
	FOREIGN KEY (src_uid) REFERENCES users(uid),
 	FOREIGN KEY (dest_uid) REFERENCES users(uid)
);

CREATE TABLE trips (
	trip_id INT NOT NULL AUTO_INCREMENT,
	owner_uid INT NOT NULL,
	title TEXT NOT NULL,
	start_date date NOT NULL,
	end_date date NOT NULL,
	time TIMESTAMP NOT NULL,
	description TEXT NOT NULL,
	privacy INT NOT NULL, # 0 - public, 1 - friends only
	PRIMARY KEY (trip_id),
	FOREIGN KEY (owner_uid) REFERENCES users(uid)
);

-- CREATE INDEX index_trips ON trips(trip_id);

CREATE TABLE trip_members (
	trip_id INT NOT NULL,
	uid INT NOT NULL,
	role ENUM('invite','request','member:invite', 'member:request', 'admin') NOT NULL,
	PRIMARY KEY (trip_id, uid),
	FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
	FOREIGN KEY (uid) REFERENCES users(uid)
);

CREATE TABLE trip_ratings (
	trip_id INT NOT NULL,
	uid INT NOT NULL,
	rating INT NOT NULL,
	comment TEXT NOT NULL,
	time TIMESTAMP NOT NULL,
	PRIMARY KEY (trip_id, uid),
	FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
	FOREIGN KEY (uid) REFERENCES users(uid)
);


CREATE TABLE locations (
	lid INT NOT NULL AUTO_INCREMENT,
	name TEXT NOT NULL,
	type TEXT NOT NULL,
	PRIMARY KEY (lid)
);

-- CREATE INDEX index_locations ON locations(lid);

CREATE TABLE items (
	iid INT NOT NULL AUTO_INCREMENT, 
	description TEXT NOT NULL,
	PRIMARY KEY (iid)
);

CREATE TABLE items_checklists (
	trip_id INT NOT NULL,
	iid INT NOT NULL,
	PRIMARY KEY (trip_id, iid),
	FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
	FOREIGN KEY (iid) REFERENCES items(iid)
);

CREATE TABLE schedules (
	trip_id INT NOT NULL,
	trip_date DATE NOT NULL,
	lid INT NOT NULL,
 	PRIMARY KEY (trip_id, trip_date),
	FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
	FOREIGN KEY (lid) REFERENCES locations(lid)
);
-- Yelp API returns name as 
-- Yelp API returns id as string
CREATE TABLE lodgings (
	lodging_lid INT NOT NULL,
	hotel TEXT NOT NULL,
	hotel_id VARCHAR(128) NOT NULL,	
 	PRIMARY KEY (lodging_lid, hotel_id),
    FOREIGN KEY (lodging_lid) REFERENCES locations(lid)
);

CREATE TABLE location_ratings (
	lid INT NOT NULL,
	uid INT NOT NULL,
	rating INT NOT NULL DEFAULT 0,
	comment TEXT NOT NULL,
	PRIMARY KEY (lid, uid),
	FOREIGN KEY (lid) REFERENCES locations(lid),
	FOREIGN KEY (uid) REFERENCES users(uid)
);

CREATE TABLE wishlists (
	uid INT NOT NULL,
	lid INT NOT NULL,
	PRIMARY KEY (uid, lid),
	FOREIGN KEY (uid) REFERENCES users(uid),
	FOREIGN KEY (lid) REFERENCES locations(lid)
);

CREATE TABLE shareables (
	type ENUM('photo', 'video', 'url', 'album') NOT NULL,
	id INT NOT NULL AUTO_INCREMENT,
	owner_id INT NOT NULL,
	time TIMESTAMP NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (owner_id) REFERENCES users(uid)
);

CREATE TABLE shareable_albums (
	id INT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	updateTime TIMESTAMP NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (id) REFERENCES shareables(id)
);

-- photo_video_type: 'photo' or 'video'
-- photo or video is stored as URL
-- alternative: store photo/image file in server and store pathname here
CREATE TABLE multimedia (
	id INT NOT NULL,
	title TEXT NOT NULL,
	url TEXT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (id) REFERENCES shareables(id)
);

-- item_id in album can only be a multimedia
CREATE TABLE album_items (
	album_id INT NOT NULL,
	item_id INT NOT NULL,
	PRIMARY KEY (album_id, item_id),
	FOREIGN KEY (album_id) REFERENCES shareable_albums(id),    
	FOREIGN KEY (item_id) REFERENCES multimedia(id)
);

CREATE TABLE trip_shareables (
	item_id INT NOT NULL,
	trip_id INT NOT NULL,
	privacy INT NOT NULL,
	time TIMESTAMP NOT NULL,
	PRIMARY KEY (trip_id, item_id),
	FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
	FOREIGN KEY (item_id) REFERENCES shareables(id)
);

CREATE TABLE shareable_links (
	id INT NOT NULL,
	url TEXT NOT NULL,
	description TEXT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (id) REFERENCES shareables(id)
);

CREATE TABLE shareable_ratings (
	item_id INT NOT NULL,
	rating INT NOT NULL,
	comment TEXT NOT NULL,
	rater_id INT NOT NULL,
	PRIMARY KEY (item_id, rater_id),
	FOREIGN KEY (rater_id) REFERENCES users(uid),
	FOREIGN KEY (item_id) REFERENCES shareables(id)
);

-- No record in share => Private
-- src = dst = owner => Public for everyone
-- src = owner, dst = (user) => Share with (user) [sharing with friends means sharing with each friends]
CREATE TABLE share (
	id INT NOT NULL,
	src_uid INT NOT NULL,
	dest_uid INT NOT NULL,
	time TIMESTAMP NOT NULL,
	PRIMARY KEY (id, src_uid, dest_uid),
	FOREIGN KEY (dest_uid) REFERENCES users(uid),
	FOREIGN KEY (src_uid) REFERENCES users(uid),
	FOREIGN KEY (id) REFERENCES shareables(id)
);
