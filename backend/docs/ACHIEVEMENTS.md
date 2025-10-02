# Achievements API

## Overview
The Achievements API is the trophy cabinet and hype board rolled into one. Browse badges, track progress, climb leaderboards, or grant shiny awards—all via `/api/achievements`.

### Base URL
```
/api/achievements
```

### Authentication & Roles
- Catalogs, leaderboards, and public profiles are open to curious onlookers.
- Checking your own haul demands a logged-in session.
- Handing out trophies is an admin superpower bounded by controller checks.

## Endpoints

| Method | Path | Auth required | Description |
| ------ | ---- | ------------- | ----------- |
| GET | `/` | No | Lists every badge the game offers. |
| GET | `/leaderboard` | No | Ranks users by their achievement prowess. |
| GET | `/details/:id` | No | Zooms into a specific achievement’s lore. |
| GET | `/user/:user_id` | No | Shows public achievements for the selected user. |
| GET | `/my` | User | Displays the signed-in user’s personal collection. |
| POST | `/award` | Admin | Grants an achievement to a user when the admins decree it. |

All IDs are validated within controller logic; middleware ensures the authenticated context for protected routes.

## Request Payloads

### `POST /award`
```json
{
  "user_id": 1,
  "achievement_id": 5,
  "reason": "string" // optional explanatory text
}
```

## Middleware Highlights
- `auth_middleware.identify_user` attaches user information when tokens are present.
- `auth_middleware.require_auth` guards `/my` and `/award` so only signed-in users proceed.
- `error_handler.async_handler` channels exceptions to the global handler before they rain on the parade.

## Quick Testing

### Terminal (curl)
```bash
# Browse the entire achievements gallery
curl http://127.0.0.1:3000/api/achievements

# Check your own achievement shelf (requires auth)
curl http://127.0.0.1:3000/api/achievements/my \
  -b cookies.txt -c cookies.txt

# Award badge #7 to user #3 as an admin
curl -X POST http://127.0.0.1:3000/api/achievements/award \
  -b admin-cookies.txt -c admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"user_id":3,"achievement_id":7,"reason":"Completed the onboarding quest"}'
```

### Postman Walkthrough
1. **Collection**: Configure “Achievements API” with `{{base_url}} = http://127.0.0.1:3000/api/achievements`.
2. **Public browsing**: Add GET requests for `/`, `/leaderboard`, and `/details/{{achievementId}}` to see public data in one click.
3. **My shelf**: Add GET `{{base_url}}/my` and attach an authenticated cookie/token to confirm personalized results.
4. **Awarding flow**: Add POST `{{base_url}}/award` with the payload above; use an admin token and watch for success messages.
5. **User view**: Add GET `{{base_url}}/user/{{userId}}` to double-check public profiles reflect new awards.
