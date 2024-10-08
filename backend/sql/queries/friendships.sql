-- name: GetFriends :many
SELECT
  u.id,
  u.name,
  u.email,
  u.image_url,
  u.created_at,
  f.id AS friendship_id,
  f.updated_at AS friends_since,
  (
    SELECT
      COUNT(*)
    FROM
      friendships
    WHERE
      (
        friendships.member1_id = u.id
        OR friendships.member2_id = u.id
      )
      AND friendships.status = 'accepted'
  ) AS total_friends,
  (
    SELECT
      COUNT(DISTINCT m.id)
    FROM
      matches m
    WHERE
      m.created_by = u.id
      OR m.team1_player1 = u.id
      OR m.team1_player2 = u.id
      OR m.team2_player1 = u.id
      OR m.team2_player2 = u.id
  ) AS matches_played
FROM
  friendships f
  JOIN users u ON (
    (
      u.id = f.member1_id
      AND f.member2_id = sqlc.arg (user_id)::uuid
    )
    OR (
      u.id = f.member2_id
      AND f.member1_id = sqlc.arg (user_id)::uuid
    )
  )
WHERE
  f.status = 'accepted'
  AND u.id != sqlc.arg (user_id)::uuid
  AND (
    sqlc.arg (excluded_ids)::uuid [] IS NULL
    OR NOT (u.id = ANY (sqlc.arg (excluded_ids)::uuid []))
  )
  AND (
    sqlc.arg (search_query)::text IS NULL
    OR u.name ILIKE '%' || sqlc.arg (search_query)::text || '%'
  );

-- name: SendFriendRequest :one
INSERT INTO
  friendships (id, member1_id, member2_id, requested_by, status)
VALUES
  ($1, $2, $3, $4, 'pending')
RETURNING
  *;

-- name: AcceptFriendRequest :exec
UPDATE friendships
SET
  status = 'accepted',
  accepted_on = NOW(),
  updated_at = NOW()
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
  f.id AS friendship_id,
  f.requested_by AS requested_by,
  f.created_at AS requested_on
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
  AND u.id != $1
  AND f.requested_by != $1;

-- name: DeleteFriendship :exec
DELETE FROM friendships
WHERE
  id = $1
  AND (
    member1_id = sqlc.arg (user_id)::uuid
    OR member2_id = sqlc.arg (user_id)::uuid
  );
