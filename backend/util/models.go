package util

import (
	"encoding/json"
	"time"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	ImageUrl  *string    `json:"image_url"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
}

type UserProfile struct {
	ID            uuid.UUID  `json:"id"`
	Name          string     `json:"name"`
	Email         string     `json:"email"`
	ImageUrl      *string    `json:"image_url"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     *time.Time `json:"updated_at"`
	TotalFriends  int64      `json:"total_friends"`
	MatchesPlayed int64      `json:"total_matches"`
}

type Player struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	ImageUrl *string   `json:"image_url"`
	Email    string    `json:"email"`
}

type Match struct {
	ID              uuid.UUID  `json:"id"`
	MatchDate       string     `json:"match_date"`
	DurationMinutes int32      `json:"duration_minutes"`
	CreatedBy       uuid.UUID  `json:"created_by"`
	Team1Score      int32      `json:"team1_score"`
	Team1Player1    uuid.UUID  `json:"team1_player1"`
	Team1Player2    *uuid.UUID `json:"team1_player2"`
	Team2Score      int32      `json:"team2_score"`
	Team2Player1    *uuid.UUID `json:"team2_player1"`
	Team2Player2    *uuid.UUID `json:"team2_player2"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       *time.Time `json:"updated_at"`
}

type MatchByIdRow struct {
	ID              uuid.UUID  `json:"id"`
	MatchDate       string     `json:"match_date"`
	DurationMinutes int32      `json:"duration_minutes"`
	CreatedBy       Player     `json:"created_by"`
	Team1Score      int32      `json:"team1_score"`
	Team1Player1    Player     `json:"team1_player1"`
	Team1Player2    *Player    `json:"team1_player2"`
	Team2Score      int32      `json:"team2_score"`
	Team2Player1    *Player    `json:"team2_player1"`
	Team2Player2    *Player    `json:"team2_player2"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       *time.Time `json:"updated_at"`
}

type Friendship struct {
	ID         uuid.UUID  `json:"id"`
	Member1ID  uuid.UUID  `json:"member1_id"`
	Member2ID  uuid.UUID  `json:"member2_id"`
	Status     string     `json:"status"`
	AcceptedOn *time.Time `json:"accepted_on"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  *time.Time `json:"updated_at"`
}

type FriendRequest struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	ImageUrl     *string   `json:"image_url"`
	FriendshipID uuid.UUID `json:"friendship_id"`
	RequestedBy  uuid.UUID `json:"requested_by"`
	RequestedOn  time.Time `json:"requested_on"`
}

func DatabaseUserToUser(dbUser database.User) User {
	var imageUrl *string
	var updatedAt *time.Time

	if dbUser.ImageUrl.Valid {
		url := dbUser.ImageUrl.String
		imageUrl = &url
	}

	if dbUser.UpdatedAt.Valid {
		date := dbUser.UpdatedAt.Time
		updatedAt = &date
	}

	return User{
		ID:        dbUser.ID,
		Name:      dbUser.Name,
		Email:     dbUser.Email,
		ImageUrl:  imageUrl,
		CreatedAt: dbUser.CreatedAt,
		UpdatedAt: updatedAt,
	}
}

func DatabaseUsersToUsers(dbUsers []database.User) []User {
	users := []User{}
	for _, dbUser := range dbUsers {
		users = append(users, DatabaseUserToUser(dbUser))
	}

	return users
}

func DatabaseUserProfileToUserProfile(dbUser database.GetUserProfileByIdRow) UserProfile {
	var imageUrl *string
	var updatedAt *time.Time

	if dbUser.ImageUrl.Valid {
		url := dbUser.ImageUrl.String
		imageUrl = &url
	}

	if dbUser.UpdatedAt.Valid {
		date := dbUser.UpdatedAt.Time
		updatedAt = &date
	}

	return UserProfile{
		ID:            dbUser.ID,
		Name:          dbUser.Name,
		Email:         dbUser.Email,
		ImageUrl:      imageUrl,
		CreatedAt:     dbUser.CreatedAt,
		UpdatedAt:     updatedAt,
		TotalFriends:  dbUser.TotalFriends,
		MatchesPlayed: dbUser.MatchesPlayed,
	}
}

func getPlayerFromJson(playerJson []byte) Player {
	var player Player
	err := json.Unmarshal(playerJson, &player)
	if err != nil {
		panic(err)
	}

	return player
}

func DatabaseMatchToMatch(dbMatch database.Match) Match {
	var team1Player2 *uuid.UUID
	var team2Player1 *uuid.UUID
	var team2Player2 *uuid.UUID
	var updatedAt *time.Time

	if dbMatch.Team1Player2.Valid {
		t1p2 := dbMatch.Team1Player2.UUID
		team1Player2 = &t1p2
	}

	if dbMatch.Team2Player1.Valid {
		t2p1 := dbMatch.Team2Player1.UUID
		team2Player1 = &t2p1
	}

	if dbMatch.Team2Player2.Valid {
		t2p2 := dbMatch.Team2Player2.UUID
		team2Player2 = &t2p2
	}

	if dbMatch.UpdatedAt.Valid {
		date := dbMatch.UpdatedAt.Time
		updatedAt = &date
	}

	return Match{
		ID:              dbMatch.ID,
		MatchDate:       dbMatch.MatchDate.Format(time.RFC3339),
		DurationMinutes: dbMatch.DurationMinutes,
		CreatedBy:       dbMatch.CreatedBy,
		Team1Score:      dbMatch.Team1Score,
		Team1Player1:    dbMatch.Team1Player1,
		Team1Player2:    team1Player2,
		Team2Score:      dbMatch.Team2Score,
		Team2Player1:    team2Player1,
		Team2Player2:    team2Player2,
		CreatedAt:       dbMatch.CreatedAt,
		UpdatedAt:       updatedAt,
	}
}

func DatabaseMatchesToMatches(dbMatches []database.Match) []Match {
	matches := []Match{}

	for _, dbMatch := range dbMatches {
		matches = append(matches, DatabaseMatchToMatch(dbMatch))
	}

	return matches
}

func DatabaseMatchByIdRowToMatch(dbMatch database.GetMatchByIdRow) MatchByIdRow {
	var team1Player2 *Player
	var team2Player1 *Player
	var team2Player2 *Player
	var updatedAt *time.Time

	team1Player1 := getPlayerFromJson(dbMatch.Team1Player1_2)
	if dbMatch.Team1Player2.Valid {
		player2 := getPlayerFromJson(dbMatch.Team1Player2_2)
		team1Player2 = &player2
	}

	if dbMatch.Team2Player1.Valid {
		player1 := getPlayerFromJson(dbMatch.Team2Player1_2)
		team2Player1 = &player1
	}

	if dbMatch.Team2Player2.Valid {
		player2 := getPlayerFromJson(dbMatch.Team2Player2_2)
		team2Player2 = &player2
	}

	if dbMatch.UpdatedAt.Valid {
		date := dbMatch.UpdatedAt.Time
		updatedAt = &date
	}

	createdByPlayer := getPlayerFromJson(dbMatch.CreatedBy_2)

	return MatchByIdRow{
		ID:              dbMatch.ID,
		MatchDate:       dbMatch.MatchDate.Format(time.RFC3339),
		DurationMinutes: dbMatch.DurationMinutes,
		CreatedBy:       createdByPlayer,
		Team1Score:      dbMatch.Team1Score,
		Team1Player1:    team1Player1,
		Team1Player2:    team1Player2,
		Team2Score:      dbMatch.Team2Score,
		Team2Player1:    team2Player1,
		Team2Player2:    team2Player2,
		CreatedAt:       dbMatch.CreatedAt,
		UpdatedAt:       updatedAt,
	}
}

func DatabaseMatchForUserRowsToMatches(dbMatches []database.GetMatchesForUserIdRow) []MatchByIdRow {
	matches := []MatchByIdRow{}

	for _, dbMatch := range dbMatches {
		matches = append(matches, DatabaseMatchByIdRowToMatch(database.GetMatchByIdRow{
			ID:              dbMatch.ID,
			MatchDate:       dbMatch.MatchDate,
			DurationMinutes: dbMatch.DurationMinutes,
			CreatedBy:       dbMatch.CreatedBy,
			Team1Score:      dbMatch.Team1Score,
			Team1Player1:    dbMatch.Team1Player1,
			Team1Player2:    dbMatch.Team1Player2,
			Team2Score:      dbMatch.Team2Score,
			Team2Player1:    dbMatch.Team2Player1,
			Team2Player2:    dbMatch.Team2Player2,
			CreatedAt:       dbMatch.CreatedAt,
			UpdatedAt:       dbMatch.UpdatedAt,
			Team1Player1_2:  []byte(dbMatch.Team1Player1_2),
			Team1Player2_2:  []byte(dbMatch.Team1Player2_2),
			Team2Player1_2:  []byte(dbMatch.Team2Player1_2),
			Team2Player2_2:  []byte(dbMatch.Team2Player2_2),
			CreatedBy_2:     []byte(dbMatch.CreatedBy_2),
		}))
	}

	return matches
}

func DatabaseRecentMatchesForUserIdRowToMatches(dbMatches []database.GetRecentMatchesForUserIdRow) []MatchByIdRow {
	matches := []MatchByIdRow{}

	for _, dbMatch := range dbMatches {
		matches = append(matches, DatabaseMatchByIdRowToMatch(database.GetMatchByIdRow{
			ID:              dbMatch.ID,
			MatchDate:       dbMatch.MatchDate,
			DurationMinutes: dbMatch.DurationMinutes,
			CreatedBy:       dbMatch.CreatedBy,
			Team1Score:      dbMatch.Team1Score,
			Team1Player1:    dbMatch.Team1Player1,
			Team1Player2:    dbMatch.Team1Player2,
			Team2Score:      dbMatch.Team2Score,
			Team2Player1:    dbMatch.Team2Player1,
			Team2Player2:    dbMatch.Team2Player2,
			CreatedAt:       dbMatch.CreatedAt,
			UpdatedAt:       dbMatch.UpdatedAt,
			Team1Player1_2:  []byte(dbMatch.Team1Player1_2),
			Team1Player2_2:  []byte(dbMatch.Team1Player2_2),
			Team2Player1_2:  []byte(dbMatch.Team2Player1_2),
			Team2Player2_2:  []byte(dbMatch.Team2Player2_2),
			CreatedBy_2:     []byte(dbMatch.CreatedBy_2),
		}))
	}

	return matches
}

func DatabaseFriendshipToFriendship(dbFriendship database.Friendship) Friendship {
	var acceptedOn *time.Time
	var updatedAt *time.Time

	if dbFriendship.AcceptedOn.Valid {
		date := dbFriendship.AcceptedOn.Time
		acceptedOn = &date
	}

	if dbFriendship.UpdatedAt.Valid {
		date := dbFriendship.UpdatedAt.Time
		updatedAt = &date
	}

	return Friendship{
		ID:         dbFriendship.ID,
		Member1ID:  dbFriendship.Member1ID,
		Member2ID:  dbFriendship.Member2ID,
		Status:     dbFriendship.Status,
		AcceptedOn: acceptedOn,
		CreatedAt:  dbFriendship.CreatedAt,
		UpdatedAt:  updatedAt,
	}
}

func DatabaseFriendshipsToFriendships(dbFriendships []database.Friendship) []Friendship {
	friendships := []Friendship{}

	for _, dbFriendship := range dbFriendships {
		friendships = append(friendships, DatabaseFriendshipToFriendship(dbFriendship))
	}

	return friendships
}

type Friend struct {
	ID            uuid.UUID  `json:"id"`
	Name          string     `json:"name"`
	Email         string     `json:"email"`
	ImageUrl      *string    `json:"image_url"`
	CreatedAt     time.Time  `json:"created_at"`
	FriendsSince  *time.Time `json:"friends_since"`
	TotalFriends  int64      `json:"total_friends"`
	MatchesPlayed int64      `json:"total_matches"`
	FrienshipID   uuid.UUID  `json:"friendship_id"`
}

func DatabaseFriendsToFriends(dbFriends []database.GetFriendsRow) []Friend {
	friends := []Friend{}

	for _, dbFriendship := range dbFriends {
		var imageUrl *string
		var friendsSince *time.Time

		if dbFriendship.ImageUrl.Valid {
			url := dbFriendship.ImageUrl.String
			imageUrl = &url
		}

		if dbFriendship.FriendsSince.Valid {
			date := dbFriendship.FriendsSince.Time
			friendsSince = &date
		}

		friends = append(friends, Friend{
			ID:            dbFriendship.ID,
			Name:          dbFriendship.Name,
			Email:         dbFriendship.Email,
			ImageUrl:      imageUrl,
			CreatedAt:     dbFriendship.CreatedAt,
			FriendsSince:  friendsSince,
			TotalFriends:  dbFriendship.TotalFriends,
			MatchesPlayed: dbFriendship.MatchesPlayed,
			FrienshipID:   dbFriendship.FriendshipID,
		})
	}

	return friends
}

func DatabaseFriendRequestToFriendRequest(dbFriendRequest database.GetFriendRequestsRow) FriendRequest {
	var imageUrl *string

	if dbFriendRequest.ImageUrl.Valid {
		url := dbFriendRequest.ImageUrl.String
		imageUrl = &url
	}

	return FriendRequest{
		ID:           dbFriendRequest.ID,
		Name:         dbFriendRequest.Name,
		Email:        dbFriendRequest.Email,
		ImageUrl:     imageUrl,
		FriendshipID: dbFriendRequest.FriendshipID,
		RequestedBy:  dbFriendRequest.RequestedBy,
		RequestedOn:  dbFriendRequest.RequestedOn,
	}
}

func DatabaseFriendRequestsToFriendRequests(dbFriendRequests []database.GetFriendRequestsRow) []FriendRequest {
	friendRequests := []FriendRequest{}

	for _, dbFriendRequest := range dbFriendRequests {
		friendRequests = append(friendRequests, DatabaseFriendRequestToFriendRequest(dbFriendRequest))
	}

	return friendRequests
}

func DatabaseSentFriendRequestsToSentFriendRequests(dbFriendRequests []database.GetSentFriendRequestsRow) []FriendRequest {
	friendRequests := []FriendRequest{}

	for _, dbFriendRequest := range dbFriendRequests {
		friendRequests = append(friendRequests, DatabaseFriendRequestToFriendRequest(database.GetFriendRequestsRow(dbFriendRequest)))
	}

	return friendRequests
}

type MatchesByMonth struct {
	Month   time.Time `json:"month"`
	Matches int64     `json:"matches"`
}

type LeaderboardRow struct {
	ID            uuid.UUID `json:"id"`
	ImageUrl      *string   `json:"image_url"`
	Rank          int64     `json:"rank"`
	Name          string    `json:"name"`
	Matches       int64     `json:"matches"`
	Wins          int64     `json:"wins"`
	Losses        int64     `json:"losses"`
	WinPercentage float64   `json:"win_percentage"`
}

type Stats struct {
	TotalMatches   int64            `json:"total_matches"`
	MatchesByMonth []MatchesByMonth `json:"matches_by_month"`
	Leaderboard    []LeaderboardRow `json:"leaderboard"`
}

func DatabaseStatsToStats(dbTotalMatches int64, dbMatchesByMonth []database.GetMatchesByMonthRow, dbLeaderboard []database.GetLeaderboardRow) Stats {
	stats := Stats{}

	matchesByMonth := []MatchesByMonth{}
	for _, dbMatchByMonth := range dbMatchesByMonth {
		matchesByMonth = append(matchesByMonth, MatchesByMonth{
			Month:   dbMatchByMonth.Month,
			Matches: dbMatchByMonth.MatchesPlayed,
		})
	}

	leaderboard := []LeaderboardRow{}
	var rank int64 = 1
	for _, dbLeaderboard := range dbLeaderboard {
		var imageUrl *string

		if dbLeaderboard.ImageUrl.Valid {
			url := dbLeaderboard.ImageUrl.String
			imageUrl = &url
		}

		leaderboard = append(leaderboard, LeaderboardRow{
			ID:            dbLeaderboard.ID,
			ImageUrl:      imageUrl,
			Rank:          rank,
			Name:          dbLeaderboard.Name,
			Matches:       dbLeaderboard.Wins + dbLeaderboard.Losses,
			Wins:          dbLeaderboard.Wins,
			Losses:        dbLeaderboard.Losses,
			WinPercentage: dbLeaderboard.WinLoseRatio,
		})
		rank++
	}

	stats = Stats{
		TotalMatches:   dbTotalMatches,
		MatchesByMonth: matchesByMonth,
		Leaderboard:    leaderboard,
	}

	return stats
}
