# Comments API

## Overview
The Comments API is where conversations spark, threads blossom, and moderators keep the peace. Everything lives under `/api/comments`, serving both community members and the crew running the show.

### Base URL
```
/api/comments
```

### Authentication & Roles
- Reading the chatter is open to all.
- Starting, editing, liking, or replying demands an authenticated voice (`auth_middleware.require_auth`).
- Admin tools are reserved for the moderation squad (`auth_middleware.require_admin`).

## Core Endpoints

| Method | Path | Auth required | Description |
| ------ | ---- | ------------- | ----------- |
| GET | `/post/:postId` | Optional | Streams all comments attached to a post. |
| GET | `/:id` | Optional | Fetches a single comment for close inspection. |
| POST | `/` | User | Launches a brand-new top-level comment. |
| PUT | `/:id` | User (owner/admin) | Polishes an existing comment. |
| DELETE | `/:id` | User (owner/admin) | Removes a comment from the timeline. |
| POST | `/:id/reply` | User | Spins up a reply within the thread. |

## Like Management

| Method | Path | Auth required | Description |
| ------ | ---- | ------------- | ----------- |
| GET | `/:id/like` | Optional | Shows who reacted to the comment. |
| POST | `/:id/like` | User | Adds—or flips—a like for the comment. |
| DELETE | `/:id/like` | User | Withdraws the authenticated user’s like. |

The auxiliary router also exposes identical endpoints using the `:comment_id` parameter naming. All IDs are validated with `Validator.validate_id`.

## Administration

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/admin/all` | Pulls every comment for dashboard overviews. |
| GET | `/admin/moderate` | Surfaces comments awaiting human judgment. |
| PUT | `/admin/:id/approve` | Gives a comment the green light. |
| PUT | `/admin/:id/reject` | Flags a comment as rejected. |
| DELETE | `/admin/:id` | Removes a comment with admin authority. |

## Validation & Middleware
- `auth_middleware.identify_user` tags requests with user context when available.
- `Validator.validate_comment` confirms every comment has the essentials before posting.
- `error_handler.async_handler` routes unexpected errors to the global handler without breaking the flow.

## Payload Reference

### `POST /`
```json
{
  "post_id": 1,
  "content": "Markdown or HTML string",
  "parent_comment_id": 42 // optional
}
```

### `POST /:id/reply`
```json
{
  "content": "Reply body"
}
```

### `PUT /:id`
```json
{
  "content": "Updated body"
}
```

## Quick Testing

### Terminal (curl)
```bash
# Browse the comment thread for post #1
curl http://127.0.0.1:3000/api/comments/post/1

# Add a fresh comment while reusing auth cookies from a prior login
curl -X POST http://127.0.0.1:3000/api/comments \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"post_id":1,"content":"This article rocks!"}'

# Approve comment #12 as an admin
curl -X PUT http://127.0.0.1:3000/api/comments/admin/12/approve \
  -b admin-cookies.txt -c admin-cookies.txt
```

### Postman Walkthrough
1. **Collection setup**: Create a “Comments API” collection with a `base_url` variable pointing to `http://127.0.0.1:3000/api/comments`.
2. **Thread browsing**: Add a GET request to `{{base_url}}/post/1` to inspect discussions.
3. **Create comment**: Add a POST request to `{{base_url}}/` with JSON body `{ "post_id": 1, "content": "Your take?" }`. Under the “Authorization” tab choose “Bearer Token” or reuse the cookie from the Auth collection.
4. **Moderation flow**: Duplicate the request and change the method/path to `PUT` and `/admin/{{commentId}}/approve` or `/reject` to test moderator actions.
5. **Test likes**: Add quick GET/POST/DELETE requests for `/:id/like` to ensure reactions behave as expected.
