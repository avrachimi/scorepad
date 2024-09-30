package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/avrachimi/scorepad/backend/util"
	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

const (
	MaxAge = 86400 * 30
)

func SetupAuth() {
	store := sessions.NewCookieStore([]byte(os.Getenv("SESSION_SECRET")))
	store.MaxAge(MaxAge)
	store.Options.Path = "/"
	store.Options.HttpOnly = true
	store.Options.Secure = os.Getenv("ENV") == "production"

	gothic.Store = store

	goth.UseProviders(
		google.New(
			os.Getenv("GOOGLE_CLIENT_ID"),
			os.Getenv("GOOGLE_CLIENT_SECRET"),
			os.Getenv("HOST_URL")+"/auth/google/callback",
			"email", "profile",
		),
	)
}

func SignIn(w http.ResponseWriter, r *http.Request) {
	// try to get the user without re-authenticating
	if gothUser, err := gothic.CompleteUserAuth(w, r); err == nil {
		// TODO: setup JWT sessions
		// NOTE: should be a function so that it's called below as well
		fmt.Printf("User logged in: %v", gothUser)
	} else {
		gothic.BeginAuthHandler(w, r)
	}
}

func SignOut(w http.ResponseWriter, r *http.Request) {
	gothic.Logout(w, r)
	w.Header().Set("Location", "/")
	w.WriteHeader(http.StatusTemporaryRedirect)
}

func AuthCallback(w http.ResponseWriter, r *http.Request, db *database.Queries) {
	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	dbUser, err := db.GetUserByEmail(r.Context(), user.Email)
	// Create user account if it doesn't exist
	if err != nil {
		imageUrl := sql.NullString{String: "", Valid: false}
		if user.AvatarURL != "" {
			imageUrl = sql.NullString{String: user.AvatarURL, Valid: true}
		}

		// TODO: validate other fields like name, email, etc. before creating the user

		dbUser, err = db.CreateUser(r.Context(), database.CreateUserParams{
			ID:       uuid.New(),
			Name:     user.Name,
			Email:    user.Email,
			ImageUrl: imageUrl,
		})
	}

	const accessTokenExpiry = 15 * time.Minute     // 15 minutes
	const refreshTokenExpiry = 30 * 24 * time.Hour // 30 days

	accessToken, _, err := util.CreateToken(dbUser.ID, dbUser.Email, accessTokenExpiry)
	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	refreshToken, _, err := util.CreateToken(dbUser.ID, dbUser.Email, refreshTokenExpiry)
	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Return the tokens in the response (can also set them as cookies if needed)
	response := map[string]string{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	w.WriteHeader(http.StatusOK)

	// fmt.Printf("User logged in: %v", dbUser)
	// w.Header().Set("Location", "/")
	// w.WriteHeader(http.StatusTemporaryRedirect)
	return
}

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	refreshToken, err := GetJWT(r.Header)
	if err != nil {
		http.Error(w, "Missing or invalid token", http.StatusUnauthorized)
		return
	}

	refreshClaims, err := util.VerifyToken(refreshToken)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	if time.Unix(refreshClaims.ExpiresAt.Unix(), 0).Before(time.Now()) {
		http.Error(w, "Refresh token has expired", http.StatusUnauthorized)
		return
	}

	newAccessToken, _, err := util.CreateToken(refreshClaims.ID, refreshClaims.Email, time.Duration(15*time.Minute))
	if err != nil {
		http.Error(w, "Failed to generate new token", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"access_token": newAccessToken,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
