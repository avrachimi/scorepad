package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/avrachimi/scorepad/backend/api"
	"github.com/avrachimi/scorepad/backend/auth"
	"github.com/avrachimi/scorepad/backend/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	_ "github.com/lib/pq"
)

func main() {
	godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT is not found in environment")
	}

	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL is not found in environment")
	}

	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Can't connect to database:", err)
	}

	db := database.New(conn)

	handler := api.API{
		User:       api.User{DB: db},
		Friendship: api.Friendship{DB: db},
		Match:      api.Match{DB: db},
	}

	router := chi.NewRouter()

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	auth.SetupAuth()
	router.Get("/auth/signin", auth.SignIn)
	router.Get("/auth/signout", auth.SignOut)
	router.Get("/auth/refresh", auth.RefreshToken)
	router.Get("/auth/{provider}/callback", func(w http.ResponseWriter, r *http.Request) {
		auth.AuthCallback(w, r, db)
	})

	v1Router := chi.NewRouter()

	v1Router.Get("/users", handler.MiddlewareAuth(handler.User.GetAll))
	v1Router.Post("/users", handler.User.Create)
	v1Router.Delete("/users/{id}", handler.MiddlewareAuth(handler.User.Delete))
	v1Router.Get("/users/profile", handler.MiddlewareAuth(handler.User.GetProfile))
	v1Router.Get("/users/profile/{id}", handler.MiddlewareAuth(handler.User.GetProfileById))

	v1Router.Get("/matches", handler.MiddlewareAuth(handler.Match.GetAll))
	v1Router.Post("/matches", handler.MiddlewareAuth(handler.Match.Create))
	v1Router.Get("/matches/{id}", handler.MiddlewareAuth(handler.Match.GetById))
	v1Router.Put("/matches/{id}", handler.MiddlewareAuth(handler.Match.UpdateMatch))

	v1Router.Get("/friends", handler.MiddlewareAuth(handler.Friendship.GetAll))
	v1Router.Post("/friends", handler.MiddlewareAuth(handler.Friendship.SendFriendRequest))

	router.Mount("/v1", v1Router)

	srv := &http.Server{
		Handler: router,
		Addr:    ":" + "8080",
	}

	log.Printf("Server started on port %s", "8080")

	err = srv.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Port: 8080")

}
