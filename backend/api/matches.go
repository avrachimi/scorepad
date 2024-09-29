package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Match struct {
	DB *database.Queries
}

func (m *Match) Create(w http.ResponseWriter, r *http.Request) {
	// TODO: change to the logged user ID
	id, err := uuid.Parse("80d60220-b829-4d7e-ae1d-22bc4a57b301")
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	match, err := m.DB.CreateMatch(r.Context(), database.CreateMatchParams{
		ID:              uuid.New(),
		MatchDate:       time.Now().UTC(),
		DurationMinutes: 30,
		CreatedBy:       id,
		Team1Score:      3,
		Team1Player1:    id,
		Team1Player2:    id,
		Team2Score:      6,
		Team2Player1:    id,
		Team2Player2:    id,
	})

	if err != nil {
		responseWithError(w, 500, "Failed to create match")
		return
	}

	responseWithJSON(w, 201, match)
}

func (m *Match) GetAll(w http.ResponseWriter, r *http.Request) {
	// TODO: change to the logged user ID
	id, err := uuid.Parse("80d60220-b829-4d7e-ae1d-22bc4a57b301")
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	matches, err := m.DB.GetMatchesForUserId(r.Context(), id)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting matches: %v", err))
		return
	}

	responseWithJSON(w, 200, matches)
}

func (m *Match) GetById(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	// TODO: maybe worth checking if the user is allowed to see this match
	match, err := m.DB.GetMatchById(r.Context(), id)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting match: %v", err))
		return
	}

	responseWithJSON(w, 200, match)
}
