package api

import (
	"fmt"
	"net/http"

	"github.com/avrachimi/scorepad/backend/auth"
	"github.com/avrachimi/scorepad/backend/internal/database"
)

type authedHandler func(http.ResponseWriter, *http.Request, database.User)

func (api *API) MiddlewareAuth(handler authedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := auth.GetJWT(r.Header)
		if err != nil {
			responseWithError(w, 403, fmt.Sprintf("Auth error: %v", err))
			return
		}

		// FIX: hardcoded for testing.
		// TODO: implement auth
		if token != "secret" {
			responseWithError(w, 403, "Auth error: invalid token")
			return
		}

		user, err := api.User.DB.GetUserByEmail(r.Context(), "avrachimi@hotmail.com")
		if err != nil {
			responseWithError(w, 400, fmt.Sprintf("Couldn't get user: %v", err))
			return
		}

		handler(w, r, user)
	}
}
