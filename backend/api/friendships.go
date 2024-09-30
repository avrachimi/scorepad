package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/avrachimi/scorepad/backend/util"
	"github.com/google/uuid"
)

type Friendship struct {
	DB *database.Queries
}

func (f *Friendship) GetAll(w http.ResponseWriter, r *http.Request, user database.User) {

	friends, err := f.DB.GetFriends(r.Context(), user.ID)
	if err != nil {
		responseWithError(w, 500, "Failed to get friends")
		return
	}

	responseWithJSON(w, 200, util.DatabaseFriendsToFriends(friends))
}

func (f *Friendship) SendFriendRequest(w http.ResponseWriter, r *http.Request, user database.User) {

	friendRequest, err := f.DB.SendFriendRequest(r.Context(), database.SendFriendRequestParams{
		ID:        uuid.New(),
		Member1ID: user.ID,
		Member2ID: uuid.MustParse("80d60220-b829-4d7e-ae1d-22bc4a57b301"),
	})
	if err != nil {
		responseWithError(w, 500, "Failed to send friend request")
		return
	}

	prettyJson, _ := json.MarshalIndent(friendRequest, "", "    ")
	fmt.Println(string(prettyJson))

	responseWithJSON(w, 200, "Friend request sent")
}
