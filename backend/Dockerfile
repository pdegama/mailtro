FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/mailtro ./cmd/app

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
COPY --from=build /out/mailtro /usr/local/bin/mailtro
EXPOSE 3000
CMD ["mailtro"]
