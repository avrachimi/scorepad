package api

import (
	"fmt"
	"net/http"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type User struct {
	DB *database.Queries
}

func (u *User) GetAll(w http.ResponseWriter, r *http.Request) {
	// TODO: Update query to retrieve all users excluding friends
	responseWithJSON(w, 200, "All users")
}

func (u *User) Create(w http.ResponseWriter, r *http.Request) {
	user, err := u.DB.CreateUser(r.Context(), database.CreateUserParams{
		ID:    uuid.New(),
		Name:  "John Doe",
		Email: "test@test.com",
	})
	if err != nil {
		responseWithError(w, 500, "Failed to create user")
		return
	}

	responseWithJSON(w, 201, user)
}

func (u *User) Delete(w http.ResponseWriter, r *http.Request) {
	// TODO: Either, 1. only admins or 2. the user themselves should be able to delete their account
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	err = u.DB.DeleteUser(r.Context(), id)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error deleting user: %v", err))
		return
	}

	responseWithJSON(w, 204, struct{}{})
}

func (u *User) GetProfile(w http.ResponseWriter, r *http.Request) {
	user, err := u.DB.GetUserProfileById(r.Context(), uuid.New()) // TODO: change uuid.New() to the logged user ID
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting user profile: %v", err))
		return
	}

	responseWithJSON(w, 200, user)
}

func (u *User) GetProfileById(w http.ResponseWriter, r *http.Request) {
	// TODO: Profile should return more data than just the user object
	// NOTE: this endpoint might not be needed??
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing user ID: %v", err))
		return
	}

	user, err := u.DB.GetUserProfileById(r.Context(), id)
	if err != nil {
		responseWithError(w, 500, fmt.Sprintf("Error getting user profile: %v", err))
		return
	}

	responseWithJSON(w, 200, user)
}
