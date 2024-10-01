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
	err := decoder.Decode(&params)
	if err != nil {
		responseWithError(w, 400, fmt.Sprint("Error parsing JSON:", err))
		return
	}

	match, err := m.DB.CreateMatch(r.Context(), database.CreateMatchParams{
		ID:              uuid.New(),
		MatchDate:       params.MatchDate,
		DurationMinutes: params.DurationMinutes,
		CreatedBy:       user.ID,
		Team1Score:      params.Team1Score,
		Team1Player1:    params.Team1Player1,
		Team1Player2:    params.Team1Player2,
		Team2Score:      params.Team2Score,
		Team2Player1:    params.Team2Player1,
		Team2Player2:    params.Team2Player2,
	})

	if err != nil {
		responseWithError(w, 500, "Failed to create match")
		return
	}

	responseWithJSON(w, 201, util.DatabaseMatchToMatch(match))
}

func (m *Match) GetAll(w http.ResponseWriter, r *http.Request, user database.User) {
	matches, err := m.DB.GetMatchesForUserId(r.Context(), user.ID)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting matches: %v", err))
		return
	}

	responseWithJSON(w, 200, util.DatabaseMatchForUserRowsToMatches(matches))
}

func (m *Match) GetById(w http.ResponseWriter, r *http.Request, user database.User) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	match, err := m.DB.GetMatchById(r.Context(), id)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting match: %v", err))
		return
	}

	responseWithJSON(w, 200, util.DatabaseMatchByIdRowToMatch(match))
}

func (m *Match) Update(w http.ResponseWriter, r *http.Request, user database.User) {
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

func (m *Match) Delete(w http.ResponseWriter, r *http.Request, user database.User) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	err = m.DB.DeleteMatch(r.Context(), database.DeleteMatchParams{
		ID:     id,
		UserID: user.ID,
	})
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error deleting match: %v", err))
		return
	}

	responseWithJSON(w, 204, struct{}{})
}

func (m *Match) GetRecent(w http.ResponseWriter, r *http.Request, user database.User) {
	matches, err := m.DB.GetRecentMatchesForUserId(r.Context(), user.ID)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting matches: %v", err))
		return
	}

	responseWithJSON(w, 200, util.DatabaseRecentMatchesForUserIdRowToMatches(matches))
}
