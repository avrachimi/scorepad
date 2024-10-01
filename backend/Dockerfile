FROM golang:1.21.1-bullseye

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

COPY . .

RUN go build -o myapp .

EXPOSE 3000

HEALTHCHECK CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["./myapp"]

