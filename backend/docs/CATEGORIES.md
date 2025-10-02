# Categories API

## Overview
Treat the Categories API as your editorial index—curating the shelves where every post lives. From discovery to cleanup, it keeps taxonomy neat via the `/api/categories` router.

### Base URL
```
/api/categories
```

### Authentication & Roles
- Anyone can window-shop the catalogue or peek at a category’s details.
- Only administrators—with help from `auth_middleware.require_admin`—can rearrange the shelves.

## Endpoints

| Method | Path | Auth required | Description |
| ------ | ---- | ------------- | ----------- |
| GET | `/` | Optional | Shows the full map of categories available. |
| GET | `/:category_id` | Optional | Highlights a single category’s details. |
| GET | `/:category_id/posts` | Optional | Pulls every post tagged with the chosen category. |
| POST | `/` | Admin | Adds a fresh category once the payload passes inspection. |
| PATCH | `/:category_id` | Admin | Tweaks the title or description of an existing category. |
| DELETE | `/:category_id` | Admin | Retires a category from active duty. |

All `:category_id` parameters are validated via `Validator.validate_id('category_id')`.

## Request Payloads

### `POST /`
```json
{
  "title": "string",
  "description": "string"
}
```

### `PATCH /:category_id`
```json
{
  "title": "string",
  "description": "string"
}
```

Empty updates are kindly declined by the validation middleware.

## Middleware Cast
- `auth_middleware.identify_user` adds user context when available without locking out anonymous visitors.
- `auth_middleware.require_admin` stands guard over create/update/delete actions.
- `Validator.validate_category` keeps payloads sharp and well-formed.
- `error_handler.async_handler` escorts controller errors to the global handler with grace.

## Quick Testing

### Terminal (curl)
```bash
# Peek at every category on the site
curl http://127.0.0.1:3000/api/categories

# Create a new category as an admin
curl -X POST http://127.0.0.1:3000/api/categories \
  -b admin-cookies.txt -c admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Hardware","description":"All things chips and circuits."}'

# Update category #5 with a fresh description
curl -X PATCH http://127.0.0.1:3000/api/categories/5 \
  -b admin-cookies.txt -c admin-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"description":"Refined collection of hardware deep dives."}'
```

### Postman Walkthrough
1. **Collection**: Spin up a “Categories API” collection using variable `base_url = http://127.0.0.1:3000/api/categories`.
2. **List view**: Add a GET request to `{{base_url}}/` to confirm the catalogue loads.
3. **Create**: Add a POST request to `{{base_url}}/` with the JSON payload above; assign an admin auth token or cookie under the Authorization tab.
4. **Patch & delete**: Duplicate the request, switch the method to `PATCH` or `DELETE`, and reference `{{categoryId}}` variables to rehearse updates and cleanups.
5. **Posts per category**: Add a GET request to `{{base_url}}/{{categoryId}}/posts` to verify category filters return the right articles.
