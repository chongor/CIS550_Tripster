
INSERT INTO users (uid, name, login, password, privacy, address, phone, email, affiliation, interests) VALUES (?)

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




