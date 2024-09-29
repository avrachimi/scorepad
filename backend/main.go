package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/avrachimi/scorepad/backend/api"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func main() {

	handler := api.API{
		Users: api.Users{},
	}

	router := chi.NewRouter()

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	v1Router := chi.NewRouter()

	v1Router.Get("/users", handler.Users.GetAll)
	v1Router.Post("/users", handler.Users.Create)
	v1Router.Delete("/users/{id}", handler.Users.Delete)
	v1Router.Get("/users/profile", handler.Users.GetProfile)
	v1Router.Get("/users/profile/{id}", handler.Users.GetProfileById)

	router.Mount("/v1", v1Router)

	srv := &http.Server{
		Handler: router,
		Addr:    ":" + "8080",
	}

	log.Printf("Server started on port %s", "8080")

	err := srv.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Port: 8080")

}
