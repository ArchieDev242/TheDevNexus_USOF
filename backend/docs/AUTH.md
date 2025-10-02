# Auth API

## Overview
Think of the Auth API as the bouncer, concierge, and lost-and-found desk for your platform. It handles registration, login, email verification, password recovery, and logout with a smile, all neatly packaged under the `/api/auth` prefix.

### Base URL
```
/api/auth
```

### Authentication
Most stops on this tour are open to the public, but logging out naturally requires you to be logged in first. Sensitive routes lean on `RateLimit` middleware so nobody can spam the doorbell.

## Endpoints

| Method | Path | Auth required | Description |
| ------ | ---- | ------------- | ----------- |
| POST | `/register` | No | Rolls out the welcome mat, validating new account data before entry. |
| POST | `/login` | No | Checks credentials and hands back fresh session/JWT cookies. |
| POST | `/logout` | User | Politely shows the authenticated user to the exit, clearing tokens on the way out. |
| POST | `/password-reset` | No | Sends a rescue email to users who misplaced their password. |
| POST | `/password-reset/confirm` | No | Finalizes the reset journey using a valid token. |
| GET | `/verify` | No | Confirms email verification links issued during signup. |
| POST | `/password/verify` | No | Lets clients double-check reset tokens without burning them. |

## Request Payloads

### `POST /register`
```json
{
  "login": "string",
  "email": "string",
  "password": "string",
  "full_name": "string"
}
```

### `POST /login`
```json
{
  "login": "string", // or email
  "password": "string"
}
```

### `POST /password-reset`
```json
{
  "email": "string"
}
```

### `POST /password-reset/confirm`
```json
{
  "token": "string",
  "password": "string"
}
```

### `POST /password/verify`
```json
{
  "token": "string"
}
```

## Middleware Ensemble
- `RateLimit.auth()` keeps registration and login from turning into a button-mashing contest.
- `RateLimit.password_reset()` offers the same protection for password recovery requests.
- `Validator` double-checks every payload like a meticulous gate agent.
- `auth_middleware` confirms the user’s identity before letting them log out.
- `error_handler.async_handler` funnels any surprises straight to the global error handler.

## Quick Testing

### Terminal (curl)
```bash
# Register a brand-new user
curl -X POST http://127.0.0.1:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"login":"demo_user","email":"demo@example.com","password":"Secret123!","full_name":"Demo User"}'

# Log in and store the session cookie for later calls
curl -X POST http://127.0.0.1:3000/api/auth/login \
  -c cookies.txt -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"login":"demo_user","password":"Secret123!"}'

# Request a password reset email
curl -X POST http://127.0.0.1:3000/api/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com"}'
```

### Postman Walkthrough
1. **Create a collection** named “Auth API” and set the base URL to `http://127.0.0.1:3000/api/auth` via an environment variable.
2. **Register**: POST request to `/register` with a raw JSON body mirroring the example payload above.
3. **Login**: POST to `/login`. Under the “Tests” tab, capture the `set-cookie` header and save it as a Postman environment cookie for follow-up requests.
4. **Logout**: POST to `/logout`, attaching the stored cookie to verify the session closes cleanly.
5. **Password Recovery**: Chain `/password-reset`, `/password/verify`, and `/password-reset/confirm` requests to simulate the full flow end-to-end.
