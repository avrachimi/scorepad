package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/avrachimi/scorepad/backend/api"
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

	v1Router := chi.NewRouter()

	v1Router.Get("/users", handler.User.GetAll)
	v1Router.Post("/users", handler.User.Create)
	v1Router.Delete("/users/{id}", handler.User.Delete)
	v1Router.Get("/users/profile", handler.User.GetProfile)
	v1Router.Get("/users/profile/{id}", handler.User.GetProfileById)

	v1Router.Get("/matches", handler.Match.GetAll)
	v1Router.Post("/matches", handler.Match.Create)

	v1Router.Get("/friends", handler.Friendship.GetAll)

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
