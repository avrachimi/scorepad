// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0
// source: matches.sql

package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const createMatch = `-- name: CreateMatch :one
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
  id, match_date, duration_minutes, created_by, team1_score, team1_player1, team1_player2, team2_score, team2_player1, team2_player2, created_at, updated_at
`

type CreateMatchParams struct {
	ID              uuid.UUID
	MatchDate       time.Time
	DurationMinutes int32
	CreatedBy       uuid.UUID
	Team1Score      int32
	Team1Player1    uuid.UUID
	Team1Player2    uuid.NullUUID
	Team2Score      int32
	Team2Player1    uuid.NullUUID
	Team2Player2    uuid.NullUUID
}

func (q *Queries) CreateMatch(ctx context.Context, arg CreateMatchParams) (Match, error) {
	row := q.db.QueryRowContext(ctx, createMatch,
		arg.ID,
		arg.MatchDate,
		arg.DurationMinutes,
		arg.CreatedBy,
		arg.Team1Score,
		arg.Team1Player1,
		arg.Team1Player2,
		arg.Team2Score,
		arg.Team2Player1,
		arg.Team2Player2,
	)
	var i Match
	err := row.Scan(
		&i.ID,
		&i.MatchDate,
		&i.DurationMinutes,
		&i.CreatedBy,
		&i.Team1Score,
		&i.Team1Player1,
		&i.Team1Player2,
		&i.Team2Score,
		&i.Team2Player1,
		&i.Team2Player2,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteMatch = `-- name: DeleteMatch :exec
DELETE FROM matches
WHERE
  id = $1
`

func (q *Queries) DeleteMatch(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteMatch, id)
	return err
}

const getMatchById = `-- name: GetMatchById :one
SELECT
  id, match_date, duration_minutes, created_by, team1_score, team1_player1, team1_player2, team2_score, team2_player1, team2_player2, created_at, updated_at
FROM
  matches
WHERE
  id = $1
  AND (
    created_by = $2::uuid
    OR team1_player1 = $2::uuid
    OR team1_player2 = $2::uuid
    OR team2_player1 = $2::uuid
    OR team2_player2 = $2::uuid
  )
`

type GetMatchByIdParams struct {
	ID     uuid.UUID
	UserID uuid.UUID
}

// params: id uuid, userID uuid
func (q *Queries) GetMatchById(ctx context.Context, arg GetMatchByIdParams) (Match, error) {
	row := q.db.QueryRowContext(ctx, getMatchById, arg.ID, arg.UserID)
	var i Match
	err := row.Scan(
		&i.ID,
		&i.MatchDate,
		&i.DurationMinutes,
		&i.CreatedBy,
		&i.Team1Score,
		&i.Team1Player1,
		&i.Team1Player2,
		&i.Team2Score,
		&i.Team2Player1,
		&i.Team2Player2,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getMatchesForUserId = `-- name: GetMatchesForUserId :many
SELECT
  id, match_date, duration_minutes, created_by, team1_score, team1_player1, team1_player2, team2_score, team2_player1, team2_player2, created_at, updated_at
FROM
  matches
WHERE
  created_by = $1
  OR team1_player1 = $1
  OR team1_player2 = $1
  OR team2_player1 = $1
  OR team2_player2 = $1
`

func (q *Queries) GetMatchesForUserId(ctx context.Context, createdBy uuid.UUID) ([]Match, error) {
	rows, err := q.db.QueryContext(ctx, getMatchesForUserId, createdBy)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Match
	for rows.Next() {
		var i Match
		if err := rows.Scan(
			&i.ID,
			&i.MatchDate,
			&i.DurationMinutes,
			&i.CreatedBy,
			&i.Team1Score,
			&i.Team1Player1,
			&i.Team1Player2,
			&i.Team2Score,
			&i.Team2Player1,
			&i.Team2Player2,
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

const getRecentMatches = `-- name: GetRecentMatches :many
SELECT
  id, match_date, duration_minutes, created_by, team1_score, team1_player1, team1_player2, team2_score, team2_player1, team2_player2, created_at, updated_at
FROM
  matches
WHERE
  match_date > NOW() - INTERVAL '1 week'
ORDER BY
  match_date DESC
LIMIT
  10
`

func (q *Queries) GetRecentMatches(ctx context.Context) ([]Match, error) {
	rows, err := q.db.QueryContext(ctx, getRecentMatches)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Match
	for rows.Next() {
		var i Match
		if err := rows.Scan(
			&i.ID,
			&i.MatchDate,
			&i.DurationMinutes,
			&i.CreatedBy,
			&i.Team1Score,
			&i.Team1Player1,
			&i.Team1Player2,
			&i.Team2Score,
			&i.Team2Player1,
			&i.Team2Player2,
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

const updateMatch = `-- name: UpdateMatch :exec
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
`

type UpdateMatchParams struct {
	ID              uuid.UUID
	MatchDate       time.Time
	DurationMinutes int32
	Team1Score      int32
	Team1Player1    uuid.UUID
	Team1Player2    uuid.NullUUID
	Team2Score      int32
	Team2Player1    uuid.NullUUID
	Team2Player2    uuid.NullUUID
}

func (q *Queries) UpdateMatch(ctx context.Context, arg UpdateMatchParams) error {
	_, err := q.db.ExecContext(ctx, updateMatch,
		arg.ID,
		arg.MatchDate,
		arg.DurationMinutes,
		arg.Team1Score,
		arg.Team1Player1,
		arg.Team1Player2,
		arg.Team2Score,
		arg.Team2Player1,
		arg.Team2Player2,
	)
	return err
}
