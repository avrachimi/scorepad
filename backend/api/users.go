package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/avrachimi/scorepad/backend/util"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type User struct {
	DB *database.Queries
}

func (u *User) GetAll(w http.ResponseWriter, r *http.Request, user database.User) {
	// FIX: should be admin only or just deleted
	users, err := u.DB.GetUsers(r.Context())
	if err != nil {
		responseWithError(w, 500, "Failed to get users")
		return
	}

	responseWithJSON(w, 200, util.DatabaseUsersToUsers(users))
}

func (u *User) Create(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	decoder := json.NewDecoder(r.Body)

	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		responseWithError(w, 400, fmt.Sprint("Error parsing JSON:", err))
		return
	}

	user, err := u.DB.CreateUser(r.Context(), database.CreateUserParams{
		ID:    uuid.New(),
		Name:  params.Name,
		Email: params.Email,
	})
	if err != nil {
		responseWithError(w, 500, "Failed to create user")
		return
	}

	responseWithJSON(w, 201, util.DatabaseUserToUser(user))
}

func (u *User) Delete(w http.ResponseWriter, r *http.Request, user database.User) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	if id != user.ID {
		responseWithError(w, 403, "You are not allowed to delete this user")
		return
	}

	err = u.DB.DeleteUser(r.Context(), id)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error deleting user: %v", err))
		return
	}

	responseWithJSON(w, 204, struct{}{})
}

func (u *User) GetProfile(w http.ResponseWriter, r *http.Request, user database.User) {
	dbUser, err := u.DB.GetUserProfileById(r.Context(), user.ID)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting user profile: %v", err))
		return
	}

	responseWithJSON(w, 200, util.DatabaseUserToUser(dbUser))
}

func (u *User) GetProfileById(w http.ResponseWriter, r *http.Request, user database.User) {
	// TODO: Profile should return more data than just the user object
	// NOTE: this endpoint might not be needed??
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	dbUser, err := u.DB.GetUserProfileById(r.Context(), id)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting user profile: %v", err))
		return
	}

	responseWithJSON(w, 200, util.DatabaseUserToUser(dbUser))
}
