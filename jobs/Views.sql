CREATE VIEW vFriends AS (
	SELECT F1.src_uid AS uid, F1.dest_uid AS friend
	FROM friends F1
	INNER JOIN friends F2 ON F1.dest_uid = F2.src_uid
	WHERE F2.dest_uid = F1.src_uid
)
