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

type Friendship struct {
	DB *database.Queries
}

func (f *Friendship) GetAllFriends(w http.ResponseWriter, r *http.Request, user database.User) {
	friends, err := f.DB.GetFriends(r.Context(), user.ID)
	if err != nil {
		responseWithError(w, 500, "Failed to get friends")
		return
	}

	responseWithJSON(w, 200, util.DatabaseFriendsToFriends(friends))
}

func (f *Friendship) SendFriendRequest(w http.ResponseWriter, r *http.Request, user database.User) {
	type parameters struct {
		UserId uuid.UUID `json:"user_id"`
	}

	decoder := json.NewDecoder(r.Body)

	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		responseWithError(w, 400, fmt.Sprint("Error parsing JSON:", err))
		return
	}

	if params.UserId == user.ID {
		responseWithError(w, 400, "You can't send a friend request to yourself")
		return
	}

	// member1 should be less than member2
	if user.ID.String() > params.UserId.String() {
		user.ID, params.UserId = params.UserId, user.ID
	}

	friendRequest, err := f.DB.SendFriendRequest(r.Context(), database.SendFriendRequestParams{
		ID:        uuid.New(),
		Member1ID: user.ID,
		Member2ID: params.UserId,
	})
	if err != nil {
		responseWithError(w, 500, "Failed to send friend request")
		return
	}

	responseWithJSON(w, 200, friendRequest)
}

func (f *Friendship) GetFriendRequests(w http.ResponseWriter, r *http.Request, user database.User) {
	friendRequests, err := f.DB.GetFriendRequests(r.Context(), user.ID)
	if err != nil {
		responseWithError(w, 500, "Failed to get friend requests")
		return
	}

	responseWithJSON(w, 200, util.DatabaseFriendRequestsToFriendRequests(friendRequests))
}

func (f *Friendship) AcceptFriendRequest(w http.ResponseWriter, r *http.Request, user database.User) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing friend request ID: %v", err))
		return
	}

	err = f.DB.AcceptFriendRequest(r.Context(), id)
	if err != nil {
		responseWithError(w, 500, "Failed to accept friend request")
		return
	}

	responseWithJSON(w, 200, map[string]string{"message": "Friend request accepted"})
}

func (f *Friendship) DeleteFriendRequest(w http.ResponseWriter, r *http.Request, user database.User) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing friend request ID: %v", err))
		return
	}

	err = f.DB.DeleteFriendRequest(r.Context(), database.DeleteFriendRequestParams{
		ID:     id,
		UserID: user.ID,
	})
	if err != nil {
		responseWithError(w, 500, "Failed to delete friend request")
		return
	}

	responseWithJSON(w, 200, map[string]string{"message": "Friend request deleted"})
}
