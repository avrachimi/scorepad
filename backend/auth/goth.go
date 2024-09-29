package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

func SetupAuth() {
	goth.UseProviders(
		google.New(
			os.Getenv("GOOGLE_CLIENT_ID"),
			os.Getenv("GOOGLE_CLIENT_SECRET"),
			os.Getenv("HOST_URL")+"/auth/google/callback",
			"email", "profile",
		),
	)

	store := sessions.NewCookieStore([]byte(os.Getenv("SESSION_SECRET")))

	gothic.Store = store
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
	if err != nil {
		fmt.Println("User sign up")
		imageUrl := sql.NullString{String: "", Valid: false}
		if user.AvatarURL != "" {
			imageUrl = sql.NullString{String: user.AvatarURL, Valid: true}
		}

		// TODO: validate other fields like name, email, etc. before creating the user

		db.CreateUser(r.Context(), database.CreateUserParams{
			ID:       uuid.New(),
			Name:     user.Name,
			Email:    user.Email,
			ImageUrl: imageUrl,
		})

		w.Header().Set("Location", "/")
		w.WriteHeader(http.StatusTemporaryRedirect)
		return
	}

	// TODO: setup JWT sessions

	fmt.Printf("User logged in: %v", dbUser)
	w.Header().Set("Location", "/")
	w.WriteHeader(http.StatusTemporaryRedirect)
	return
}
