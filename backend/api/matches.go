package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/avrachimi/scorepad/backend/util"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Match struct {
	DB *database.Queries
}

func (m *Match) Create(w http.ResponseWriter, r *http.Request, user database.User) {
	// TODO: change to the logged user ID
	parsedId, err := uuid.Parse("80d60220-b829-4d7e-ae1d-22bc4a57b301")
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}
	id := uuid.NullUUID{UUID: parsedId, Valid: true}

	match, err := m.DB.CreateMatch(r.Context(), database.CreateMatchParams{
		ID:              uuid.New(),
		MatchDate:       time.Now().UTC(),
		DurationMinutes: 30,
		CreatedBy:       parsedId, // TODO: fix this once we retrieve the proper data
		Team1Score:      3,
		Team1Player1:    parsedId,
		Team1Player2:    id,
		Team2Score:      6,
		Team2Player1:    uuid.NullUUID{Valid: false},
		Team2Player2:    id,
	})

	if err != nil {
		responseWithError(w, 500, "Failed to create match")
		return
	}

	responseWithJSON(w, 201, util.DatabaseMatchToMatch(match))
}

func (m *Match) GetAll(w http.ResponseWriter, r *http.Request, user database.User) {
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

	responseWithJSON(w, 200, util.DatabaseMatchesToMatches(matches))
}

func (m *Match) GetById(w http.ResponseWriter, r *http.Request, user database.User) {
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

	responseWithJSON(w, 200, util.DatabaseMatchToMatch(match))
}

func (m *Match) UpdateMatch(w http.ResponseWriter, r *http.Request, user database.User) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	type parameters struct {
		MatchDate       time.Time     `json:"match_date"`
		DurationMinutes int32         `json:"duration_minutes"`
		Team1Score      int32         `json:"team1_score"`
		Team1Player1    uuid.UUID     `json:"team1_player1"`
		Team1Player2    uuid.NullUUID `json:"team1_player2"`
		Team2Score      int32         `json:"team2_score"`
		Team2Player1    uuid.NullUUID `json:"team2_player1"`
		Team2Player2    uuid.NullUUID `json:"team2_player2"`
	}

	decoder := json.NewDecoder(r.Body)

	params := parameters{}
	err = decoder.Decode(&params)
	if err != nil {
		responseWithError(w, 400, fmt.Sprint("Error parsing JSON:", err))
		return
	}

	err = m.DB.UpdateMatch(r.Context(), database.UpdateMatchParams{
		ID:              id,
		MatchDate:       params.MatchDate,
		DurationMinutes: params.DurationMinutes,
		Team1Score:      params.Team1Score,
		Team1Player1:    params.Team1Player1,
		Team1Player2:    params.Team1Player2,
		Team2Score:      params.Team2Score,
		Team2Player1:    params.Team2Player1,
		Team2Player2:    params.Team2Player2,
	})
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error updating match: %v", err))
		return
	}

	responseWithJSON(w, 200, struct {
		Message string `json:"message"`
	}{Message: "Match updated successfully"})
}
