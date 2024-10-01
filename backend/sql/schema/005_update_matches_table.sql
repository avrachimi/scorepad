-- +goose Up
ALTER TABLE matches
ADD CONSTRAINT unique_match_players UNIQUE (
  team1_player1,
  team1_player2,
  team2_player1,
  team2_player2
);

-- +goose Down
ALTER TABLE matches
DROP CONSTRAINT unique_match_players;
