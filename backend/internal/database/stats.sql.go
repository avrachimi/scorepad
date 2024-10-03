// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0
// source: stats.sql

package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const getLeaderboard = `-- name: GetLeaderboard :many
SELECT
  u.id,
  u.name,
  u.image_url,
  COUNT(
    CASE
      WHEN (
        m.team1_player1 = u.id
        OR m.team1_player2 = u.id
      )
      AND m.team1_score > m.team2_score THEN 1
      WHEN (
        m.team2_player1 = u.id
        OR m.team2_player2 = u.id
      )
      AND m.team2_score > m.team1_score THEN 1
    END
  ) AS wins,
  COUNT(
    CASE
      WHEN (
        m.team1_player1 = u.id
        OR m.team1_player2 = u.id
      )
      AND m.team1_score < m.team2_score THEN 1
      WHEN (
        m.team2_player1 = u.id
        OR m.team2_player2 = u.id
      )
      AND m.team2_score < m.team1_score THEN 1
    END
  ) AS losses,
  CAST(
    CASE
      WHEN COUNT(
        CASE
          WHEN (
            m.team1_player1 = u.id
            OR m.team1_player2 = u.id
          )
          AND m.team1_score > m.team2_score THEN 1
          WHEN (
            m.team2_player1 = u.id
            OR m.team2_player2 = u.id
          )
          AND m.team2_score > m.team1_score THEN 1
        END
      ) = 0 THEN 0
      ELSE COUNT(
        CASE
          WHEN (
            m.team1_player1 = u.id
            OR m.team1_player2 = u.id
          )
          AND m.team1_score > m.team2_score THEN 1
          WHEN (
            m.team2_player1 = u.id
            OR m.team2_player2 = u.id
          )
          AND m.team2_score > m.team1_score THEN 1
        END
      )::float / COUNT(
        CASE
          WHEN (
            m.team1_player1 = u.id
            OR m.team1_player2 = u.id
          )
          AND m.team1_score < m.team2_score THEN 1
          WHEN (
            m.team2_player1 = u.id
            OR m.team2_player2 = u.id
          )
          AND m.team2_score < m.team1_score THEN 1
        END
      )
    END AS float
  ) AS win_lose_ratio
FROM
  users u
  LEFT JOIN matches m ON (
    m.team1_player1 = u.id
    OR m.team1_player2 = u.id
    OR m.team2_player1 = u.id
    OR m.team2_player2 = u.id
  )
WHERE
  u.id IN (
    SELECT
      CASE
        WHEN f.member1_id = $1::uuid THEN f.member2_id
        WHEN f.member2_id = $1::uuid THEN f.member1_id
      END
    FROM
      friendships f
    WHERE
      (
        f.member1_id = $1::uuid
        OR f.member2_id = $1::uuid
      )
      AND f.status = 'accepted'
  )
  OR u.id = $1::uuid
GROUP BY
  u.id
ORDER BY
  win_lose_ratio DESC
`

type GetLeaderboardRow struct {
	ID           uuid.UUID
	Name         string
	ImageUrl     sql.NullString
	Wins         int64
	Losses       int64
	WinLoseRatio float64
}

func (q *Queries) GetLeaderboard(ctx context.Context, userID uuid.UUID) ([]GetLeaderboardRow, error) {
	rows, err := q.db.QueryContext(ctx, getLeaderboard, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetLeaderboardRow
	for rows.Next() {
		var i GetLeaderboardRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.ImageUrl,
			&i.Wins,
			&i.Losses,
			&i.WinLoseRatio,
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

const getMatchesByMonth = `-- name: GetMatchesByMonth :many
SELECT
  CAST(DATE_TRUNC('month', m.match_date) AS timestamp) AS month,
  COUNT(m.id) AS matches_played
FROM
  matches m
WHERE
  m.match_date >= NOW() - INTERVAL '12 months'
  AND (
    m.team1_player1 = $1
    OR m.team1_player2 = $1
    OR m.team2_player1 = $1
    OR m.team2_player2 = $1
  )
GROUP BY
  month
ORDER BY
  month ASC
`

type GetMatchesByMonthRow struct {
	Month         time.Time
	MatchesPlayed int64
}

func (q *Queries) GetMatchesByMonth(ctx context.Context, team1Player1 uuid.UUID) ([]GetMatchesByMonthRow, error) {
	rows, err := q.db.QueryContext(ctx, getMatchesByMonth, team1Player1)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetMatchesByMonthRow
	for rows.Next() {
		var i GetMatchesByMonthRow
		if err := rows.Scan(&i.Month, &i.MatchesPlayed); err != nil {
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

const getTotalMatchesPlayed = `-- name: GetTotalMatchesPlayed :one
SELECT
  COUNT(DISTINCT m.id) AS total_matches_played
FROM
  matches m
WHERE
  m.team1_player1 = $1
  OR m.team1_player2 = $1
  OR m.team2_player1 = $1
  OR m.team2_player2 = $1
`

func (q *Queries) GetTotalMatchesPlayed(ctx context.Context, team1Player1 uuid.UUID) (int64, error) {
	row := q.db.QueryRowContext(ctx, getTotalMatchesPlayed, team1Player1)
	var total_matches_played int64
	err := row.Scan(&total_matches_played)
	return total_matches_played, err
}
