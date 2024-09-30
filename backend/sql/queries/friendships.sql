-- name: GetFriends :many
SELECT
  u.id,
  u.name,
  u.email,
  u.image_url
FROM
  friendships f
  JOIN users u ON (
    u.id = f.member1_id
    OR u.id = f.member2_id
  )
WHERE
  (
    f.member1_id = $1
    OR f.member2_id = $1
  )
  AND f.status = 'accepted'
  AND u.id != $1;

-- name: SendFriendRequest :one
INSERT INTO
  friendships (id, member1_id, member2_id, status)
VALUES
  ($1, $2, $3, 'pending')
RETURNING
  *;

-- name: AcceptFriendRequest :exec
UPDATE friendships
SET
  status = 'accepted',
  accepted_on = NOW()
WHERE
  id = $1;

-- name: RemoveFriend :exec
DELETE FROM friendships
WHERE
  (
    member1_id = $1
    AND member2_id = $2
  )
  OR (
    member1_id = $2
    AND member2_id = $1
  );

-- name: GetFriendRequests :many
SELECT
  u.id,
  u.name,
  u.email,
  u.image_url,
  f.id AS friendship_id
FROM
  friendships f
  JOIN users u ON (
    u.id = f.member1_id
    OR u.id = f.member2_id
  )
WHERE
  (
    f.member1_id = $1
    OR f.member2_id = $1
  )
  AND f.status = 'pending'
  AND u.id != $1;
