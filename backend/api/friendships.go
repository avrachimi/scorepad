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
	var excludeList []uuid.UUID
	var searchParam string
	for k, v := range r.URL.Query() {
		if k == "exclude[]" {
			for _, s := range v {
				parsedUUID, err := uuid.Parse(s)
				if err == nil {
					excludeList = append(excludeList, parsedUUID)
				} else {
					fmt.Printf("Invalid UUID in exclude parameter: %s", s)
					// responseWithError(w, http.StatusBadRequest, "Invalid UUID in exclude parameter")
					return
				}
			}
		} else if k == "search" {
			searchParam = v[0]

		}
	}

	if len(excludeList) > 0 {
		fmt.Printf("Excluding: %v\n", excludeList)
	} else {
		fmt.Println("Not excluding any users")
	}

	friends, err := f.DB.GetFriends(r.Context(), database.GetFriendsParams{
		UserID:      user.ID,
		ExcludedIds: excludeList,
		SearchQuery: searchParam,
	})
	if err != nil {
		fmt.Printf("Failed to get friends: %v\n", err)
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
	firstUserId, secondUserId := user.ID, params.UserId
	if user.ID.String() > params.UserId.String() {
		firstUserId, secondUserId = params.UserId, user.ID
	}

	friendRequest, err := f.DB.SendFriendRequest(r.Context(), database.SendFriendRequestParams{
		ID:          uuid.New(),
		Member1ID:   firstUserId,
		Member2ID:   secondUserId,
		RequestedBy: user.ID,
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

	err = f.DB.AcceptFriendRequest(r.Context(), database.AcceptFriendRequestParams{
		ID:     id,
		UserID: user.ID,
	})
	if err != nil {
		responseWithError(w, 500, "Failed to accept friend request")
		return
	}

	responseWithJSON(w, 200, map[string]string{"message": "Friend request accepted"})
}

func (f *Friendship) DeleteFriendship(w http.ResponseWriter, r *http.Request, user database.User) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		responseWithError(w, 400, fmt.Sprintf("Error parsing friendship ID: %v", err))
		return
	}

	err = f.DB.DeleteFriendship(r.Context(), database.DeleteFriendshipParams{
		ID:     id,
		UserID: user.ID,
	})
	if err != nil {
		responseWithError(w, 500, "Failed to delete friendship")
		return
	}

	responseWithJSON(w, 200, map[string]string{"message": "Friendship deleted"})
}
