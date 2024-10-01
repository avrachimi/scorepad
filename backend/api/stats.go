package api

import (
	"fmt"
	"net/http"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/avrachimi/scorepad/backend/util"
)

type Stats struct {
	DB *database.Queries
}

func (s *Stats) GetStats(w http.ResponseWriter, r *http.Request, user database.User) {
	queryType := r.URL.Query().Get("type")

	totalMatches, err := s.DB.GetTotalMatchesPlayed(r.Context(), user.ID)
	if err != nil {
		fmt.Printf("Failed to get stats: %v\n", err)
		responseWithError(w, 500, "Failed to get stats")
		return
	}

	switch queryType {
	case "leaderboard":
		leaderboard, err := s.DB.GetLeaderboard(r.Context())
		if err != nil {
			fmt.Printf("Failed to get stats: %v\n", err)
			responseWithError(w, 500, "Failed to get stats")
			return
		}
		responseWithJSON(w, 200, util.DatabaseStatsToStats(0, nil, leaderboard))
	case "matches":

		matchesByMonth, err := s.DB.GetMatchesByMonth(r.Context(), user.ID)
		if err != nil {
			fmt.Printf("Failed to get stats: %v\n", err)
			responseWithError(w, 500, "Failed to get stats")
			return
		}
		responseWithJSON(w, 200, util.DatabaseStatsToStats(totalMatches, matchesByMonth, nil))
	default:
		matchesByMonth, err := s.DB.GetMatchesByMonth(r.Context(), user.ID)
		if err != nil {
			fmt.Printf("Failed to get stats: %v\n", err)
			responseWithError(w, 500, "Failed to get stats")
			return
		}

		leaderboard, err := s.DB.GetLeaderboard(r.Context())
		if err != nil {
			fmt.Printf("Failed to get stats: %v\n", err)
			responseWithError(w, 500, "Failed to get stats")
			return
		}

		responseWithJSON(w, 200, util.DatabaseStatsToStats(totalMatches, matchesByMonth, leaderboard))
	}

}
