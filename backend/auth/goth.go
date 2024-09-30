package auth

import (
	"database/sql"
	"encoding/json"
	"errors"
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
	// NOTE: commented out for now, need db access
	// if gothUser, err := gothic.CompleteUserAuth(w, r); err == nil {
	// response, err := createUserTokens(r, db, gothUser)
	// if err != nil {
	// 	http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
	// }
	//
	// w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(response)
	// return
	// } else {
	// }

	gothic.BeginAuthHandler(w, r)
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

	response, err := createUserTokens(r, db, user)
	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return
}

func createUserTokens(r *http.Request, db *database.Queries, user goth.User) (map[string]string, error) {

	dbUser, err := db.GetUserByEmail(r.Context(), user.Email)
	if err != nil {
		imageUrl := sql.NullString{String: "", Valid: false}
		if user.AvatarURL != "" {
			imageUrl = sql.NullString{String: user.AvatarURL, Valid: true}
		}

		if user.Name == "" {
			return nil, errors.New("Name is required")
		}

		if user.Email == "" {
			return nil, errors.New("Email is required")
		}

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
		return nil, err
	}

	refreshToken, refreshTokenClaims, err := util.CreateToken(dbUser.ID, dbUser.Email, refreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	db.CreateRefreshToken(r.Context(), database.CreateRefreshTokenParams{
		ID:        uuid.MustParse(refreshTokenClaims.RegisteredClaims.ID),
		Token:     refreshToken,
		UserID:    dbUser.ID,
		ExpiresAt: time.Now().Add(refreshTokenExpiry),
	})

	response := map[string]string{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	}

	return response, nil
}

func RefreshToken(w http.ResponseWriter, r *http.Request, db *database.Queries) {
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
		db.DeleteRefreshToken(r.Context(), uuid.MustParse(refreshClaims.RegisteredClaims.ID))
		return
	}

	dbToken, err := db.GetRefreshTokenById(r.Context(), uuid.MustParse(refreshClaims.RegisteredClaims.ID))
	if err != nil {
		http.Error(w, "Failed to get refresh token", http.StatusInternalServerError)
		return
	}

	if dbToken.Token != refreshToken {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
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
