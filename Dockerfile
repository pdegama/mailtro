# ============================
# Stage 1 - Build Frontend
# ============================
FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .

ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ============================
# Stage 2 - Build Backend
# ============================
FROM golang:1.26-alpine AS backend-build

WORKDIR /backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

# Copy frontend build into the embed directory
COPY --from=frontend-build /frontend/dist ./static/dist

RUN CGO_ENABLED=0 go build -o /out/mailtro ./cmd/app

# ============================
# Stage 3 - Runtime
# ============================
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

COPY --from=backend-build /out/mailtro /usr/local/bin/mailtro

EXPOSE 3000

CMD ["mailtro"]