package api

import "github.com/avrachimi/scorepad/backend/auth"

type API struct {
	User       User
	Friendship Friendship
	Match      Match
	Auth       auth.Auth
	Stats      Stats
}
