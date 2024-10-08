-- +goose Up
ALTER TABLE friendships
ADD COLUMN requested_by UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE;

-- +goose Down
ALTER TABLE friendships
DROP COLUMN requested_by;
