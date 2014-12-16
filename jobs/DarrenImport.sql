
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES (?)

INSERT INTO friends (src_uid, dest_uid) VALUES (?)

INSERT INTO trips (trip_id, owner_uid, title, start_date, end_date, time, description, privacy) VALUES (?)

INSERT INTO trip_members (trip_id, uid, role) VALUES (?)

INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (?)

INSERT INTO locations (lid, name, type, yelp_id) VALUES (?)

INSERT INTO items (iid, description) VALUES (?)

INSERT INTO item_checklists (trip_id, iid) VALUES (?)

INSERT INTO schedules (trip_id, trip_date, lid) VALUES (?)

INSERT INTO location_ratings (lid, uid, rating, comment) VALUES (?)

INSERT INTO wishlists (uid, lid) VALUES (?)

INSERT INTO shareables (type, id, owner_id, time) VALUES (?)

INSERT INTO shareable_albums (id, title, description, updateTime) VALUES (?)

INSERT INTO multimedia (id, title, url) VALUES (?)

INSERT INTO album_items (album_id, item_id) VALUES (?)

INSERT INTO trip_shareables (item_id, trip_id, privacy, time) VALUES (?)

INSERT INTO shareable_links (id, url, description) VALUES (?)

INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (?)

INSERT INTO share (id, src_uid, dest_uid, time) VALUES (?)


-- ABOVE IS HELPFUL STUFF

-- Users
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Lawson', 'lsn', '', 0, '', '', 'lawson@upenn.com', 'Penn', 'Hiking');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Goodson', 'gsn', '', 0, '', '', 'goodson@penn.edu', 'Penn', 'Biking');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Badson', 'bsn', '', 0, '', '', 'badson@bad.com', 'Drexel', 'Running');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Wasaba', 'wsb', '', 0, '', '', 'spicy@food.com', 'JHU', 'Eating');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Nana', 'nna', '', 0, '', '', 'nana@nana.com', 'PHD', 'Learning');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Zhouying Fan', 'fanzyland2004@gmail.com', '', 0, '', '', 'fanzyland2004@gmail.com', 'UPenn', 'Travel');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Yi Peng', 'peng1@seas.upenn.com', '', 0, '', '', 'peng1@seas.upenn.edu', 'Upenn', 'Fashion');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Yan Li', 'liyan6@seas.upenn.edu', '', 0, '' , '', 'liyan6@seas.upenn.edu', 'Upenn', 'Sports');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Taorui Cui', 'terrycui0811@gmail.com', '', 0, '', '', 'terrycui0811@gmail.com', 'Upenn', 'Eating');
INSERT INTO users (name, login, password, privacy, address, phone, email, affiliation, interests) VALUES ('Guagua Er', 'guaguaer01@gmail.com', '', 0, '', '', 'guaguaer01@gmail.com', 'Upenn', 'null');

-- Media ratings
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (1, 10, 'great', NOW(), 1);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (1, 5, 'just so so', NOW(), 2);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (5, 5, "Dude, that's a shark", NOW(), 3);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (5, 3, 'Kittens are dumb', NOW(), 2);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (5, 2, "Hey, that's me", NOW(), 4);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (4, 2, 'so huge', NOW(), 5);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (4, 0, 'NULL', NOW(), 6);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (3, 10, 'beautiful', NOW(), 1);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (3, 6, 'so cold', NOW(), 2);
INSERT INTO shareable_ratings (item_id, rating, comment, time, rater_id) VALUES (3, 8, 'Was an awesome experience', NOW(), 4);