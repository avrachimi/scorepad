-- name: GetTotalMatchesPlayed :one
SELECT
  COUNT(DISTINCT m.id) AS total_matches_played
FROM
  matches m
WHERE
  m.team1_player1 = $1
  OR m.team1_player2 = $1
  OR m.team2_player1 = $1
  OR m.team2_player2 = $1;

-- name: GetMatchesByMonth :many
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
  month ASC;

-- name: GetLeaderboard :many
SELECT
  u.id,
  u.name,
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
  LEFT JOIN matches m ON m.team1_player1 = u.id
  OR m.team1_player2 = u.id
  OR m.team2_player1 = u.id
  OR m.team2_player2 = u.id
GROUP BY
  u.id
ORDER BY
  win_lose_ratio DESC;
