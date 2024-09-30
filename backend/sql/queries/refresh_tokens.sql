-- name: CreateRefreshToken :one
INSERT INTO
  refresh_tokens (id, token, user_id, expires_at, created_at)
VALUES
  ($1, $2, $3, $4, NOW())
RETURNING
  *;

-- name: GetRefreshTokenByToken :one
SELECT
  *
FROM
  refresh_tokens
WHERE
  token = $1;

-- name: GetRefreshTokenById :one
SELECT
  *
FROM
  refresh_tokens
WHERE
  id = $1;

-- name: DeleteRefreshToken :exec
DELETE FROM refresh_tokens
WHERE
  id = $1;

-- name: DeleteRefreshTokensByUserId :exec
DELETE FROM refresh_tokens
WHERE
  user_id = $1;
