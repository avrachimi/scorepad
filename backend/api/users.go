package api

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Users struct{}

func (u Users) GetAll(w http.ResponseWriter, r *http.Request) {
	responseWithJSON(w, 200, "All users")
}

func (u Users) Create(w http.ResponseWriter, r *http.Request) {
	responseWithJSON(w, 201, "User created")
}

func (u Users) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	// id, err := uuid.Parse(idStr)

	fmt.Println(idStr)

	responseWithJSON(w, 204, struct{}{})
}

func (u Users) GetProfile(w http.ResponseWriter, r *http.Request) {
	responseWithJSON(w, 200, "User Profile")
}

func (u Users) GetProfileById(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	// id, err := uuid.Parse(idStr)

	responseWithJSON(w, 200, "User Profile for ID: "+idStr)
}
