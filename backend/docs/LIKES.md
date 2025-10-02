# Likes API

## Overview
The Likes API is the applause meter for your content. It offers a lightweight way to react to posts and comments—likes, dislikes, stats, the works. While the router isn’t yet wired into `index.js`, it’s ready for showtime once you mount it.

### Intended Base URL
```
/api/likes
```

### Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/post/:id/like` | Adds a like reaction to the post. |
| POST | `/post/:id/dislike` | Drops a dislike on the post. |
| POST | `/comment/:id/like` | Adds a like reaction to the comment. |
| POST | `/comment/:id/dislike` | Registers a dislike against the comment. |
| GET | `/user/my` | Shows the signed-in user’s reaction history. |
| GET | `/post/:id` | Lists reactions tied to the post. |
| GET | `/comment/:id` | Lists reactions tied to the comment. |
| GET | `/admin/stats` | Summarizes reaction stats for admin dashboards. |

## Notes
- Controller methods (`LikesController`) should be paired with authentication, authorization, and throttling middleware when you wire them in.
- Mount the router in `index.js` (e.g., `app.use('/api/likes', likesRouter)`) to take the applause meter live.

## Quick Testing

### Terminal (curl)
```bash
# Like post #9 as the current user
curl -X POST http://127.0.0.1:3000/api/likes/post/9/like \
  -b cookies.txt -c cookies.txt

# Peek at reaction breakdown on comment #4
curl http://127.0.0.1:3000/api/likes/comment/4 \
  -b cookies.txt -c cookies.txt

# Fetch admin stats (admin access required)
curl http://127.0.0.1:3000/api/likes/admin/stats \
  -b admin-cookies.txt -c admin-cookies.txt
```

### Postman Walkthrough
1. **Collection**: Once the router is mounted, set `{{base_url}} = http://127.0.0.1:3000/api/likes` in a “Likes API” collection.
2. **Reactions**: Add POST endpoints for `/post/{{postId}}/like` and `/comment/{{commentId}}/like` to test quick toggles.
3. **Dislikes**: Duplicate requests and flip the path to `/dislike` to cover the full spectrum.
4. **History**: GET `{{base_url}}/user/my` to ensure personal reaction logs work once authorization is wired in.
5. **Dashboards**: GET `{{base_url}}/admin/stats` to feed admin dashboards with aggregate data.
