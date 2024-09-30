package api

import (
	"fmt"
	"net/http"

	"github.com/avrachimi/scorepad/backend/auth"
	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/avrachimi/scorepad/backend/util"
)

type authedHandler func(http.ResponseWriter, *http.Request, database.User)

func (api *API) MiddlewareAuth(handler authedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenStr, err := auth.GetJWT(r.Header)
		if err != nil {
			responseWithError(w, 403, fmt.Sprintf("Auth error: %v", err))
			return
		}

		claims, err := util.VerifyToken(tokenStr)
		if err != nil {
			responseWithError(w, 403, fmt.Sprintf("Auth error: %v", err))
			return
		}

		user, err := api.User.DB.GetUserById(r.Context(), claims.ID)
		if err != nil {
			responseWithError(w, 400, fmt.Sprintf("Couldn't get user: %v", err))
			return
		}

		handler(w, r, user)
	}
}
