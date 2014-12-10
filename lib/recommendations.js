/**
 * Library for handling recommendations
 * @leoloo
 */


// Recommend trips where at least 2 of your friends are in
SELECT T.tid
FROM trips T
INNER JOIN trip_members M WHERE M.trip_id = T.trip_id
INNER JOIN friends F WHERE M.uid = F.dest_uid
WHERE F.src_uid = ?
GROUP BY T.tid
HAVING COUNT(dest_uid) > 4;

// Recommend trips where at
