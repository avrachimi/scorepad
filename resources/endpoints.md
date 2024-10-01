# API Endpoints

This is to help me create the initial endpoints. This document might not be updated.

Most of these endpoints will be behind auth.

## Auth

| Method | Endpoint                  | Description                 |
| ------ | ------------------------- | --------------------------- |
| GET    | /auth/signin              | Start oAuth sign in process |
| GET    | /auth/signout             | Logout user                 |
| GET    | /auth/refresh             | Generate new access token   |
| GET    | /auth/[provider]/callback | Auth callback fn            |

## Users

| Method | Endpoint            | Description                                                                |
| ------ | ------------------- | -------------------------------------------------------------------------- |
| GET    | /users              | Get all users excluding friends                                            |
| POST   | /users              | Create user account (should be removed, acct is created through auth flow) |
| DELETE | /users/[id]         | Delete user account                                                        |
| GET    | /users/profile      | Get user's profile                                                         |
| GET    | /users/profile/[id] | Get friends' profile                                                       |

## Friends

| Method | Endpoint          | Description                     |
| ------ | ----------------- | ------------------------------- |
| GET    | /friends          | Get logged in user's friends    |
| POST   | /friends          | Send (create) friend request    |
| PATCH  | /friends/[id]     | Accept friend request           |
| DELETE | /friends/[id]     | Delete friend or reject request |
| GET    | /friends/requests | Get friend requests             |

## Matches

| Method | Endpoint        | Description        |
| ------ | --------------- | ------------------ |
| GET    | /matches        | Get all matches    |
| POST   | /matches        | Create match       |
| GET    | /matches/[id]   | Get match          |
| PUT    | /matches[id]    | Update match       |
| DELETE | /matches/[id]   | Delete match       |
| GET    | /matches/recent | Get recent matches |

## Stats

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | /stats   | Get stats   |

</br>

##### GET /stats filters

```go
// default is "all"
type = "all" | "matches" | "leaderboard";
```
