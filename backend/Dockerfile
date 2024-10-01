# Use the official Golang image to create a build artifact.
# This build stage will build the Go binary.
FROM golang:1.20-alpine AS build

# Set the current working directory inside the container.
WORKDIR /app

# Copy go mod and go sum files.
COPY go.mod go.sum ./

# Download all Go dependencies.
RUN go mod download

# Copy the source from the current directory to the working directory inside the container.
COPY . .

# Build the Go app.
RUN go build -o myapp

# Create a small image with the Go binary.
FROM alpine:latest

# Set the working directory inside the container.
WORKDIR /app

# Copy the Go binary from the build image.
COPY --from=build /app/myapp .

# Expose port 3000 to the outside world.
EXPOSE 3000

# Command to run the executable.
CMD ["./myapp"]

