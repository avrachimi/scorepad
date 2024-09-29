-- +goose Up
CREATE TABLE friendships (
    id UUID PRIMARY KEY,
    member1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'blocked')) NOT NULL,
    accepted_on TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL,
    UNIQUE (member1_id, member2_id)
);

-- +goose Down
DROP TABLE friendships;
