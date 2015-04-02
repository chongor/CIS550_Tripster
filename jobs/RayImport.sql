
INSERT INTO users (uid, name, login, password, privacy, address, phone, email, affiliation, interests) VALUES (?)

INSERT INTO friends (src_uid, dest_uid) VALUES (?)

INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (?)

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

-- Actual commands below
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (1, "A COOL TRIP", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "MOUNTAINS", 1)
INSERT INTO trips (1, "SWIMMING", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "LAKE", 1)
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (2, "NO GOOD", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "MOUNTAINS", 1)
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (3, "LET'S GO", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "MOUNTAINS", 1)
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (4, "DIVE", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "MOUNTAINS", 1)
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (6, "Japan Trip", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "null", 1)
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (7, "Hawaii Trip", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "null", 1)
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (7, "San Francisco", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "null", 1)
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (8, "China Trip", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "null", 1)
INSERT INTO trips (owner_uid, title, start_date, end_date, time, description, privacy) VALUES (9, "Mexico Trip", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "2014-09-15T00:00:00.000Z", "null", 1)

INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (1, 6, 10, "Excellent", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (2, 6, 5, "just so so", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (2, 6, 5, "Crazy trip", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (1, 12, 5, "Enjoyed", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (3, 6, 5, "Loads of fun", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (4, 6, 6, "I like it", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (1, 6, 1, "Fantastic", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (1, 6, 5, "Decent", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (1, 6, 3, "Very nice", "2014-09-15T00:00:00.000Z")
INSERT INTO trip_ratings (trip_id, uid, rating, comment, time) VALUES (1, 6, 2, "Not bad", "2014-09-15T00:00:00.000Z")







