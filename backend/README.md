Backend built using Go, Chi, sqlc and goose.

I've tried implementing my own auth using oauth2 to verify users
and using access and refresh tokens to authenticate requests.


The idea was to build my backend api in a way so that I can consume it
from a potential web app in the future. Most of the endpoints are fine in regards to this,
but some of the auth endpoints might need modification to work with a web app.
