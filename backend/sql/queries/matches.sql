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
  *
FROM
  matches
WHERE
  created_by = $1
  OR team1_player1 = $1
  OR team1_player2 = $1
  OR team2_player1 = $1
  OR team2_player2 = $1;

-- name: GetMatchById :one
-- params: id uuid, userID uuid
SELECT
  *
FROM
  matches
WHERE
  id = $1
  AND (
    created_by = sqlc.arg (user_id)::uuid
    OR team1_player1 = sqlc.arg (user_id)::uuid
    OR team1_player2 = sqlc.arg (user_id)::uuid
    OR team2_player1 = sqlc.arg (user_id)::uuid
    OR team2_player2 = sqlc.arg (user_id)::uuid
  );

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
  id = $1;

-- name: DeleteMatch :exec
DELETE FROM matches
WHERE
  id = $1;

-- name: GetRecentMatches :many
SELECT
  *
FROM
  matches
WHERE
  match_date > NOW() - INTERVAL '1 week'
ORDER BY
  match_date DESC
LIMIT
  10;
