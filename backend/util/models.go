package util

import (
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

type Friendship struct {
	ID         uuid.UUID  `json:"id"`
	Member1ID  uuid.UUID  `json:"member1_id"`
	Member2ID  uuid.UUID  `json:"member2_id"`
	Status     string     `json:"status"`
	AcceptedOn *time.Time `json:"accepted_on"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  *time.Time `json:"updated_at"`
}

func DatabaseUserToUser(dbUser database.User) User {
	var imageUrl *string
	var updatedAt *time.Time

	if dbUser.ImageUrl.Valid {
		imageUrl = &dbUser.ImageUrl.String
	}

	if dbUser.UpdatedAt.Valid {
		updatedAt = &dbUser.UpdatedAt.Time
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

func DatabaseMatchToMatch(dbMatch database.Match) Match {
	var team1Player2 *uuid.UUID
	var team2Player1 *uuid.UUID
	var team2Player2 *uuid.UUID
	var updatedAt *time.Time

	if dbMatch.Team1Player2.Valid {
		team1Player2 = &dbMatch.Team1Player2.UUID
	}

	if dbMatch.Team2Player1.Valid {
		team2Player1 = &dbMatch.Team2Player1.UUID
	}

	if dbMatch.Team2Player2.Valid {
		team2Player2 = &dbMatch.Team2Player2.UUID
	}

	if dbMatch.UpdatedAt.Valid {
		updatedAt = &dbMatch.UpdatedAt.Time
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

func DatabaseFriendshipToFriendship(dbFriendship database.Friendship) Friendship {
	var acceptedOn *time.Time
	var updatedAt *time.Time

	if dbFriendship.AcceptedOn.Valid {
		acceptedOn = &dbFriendship.AcceptedOn.Time
	}

	if dbFriendship.UpdatedAt.Valid {
		updatedAt = &dbFriendship.UpdatedAt.Time
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
