-- +goose Up
CREATE TABLE matches (
    id UUID PRIMARY KEY,
    match_date TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes >= 0),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team1_score INT NOT NULL CHECK (team1_score >= 0),
    team1_player1 UUID NOT NULL REFERENCES users(id),
    team1_player2 UUID NOT NULL REFERENCES users(id),
    team2_score INT NOT NULL CHECK (team2_score >= 0),
    team2_player1 UUID NOT NULL REFERENCES users(id),
    team2_player2 UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL
);

-- +goose Down
DROP TABLE matches;
