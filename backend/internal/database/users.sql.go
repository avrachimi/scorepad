// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0
// source: users.sql

package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const createUser = `-- name: CreateUser :one
INSERT INTO
  users (id, name, email, image_url)
VALUES
  ($1, $2, $3, $4)
RETURNING
  id, name, email, image_url, created_at, updated_at
`

type CreateUserParams struct {
	ID       uuid.UUID
	Name     string
	Email    string
	ImageUrl sql.NullString
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx, createUser,
		arg.ID,
		arg.Name,
		arg.Email,
		arg.ImageUrl,
	)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Email,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteUser = `-- name: DeleteUser :exec
DELETE FROM users
WHERE
  id = $1
`

func (q *Queries) DeleteUser(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteUser, id)
	return err
}

const getFriendProfileByUserId = `-- name: GetFriendProfileByUserId :one
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
    f.member1_id = $1::uuid
    AND u.id = f.member2_id
  )
  OR (
    f.member2_id = $1::uuid
    AND u.id = f.member1_id
  )
WHERE
  f.status = 'accepted'
  AND u.id = $2::uuid
`

type GetFriendProfileByUserIdParams struct {
	UserID   uuid.UUID
	FriendID uuid.UUID
}

type GetFriendProfileByUserIdRow struct {
	ID            uuid.UUID
	Name          string
	Email         string
	ImageUrl      sql.NullString
	CreatedAt     time.Time
	UpdatedAt     sql.NullTime
	TotalFriends  int64
	MatchesPlayed int64
}

func (q *Queries) GetFriendProfileByUserId(ctx context.Context, arg GetFriendProfileByUserIdParams) (GetFriendProfileByUserIdRow, error) {
	row := q.db.QueryRowContext(ctx, getFriendProfileByUserId, arg.UserID, arg.FriendID)
	var i GetFriendProfileByUserIdRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Email,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.TotalFriends,
		&i.MatchesPlayed,
	)
	return i, err
}

const getUserByEmail = `-- name: GetUserByEmail :one
SELECT
  id, name, email, image_url, created_at, updated_at
FROM
  users
WHERE
  email = $1
`

func (q *Queries) GetUserByEmail(ctx context.Context, email string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserByEmail, email)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Email,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getUserById = `-- name: GetUserById :one
SELECT
  id, name, email, image_url, created_at, updated_at
FROM
  users
WHERE
  id = $1
`

func (q *Queries) GetUserById(ctx context.Context, id uuid.UUID) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserById, id)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Email,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getUserProfileById = `-- name: GetUserProfileById :one
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
  u.id = $1
`

type GetUserProfileByIdRow struct {
	ID            uuid.UUID
	Name          string
	Email         string
	ImageUrl      sql.NullString
	CreatedAt     time.Time
	UpdatedAt     sql.NullTime
	TotalFriends  int64
	MatchesPlayed int64
}

func (q *Queries) GetUserProfileById(ctx context.Context, id uuid.UUID) (GetUserProfileByIdRow, error) {
	row := q.db.QueryRowContext(ctx, getUserProfileById, id)
	var i GetUserProfileByIdRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Email,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.TotalFriends,
		&i.MatchesPlayed,
	)
	return i, err
}

const getUsers = `-- name: GetUsers :many
SELECT
  id, name, email, image_url, created_at, updated_at
FROM
  users
`

func (q *Queries) GetUsers(ctx context.Context) ([]User, error) {
	rows, err := q.db.QueryContext(ctx, getUsers)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []User
	for rows.Next() {
		var i User
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Email,
			&i.ImageUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getUsersExcludingFriends = `-- name: GetUsersExcludingFriends :many
SELECT
  id, name, email, image_url, created_at, updated_at
FROM
  users
WHERE
  id NOT IN (
    SELECT
      CASE
        WHEN member1_id = $1::uuid THEN member2_id
        WHEN member2_id = $1::uuid THEN member1_id
      END
    FROM
      friendships
    WHERE
      (
        member1_id = $1::uuid
        OR member2_id = $1::uuid
      )
      AND (
        status = 'accepted'
        OR status = 'pending'
      )
  )
  AND id != $1::uuid
  AND (
    $2::text IS NULL
    OR name ILIKE '%' || $2::text || '%'
  )
`

type GetUsersExcludingFriendsParams struct {
	UserID      uuid.UUID
	SearchQuery string
}

func (q *Queries) GetUsersExcludingFriends(ctx context.Context, arg GetUsersExcludingFriendsParams) ([]User, error) {
	rows, err := q.db.QueryContext(ctx, getUsersExcludingFriends, arg.UserID, arg.SearchQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []User
	for rows.Next() {
		var i User
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Email,
			&i.ImageUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
