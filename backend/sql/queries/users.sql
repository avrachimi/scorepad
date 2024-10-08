-- name: CreateUser :one
INSERT INTO
  users (id, name, email, image_url)
VALUES
  ($1, $2, $3, $4)
RETURNING
  *;

-- name: GetUsers :many
SELECT
  *
FROM
  users;

-- name: GetUsersExcludingFriends :many
SELECT
  *
FROM
  users
WHERE
  id NOT IN (
    SELECT
      CASE
        WHEN member1_id = sqlc.arg (user_id)::uuid THEN member2_id
        WHEN member2_id = sqlc.arg (user_id)::uuid THEN member1_id
      END
    FROM
      friendships
    WHERE
      (
        member1_id = sqlc.arg (user_id)::uuid
        OR member2_id = sqlc.arg (user_id)::uuid
      )
      AND (
        status = 'accepted'
        OR status = 'pending'
      )
  )
  AND id != sqlc.arg (user_id)::uuid
  AND (
    sqlc.arg (search_query)::text IS NULL
    OR name ILIKE '%' || sqlc.arg (search_query)::text || '%'
  );

-- name: GetUserById :one
SELECT
  *
FROM
  users
WHERE
  id = $1;

-- name: GetUserByEmail :one
SELECT
  *
FROM
  users
WHERE
  email = $1;

-- name: GetUserProfileById :one
SELECT
  u.id,
  u.name,
  u.email,
  u.image_url,
  u.created_at,
  u.updated_at,
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
      COUNT(DISTINCT matches.id)
    FROM
      matches
    WHERE
      matches.created_by = u.id
      OR matches.team1_player1 = u.id
      OR matches.team1_player2 = u.id
      OR matches.team2_player1 = u.id
      OR matches.team2_player2 = u.id
  ) AS matches_played
FROM
  users u
WHERE
  u.id = $1;

-- name: GetFriendProfileByUserId :one
SELECT
  u.id,
  u.name,
  u.email,
  u.image_url,
  u.created_at,
  u.updated_at,
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
      COUNT(DISTINCT matches.id)
    FROM
      matches
    WHERE
      matches.created_by = u.id
      OR matches.team1_player1 = u.id
      OR matches.team1_player2 = u.id
      OR matches.team2_player1 = u.id
      OR matches.team2_player2 = u.id
  ) AS matches_played
FROM
  users u
  JOIN friendships f ON (
    f.member1_id = sqlc.arg (user_id)::uuid
    AND u.id = f.member2_id
  )
  OR (
    f.member2_id = sqlc.arg (user_id)::uuid
    AND u.id = f.member1_id
  )
WHERE
  f.status = 'accepted'
  AND u.id = sqlc.arg (friend_id)::uuid;

-- name: DeleteUser :exec
DELETE FROM users
WHERE
  id = $1;
