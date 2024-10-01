FROM golang:1.21.1-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o myapp

FROM alpine:latest

RUN apk --no-cache add curl wget

WORKDIR /app

COPY --from=build /app/myapp .

EXPOSE 3000

HEALTHCHECK CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["./myapp"]

