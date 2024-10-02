-- name: CreateMatch :one
INSERT INTO
  matches (
    id,
    match_date,
    duration_minutes,
    created_by,
    team1_score,
    team1_player1,
    team1_player2,
    team2_score,
    team2_player1,
    team2_player2
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING
  *;

-- name: GetMatchesForUserId :many
SELECT
  m.*,
  json_build_object(
    'id',
    u1.id,
    'name',
    u1.name,
    'email',
    u1.email,
    'image_url',
    u1.image_url
  ) AS team1_player1,
  json_build_object(
    'id',
    u2.id,
    'name',
    u2.name,
    'email',
    u2.email,
    'image_url',
    u2.image_url
  ) AS team1_player2,
  json_build_object(
    'id',
    u3.id,
    'name',
    u3.name,
    'email',
    u3.email,
    'image_url',
    u3.image_url
  ) AS team2_player1,
  json_build_object(
    'id',
    u4.id,
    'name',
    u4.name,
    'email',
    u4.email,
    'image_url',
    u4.image_url
  ) AS team2_player2,
  json_build_object(
    'id',
    u5.id,
    'name',
    u5.name,
    'email',
    u5.email,
    'image_url',
    u5.image_url
  ) AS created_by
FROM
  matches m
  LEFT JOIN users u1 ON m.team1_player1 = u1.id
  LEFT JOIN users u2 ON m.team1_player2 = u2.id
  LEFT JOIN users u3 ON m.team2_player1 = u3.id
  LEFT JOIN users u4 ON m.team2_player2 = u4.id
  LEFT JOIN users u5 ON m.created_by = u5.id
WHERE
  m.created_by = $1
  OR m.team1_player1 = $1
  OR m.team1_player2 = $1
  OR m.team2_player1 = $1
  OR m.team2_player2 = $1
ORDER BY
  m.match_date DESC;

-- name: GetMatchById :one
SELECT
  m.*,
  json_build_object(
    'id',
    u1.id,
    'name',
    u1.name,
    'email',
    u1.email,
    'image_url',
    u1.image_url
  ) AS team1_player1,
  json_build_object(
    'id',
    u2.id,
    'name',
    u2.name,
    'email',
    u2.email,
    'image_url',
    u2.image_url
  ) AS team1_player2,
  json_build_object(
    'id',
    u3.id,
    'name',
    u3.name,
    'email',
    u3.email,
    'image_url',
    u3.image_url
  ) AS team2_player1,
  json_build_object(
    'id',
    u4.id,
    'name',
    u4.name,
    'email',
    u4.email,
    'image_url',
    u4.image_url
  ) AS team2_player2,
  json_build_object(
    'id',
    u5.id,
    'name',
    u5.name,
    'email',
    u5.email,
    'image_url',
    u5.image_url
  ) AS created_by
FROM
  matches m
  LEFT JOIN users u1 ON m.team1_player1 = u1.id
  LEFT JOIN users u2 ON m.team1_player2 = u2.id
  LEFT JOIN users u3 ON m.team2_player1 = u3.id
  LEFT JOIN users u4 ON m.team2_player2 = u4.id
  LEFT JOIN users u5 ON m.created_by = u5.id
WHERE
  m.id = $1;

-- name: UpdateMatch :exec
UPDATE matches
SET
  match_date = $2,
  duration_minutes = $3,
  team1_score = $4,
  team1_player1 = $5,
  team1_player2 = $6,
  team2_score = $7,
  team2_player1 = $8,
  team2_player2 = $9,
  updated_at = NOW()
WHERE
  id = $1
  AND created_by = sqlc.arg (user_id)::uuid;

-- name: DeleteMatch :exec
DELETE FROM matches
WHERE
  id = $1
  AND created_by = sqlc.arg (user_id)::uuid;

-- name: GetRecentMatchesForUserId :many
SELECT
  m.*,
  json_build_object(
    'id',
    u1.id,
    'name',
    u1.name,
    'email',
    u1.email,
    'image_url',
    u1.image_url
  ) AS team1_player1,
  json_build_object(
    'id',
    u2.id,
    'name',
    u2.name,
    'email',
    u2.email,
    'image_url',
    u2.image_url
  ) AS team1_player2,
  json_build_object(
    'id',
    u3.id,
    'name',
    u3.name,
    'email',
    u3.email,
    'image_url',
    u3.image_url
  ) AS team2_player1,
  json_build_object(
    'id',
    u4.id,
    'name',
    u4.name,
    'email',
    u4.email,
    'image_url',
    u4.image_url
  ) AS team2_player2,
  json_build_object(
    'id',
    u5.id,
    'name',
    u5.name,
    'email',
    u5.email,
    'image_url',
    u5.image_url
  ) AS created_by
FROM
  matches m
  LEFT JOIN users u1 ON m.team1_player1 = u1.id
  LEFT JOIN users u2 ON m.team1_player2 = u2.id
  LEFT JOIN users u3 ON m.team2_player1 = u3.id
  LEFT JOIN users u4 ON m.team2_player2 = u4.id
  LEFT JOIN users u5 ON m.created_by = u5.id
WHERE
  match_date > NOW() - INTERVAL '1 month'
  AND (
    m.created_by = sqlc.arg (user_id)::uuid
    OR m.team1_player1 = sqlc.arg (user_id)::uuid
    OR m.team1_player2 = sqlc.arg (user_id)::uuid
    OR m.team2_player1 = sqlc.arg (user_id)::uuid
    OR m.team2_player2 = sqlc.arg (user_id)::uuid
  )
ORDER BY
  match_date DESC
LIMIT
  10;
