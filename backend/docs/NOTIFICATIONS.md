# Notifications API

## Overview
The Notifications API is the personal news ticker for your users—surfacing alerts, marking them read, and sweeping out the old. Everything happens under `/api/notifications`, and only signed-in users get a peek.

### Base URL
```
/api/notifications
```

### Authentication
- `auth_middleware.require_auth` wraps the router, ensuring every action belongs to a real, authenticated user.

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/` | Lists every notification waiting for the current user. |
| GET | `/unread` | Filters down to the unread highlights. |
| GET | `/unread/count` | Returns a quick unread tally. |
| PUT | `/:id/read` | Marks a specific notification as read. |
| PUT | `/read-all` | Marks every notification as read in one swoop. |
| DELETE | `/:id` | Deletes a single notification. |
| DELETE | `/read` | Clears all the read notifications. |
| DELETE | `/cleanup` | Purges stale notifications per retention rules. |

## Middleware Summary
- Router-level authentication guarantees downstream handlers always operate on the right user record.
- Controllers handle database work and validation; add stricter ID validation if numeric enforcement becomes necessary.

## Quick Testing

### Terminal (curl)
```bash
# List every notification for the logged-in user
curl http://127.0.0.1:3000/api/notifications \
  -b cookies.txt -c cookies.txt

# Mark notification #15 as read
curl -X PUT http://127.0.0.1:3000/api/notifications/15/read \
  -b cookies.txt -c cookies.txt

# Clear out all read notifications
curl -X DELETE http://127.0.0.1:3000/api/notifications/read \
  -b cookies.txt -c cookies.txt
```

### Postman Walkthrough
1. **Collection**: Build a “Notifications API” collection with `{{base_url}} = http://127.0.0.1:3000/api/notifications` and inherit authentication from the Auth collection.
2. **Inbox view**: Add GET `{{base_url}}/` to see unread/read items together.
3. **Badge counter**: Add GET `{{base_url}}/unread/count` to validate UI badge numbers.
4. **Single mark-read**: Add PUT `{{base_url}}/{{notificationId}}/read` and store `notificationId` as a variable for quick reuse.
5. **Cleanup scripts**: Add DELETE requests for `/read` and `/cleanup` to rehearse sweeping tasks.
