package api

import (
	"net/http"

	"github.com/avrachimi/scorepad/backend/internal/database"
)

type Friend struct {
	DB *database.Queries
}

func (f *Friend) GetAll(w http.ResponseWriter, r *http.Request) {
	responseWithJSON(w, 200, "All friends")
}
