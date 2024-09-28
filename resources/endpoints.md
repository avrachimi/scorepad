# API Endpoints

This is to help me create the initial endpoints. This document might not be updated.

Most of these endpoints will be behind auth.

<!-- ignoring auth related endpoints for now -->

## Users

| Method | Endpoint       | Description                     |
| ------ | -------------- | ------------------------------- |
| GET    | /users         | Get all users excluding friends |
| POST   | /users         | Create user account             |
| GET    | /users/profile | Get user's profile              |
| DELETE | /users[id]     | Delete user account             |

## Friends

| Method | Endpoint          | Description                     |
| ------ | ----------------- | ------------------------------- |
| GET    | /friends          | Get logged in user's friends    |
| GET    | /friends/requests | Get friend requests             |
| POST   | /friends/add      | Send friend request             |
| PATCH  | /friends/accept   | Accept friend request           |
| DELETE | /friends/[id]     | Delete friend or reject request |

## Matches

| Method | Endpoint        | Description        |
| ------ | --------------- | ------------------ |
| GET    | /matches        | Get all matches    |
| POST   | /matches        | Create match       |
| GET    | /matches/recent | Get recent matches |
| GET    | /matches/[id]   | Get match          |
| PUT    | /matches[id]    | Update match       |
| DELETE | /matches/[id]   | Delete match       |

## Stats

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | /stats             | Get all stats            |
| GET    | /stats/matches     | Get matches played stats |
| GET    | /stats/leaderboard | Get leaderboard          |
