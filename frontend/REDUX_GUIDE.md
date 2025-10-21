# Redux Structure Documentation

## 📁 Structure

```
src/
├── redux/
│   ├── store.js                 # Main Redux store
│   └── slices/
│       ├── authSlice.js         # Authentication state
│       ├── postsSlice.js        # Posts state
│       ├── commentsSlice.js     # Comments state
│       └── categoriesSlice.js   # Categories state
├── components/
│   ├── AuthForm.jsx             # Login/Register component
│   ├── PostsList.jsx            # Display posts
│   └── CreatePostForm.jsx       # Create new post
└── main.jsx                     # App entry point
```

## 🔧 Redux Slices

### 1. authSlice
**State:**
- `user` - Current user object
- `token` - JWT token
- `isAuthenticated` - Boolean
- `loading` - Loading state
- `error` - Error messages

**Actions:**
- `login({ login, password })` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `fetchCurrentUser()` - Load user from token

**Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from './redux/slices/authSlice';

// In component
const dispatch = useDispatch();
const { user, isAuthenticated } = useSelector(state => state.auth);

// Login
dispatch(login({ login: 'username', password: 'pass' }));

// Logout
dispatch(logout());
```

### 2. postsSlice
**State:**
- `posts` - Array of posts
- `currentPost` - Single post details
- `loading` - Loading state
- `error` - Error messages
- `pagination` - Pagination info

**Actions:**
- `fetchPosts({ page, limit, category, sortBy })` - Get all posts
- `fetchPostById(postId)` - Get single post
- `createPost(postData)` - Create new post
- `updatePost({ postId, postData })` - Update post
- `deletePost(postId)` - Delete post
- `likePost({ postId, type })` - Like/dislike post

**Usage:**
```javascript
import { fetchPosts, createPost } from './redux/slices/postsSlice';

// Fetch posts
dispatch(fetchPosts({ page: 1, limit: 10 }));

// Create post
dispatch(createPost({
    title: 'My Post',
    content: 'Post content',
    categories: [1, 2]
}));
```

### 3. commentsSlice
**State:**
- `commentsByPost` - Object with comments grouped by post ID
- `loading` - Loading state
- `error` - Error messages

**Actions:**
- `fetchComments(postId)` - Get comments for post
- `createComment({ postId, content })` - Add comment
- `updateComment({ commentId, content })` - Update comment
- `deleteComment(commentId)` - Delete comment
- `likeComment({ commentId, type })` - Like/dislike comment

**Usage:**
```javascript
import { fetchComments, createComment } from './redux/slices/commentsSlice';

// Fetch comments
dispatch(fetchComments(postId));

// Create comment
dispatch(createComment({
    postId: 1,
    content: 'Great post!'
}));
```

### 4. categoriesSlice
**State:**
- `categories` - Array of categories
- `currentCategory` - Single category details
- `loading` - Loading state
- `error` - Error messages

**Actions:**
- `fetchCategories()` - Get all categories
- `fetchCategoryById(categoryId)` - Get single category

**Usage:**
```javascript
import { fetchCategories } from './redux/slices/categoriesSlice';

// Fetch categories
dispatch(fetchCategories());
```

## 🎯 How to Use Redux in Components

### 1. Access State
```javascript
import { useSelector } from 'react-redux';

function MyComponent() {
    const { posts, loading } = useSelector(state => state.posts);
    const { user } = useSelector(state => state.auth);
    
    return <div>{/* Use state */}</div>;
}
```

### 2. Dispatch Actions
```javascript
import { useDispatch } from 'react-redux';
import { fetchPosts } from './redux/slices/postsSlice';

function MyComponent() {
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);
    
    return <div>{/* Component */}</div>;
}
```

### 3. Handle Loading & Errors
```javascript
function MyComponent() {
    const { posts, loading, error } = useSelector(state => state.posts);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return <div>{/* Display posts */}</div>;
}
```

## 🔐 Authentication Flow

1. User submits login form
2. `login()` action dispatched
3. Token saved to localStorage
4. User data saved to Redux state
5. App re-renders with authenticated state

## 📝 Creating a Post Flow

1. User fills create post form
2. `createPost()` action dispatched
3. API request sent with auth token
4. New post added to Redux state
5. Posts list updates automatically

## 🎨 Best Practices

1. **Always check authentication:**
```javascript
const { isAuthenticated } = useSelector(state => state.auth);
if (!isAuthenticated) return <Login />;
```

2. **Clear errors when needed:**
```javascript
import { clearError } from './redux/slices/postsSlice';
dispatch(clearError());
```

3. **Use loading states:**
```javascript
{loading ? <Spinner /> : <Content />}
```

4. **Handle errors gracefully:**
```javascript
{error && <ErrorMessage message={error} />}
```

## 🚀 Quick Start Example

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from './redux/slices/postsSlice';
import { fetchCurrentUser } from './redux/slices/authSlice';

function App() {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.auth);
    const { posts, loading } = useSelector(state => state.posts);
    
    useEffect(() => {
        dispatch(fetchCurrentUser());
        dispatch(fetchPosts());
    }, [dispatch]);
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <h1>Welcome!</h1>
                    {/* Display posts */}
                </div>
            ) : (
                <AuthForm />
            )}
        </div>
    );
}
```

## 📚 Additional Resources

- Redux Toolkit Docs: https://redux-toolkit.js.org/
- React-Redux Hooks: https://react-redux.js.org/api/hooks
