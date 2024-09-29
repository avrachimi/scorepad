package api

import (
	"net/http"

	"github.com/avrachimi/scorepad/backend/internal/database"
)

type Friendship struct {
	DB *database.Queries
}

func (f *Friendship) GetAll(w http.ResponseWriter, r *http.Request) {
	responseWithJSON(w, 200, "All friends")
}
