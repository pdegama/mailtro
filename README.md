# Mailtro

Minimal open-source mail platform — bring your own domain.
Backend: Go (Fiber + GORM + RabbitMQ). Frontend: React (Vite + Tailwind).
SMTP: [Box SMTP](https://github.com/rellitelink/box) (server + client) over RabbitMQ queues.

## How it works

```
                    ┌───────────── mail server (smtp.mailtro.site) ─────────────┐
 internet ── :25 ──►│ box-server │──► receiver queue ─┐                          
                    │ box-client │◄── sender queue  ◄─┼── RabbitMQ               
                    └────────────┘──► status queue  ──┘        ▲                 
                                                               │                 
                    ┌── app ──────────────────────────────────┴───┐             
                    │ backend (Go API + queue workers) ── Postgres │             
                    │ frontend (React)                             │             
                    └──────────────────────────────────────────────┘             
```

- **Receive**: box-server accepts SMTP, checks SPF, publishes YAML to the *receiver* queue. The backend consumes it, verifies **DKIM**, splits `user+tag@domain`, resolves the mailbox (verified domain → owner username → alias) and stores the mail unread.
- **Send**: the backend builds the MIME message, signs it with the domain's **DKIM key**, publishes to the *sender* queue. box-client delivers and reports on the *status* queue; `TRYAGAIN` is re-queued after `RETRY_DELAY_MINUTES` (max `MAX_RETRIES`), then failed.
- **Domains**: users claim a domain, get DNS records (CNAME ownership challenge, MX, SPF include, DKIM key). Verifying a domain another user held **moves ownership** and un-verifies the old claim.
- Usernames, aliases and addresses are always stored/compared in **lowercase**.

## Installation

### 0. Prerequisites

- Docker + Docker Compose
- A server for mail with port 25 open and rDNS/PTR set (e.g. `smtp.mailtro.site`)
- TLS key + cert files for the mail hostname (e.g. Let's Encrypt)
- DNS you control for the platform zone:
  - `smtp.mailtro.site` → A/AAAA of the mail server (+ MX target for users)
  - `_spf.mailtro.site` → root SPF TXT listing your mail server IPs
  - `verify.mailtro.site` zone used for CNAME ownership challenges

All compose stacks use **host networking** — services talk to each other over
`localhost` (postgres :5432, rabbitmq :5672, api :3000, web :8080, smtp :25).

### 1. Configure

```sh
cp .env.example .env
# edit: DB/AMQP passwords, JWT_SECRET, MX_HOSTS (';' separated), SPF_INCLUDE,
#       VERIFY_ZONE, MAIL_HOSTNAME, queue names, VITE_API_BASE_URL
```

Queue names (`QUEUE_RECEIVER`, `QUEUE_SENDER`, `QUEUE_STATUS`) must match `deploy/box/box.yml`.

### 2. Infra (PostgreSQL + RabbitMQ)

```sh
docker compose -f docker-compose.infra.yml up -d
```

RabbitMQ management UI: `http://localhost:15672` (user/pass from `.env`).

### 3. Box SMTP (on the mail server)

Clone box next to mailtro (or set `BOX_SRC` to its path), put your TLS keys
somewhere outside the repo, then:

```sh
cd deploy/box
# edit box.yml: hostname, amqp host/credentials, queue names
BOX_KEYS_DIR=/etc/letsencrypt/live/smtp.mailtro.site docker compose up -d --build
```

This starts `box-server` (SMTP :25) and `box-client` (delivery worker) sharing
the same `box.yml` via a joint volume; keys are mounted read-only at `/keys`.
With host networking box reaches RabbitMQ on `localhost`; if RabbitMQ is on
another host, set its public address in `box.yml`.
(Box also ships its own `docker-compose.yml` in the box repo — either works.)

### 4. App (backend + frontend)

```sh
docker compose -f docker-compose.app.yml up -d --build
```

- API: `http://localhost:3000` (health: `/health`)
- Web: `http://localhost:8080`

`VITE_API_BASE_URL` is baked into the frontend at **build** time — rebuild the
frontend image after changing it.

### 5. Use it

1. Register (username becomes your mailbox local part; add a domain during
   onboarding or skip and do it later in **Settings → Domains**).
2. Add the shown DNS records on your domain:
   - `CNAME _mailtro.<domain>` → `<token>.verify.mailtro.site` (ownership)
   - `MX <domain>` → `smtp.mailtro.site` (from `MX_HOSTS`)
   - `TXT <domain>` → `v=spf1 include:_spf.mailtro.site ~all`
   - `TXT <selector>._domainkey.<domain>` → DKIM public key
3. Click **Verify** — once verified you send/receive as `username@domain`,
   plus-addressing (`username+tag@domain`) and aliases work immediately.

## Development

```sh
# backend
cd backend && cp .env .env.local  # adjust hosts to localhost
go run ./cmd/app

# frontend
cd frontend && npm install && npm run dev
```

## Env reference (backend)

| Var | Meaning |
|---|---|
| `QUEUE_RECEIVER` / `QUEUE_SENDER` / `QUEUE_STATUS` | box queue names |
| `MX_HOSTS` | MX targets users must add, `;` separated |
| `SPF_INCLUDE` | root SPF include users must add |
| `VERIFY_ZONE` | CNAME challenge target zone |
| `MAIL_HOSTNAME` | primary mail host (Message-IDs) |
| `RETRY_DELAY_MINUTES` / `MAX_RETRIES` | TRYAGAIN re-queue policy |
