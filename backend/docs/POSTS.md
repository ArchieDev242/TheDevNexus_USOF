# Posts API

## Overview
The Posts API is your publishing studio—cranking out articles, collecting reactions, juggling categories, and even running snippets of code. Everything premieres under `/api/posts`.

### Base URL
```
/api/posts
```

### Authentication & Roles
- Browsing the library is open to everyone.
- Creating, editing, deleting, reacting, saving, or running code snippets requires a logged-in author.
- The special `/all/comments` backstage pass belongs to admins only.

## Endpoints

| Method | Path | Auth required | Description |
| ------ | ---- | ------------- | ----------- |
| GET | `/` | Optional | Lists public posts with sensible defaults. |
| GET | `/all/comments` | Admin | Provides a moderation-friendly post/comment digest. |
| GET | `/:post_id` | Optional | Pulls a single post into focus. |
| GET | `/:post_id/comments` | Optional | Shows comments connected to the post. |
| POST | `/:post_id/comments` | User | Drops a fresh comment on the post. |
| GET | `/:post_id/categories` | Optional | Displays categories associated with the post. |
| GET | `/:post_id/like` | Optional | Reveals reaction stats for the post. |
| POST | `/` | User | Publishes a new post (image uploads welcome). |
| POST | `/:post_id/like` | User | Adds a like with a single tap. |
| PATCH | `/:post_id` | User (owner/admin) | Edits content, metadata, or artwork. |
| DELETE | `/:post_id` | User (owner/admin) | Takes the post offline. |
| DELETE | `/:post_id/like` | User | Removes the current user’s reaction. |
| POST | `/:post_id/save` | User | Saves the post for later reading. |
| DELETE | `/:post_id/save` | User | Removes the post from saved items. |
| GET | `/:post_id/save-status` | User | Answers “did I save this already?” |
| POST | `/execute-code` | User | Runs code snippets with guardrails. |
| POST | `/highlight-code` | User | Returns syntax-highlighted output. |
| POST | `/validate-code` | User | Performs pre-flight checks for code snippets. |

All `:post_id` parameters are validated via `Validator.validate_id('post_id')`.

## File Uploads
- `file_upload.upload_post_images` wrangles multipart uploads for `POST /` and `PATCH /:post_id`.
- `file_upload.handle_upload_error` translates Multer complaints into friendly API responses.

## Request Payloads

### `POST /`
Multipart form fields include:
- `title` (string, required)
- `content` (string, required)
- `status` (enum: `draft`/`published` depending on controller)
- `categories[]` (optional array of category IDs)
- `images` (optional file array)

### `PATCH /:post_id`
Supports the same fields as creation, all optional; omitted keys remain unchanged.

### `POST /:post_id/comments`
```json
{
  "content": "Comment body"
}
```

### `POST /:post_id/like`
No body required.

### `POST /execute-code`
```json
{
  "language": "string",
  "source": "string",
  "input": "string" // optional
}
```

`RateLimit.execute_code_limit()` keeps the code execution engine from being spammed into oblivion.

## Quick Testing

### Terminal (curl)
```bash
# Fetch the latest posts with default filters
curl http://127.0.0.1:3000/api/posts

# Publish a new post as an authenticated user
curl -X POST http://127.0.0.1:3000/api/posts \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"First launch","content":"Hello from the API!","status":"published"}'

# Run a code snippet inside the post playground
curl -X POST http://127.0.0.1:3000/api/posts/execute-code \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"language":"python","source":"print(42)"}'
```

### Postman Walkthrough
1. **Collection base**: Use `{{base_url}} = http://127.0.0.1:3000/api/posts` in a dedicated collection.
2. **Browse**: Add a GET request to `{{base_url}}/` to confirm pagination and filters.
3. **Create**: Add a POST request to `{{base_url}}/` with a JSON body or form-data (for images). Attach the auth cookie or bearer token captured from the Auth collection.
4. **Comment workflow**: Duplicate the request, change the method/path to `POST` `{{base_url}}/{{postId}}/comments` and send `{ "content": "Love this!" }` to test inline discussions.
5. **Reactions & saves**: Add quick POST/DELETE pairs for `/:postId/like` and `/save` to verify the toggles. Round it out with `/execute-code`, `/highlight-code`, and `/validate-code` requests to exercise the snippet toolbox.
