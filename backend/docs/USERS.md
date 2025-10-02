# Users API

## Overview
The Users API is the social backbone of the platform—fueling profile discovery, reputation points, avatar glow-ups, and admin wizardry. Everything lives at `/api/users`.

### Base URL
```
/api/users
```

### Authentication & Roles
- Browsing the roster and viewing profiles is open season.
- Reputation changes, profile edits, avatars, deletions, and saved-post access demand a logged-in human.
- Spawning new users through the API is an admin-only magic trick.

## Endpoints

| Method | Path | Auth required | Description |
| ------ | ---- | ------------- | ----------- |
| GET | `/` | Optional | Lists the public directory of users. |
| GET | `/:user_id` | Optional | Shows a user’s public profile. |
| GET | `/:user_id/reputation` | Optional | Displays reputation history and totals. |
| POST | `/:user_id/reputation` | User | Records feedback that nudges reputation up or down. |
| POST | `/` | Admin | Creates a brand-new user account. |
| PATCH | `/avatar` | User | Uploads or updates the current user’s avatar. |
| PATCH | `/:user_id` | User (owner/admin) | Updates profile fields for the specified user. |
| DELETE | `/:user_id` | User (owner/admin) | Removes a user account. |
| GET | `/saved-posts` | User | Returns the signed-in user’s saved posts.

All `:user_id` parameters are validated with `Validator.validate_id('user_id')`.

## Request Payloads

### `POST /`
```json
{
  "login": "string",
  "email": "string",
  "password": "string",
  "full_name": "string",
  "role": "user | admin"
}
```

### `POST /:user_id/reputation`
```json
{
  "action": "upvote | downvote | custom",
  "reason": "string" // optional, depending on validation rules
}
```

### `PATCH /avatar`
Multipart form upload with the `avatar` file field. The middleware handles storage and validation.

### `PATCH /:user_id`
```json
{
  "login": "string",
  "email": "string",
  "full_name": "string",
  "password": "string",
  "role": "user | admin"
}
```
Only fields you send are updated; `auth_middleware.require_ownership_or_admin` ensures the right person is steering the ship.

## Middleware Lineup
- `auth_middleware.identify_user` hydrates request context whenever a token surfaces.
- `auth_middleware.require_auth` keeps sensitive operations behind a login.
- `auth_middleware.require_admin` and `require_ownership_or_admin` enforce that only the right people act on accounts.
- `file_upload.upload_avatar` handles avatar uploads like a seasoned stylist.
- `Validator` modules keep payloads tidy before controllers do their work.

## Quick Testing

### Terminal (curl)
```bash
# Browse the user directory
curl http://127.0.0.1:3000/api/users

# Give user #3 an upvote (requires auth cookies)
curl -X POST http://127.0.0.1:3000/api/users/3/reputation \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"action":"upvote"}'

# Update your own profile details
curl -X PATCH http://127.0.0.1:3000/api/users/1 \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Updated Demo"}'
```

### Postman Walkthrough
1. **Collection setup**: Create “Users API” with `{{base_url}} = http://127.0.0.1:3000/api/users`.
2. **Directory view**: GET `{{base_url}}/` to validate the list endpoint.
3. **Reputation actions**: POST to `{{base_url}}/{{userId}}/reputation` with `{ "action": "upvote" }`. Reuse login cookies or bearer tokens for authorization.
4. **Profile updates**: Add a PATCH request to `{{base_url}}/{{userId}}` and send a partial JSON payload to practice partial updates.
5. **Saved posts**: GET `{{base_url}}/saved-posts` to ensure user-specific data returns when authenticated.
