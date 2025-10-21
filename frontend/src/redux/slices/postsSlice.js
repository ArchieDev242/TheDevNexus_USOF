import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const get_auth_headers = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const fetch_posts = createAsyncThunk(
    'posts/fetchAll',
    async ({ page = 1, limit = 10, category = null, sortBy = 'date' } = {}, { rejectWithValue }) => {
        try 
        {
            let url = `/api/posts?page=${page}&limit=${limit}&sortBy=${sortBy}`;
            
            if(category) url += `&category=${category}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to fetch posts');
            
            return data.data || data;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const fetch_post_by_id = createAsyncThunk(
    'posts/fetchById',
    async (postId, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/posts/${postId}`);
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to fetch post');
            
            return data.data || data;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const create_post = createAsyncThunk(
    'posts/create',
    async (postData, { rejectWithValue }) => {
        try 
        {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: get_auth_headers(),
                body: JSON.stringify(postData)
            });
        
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to create post');
            
            return data.data || data;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const update_post = createAsyncThunk(
    'posts/update',
    async ({ postId, postData }, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PATCH',
                headers: get_auth_headers(),
                body: JSON.stringify(postData)
            });
        
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to update post');
            
            return data.data || data;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const delete_post = createAsyncThunk(
    'posts/delete',
    async (postId, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: get_auth_headers()
            });
            
            if(!response.ok) 
                {
                const data = await response.json();
                return rejectWithValue(data.message || 'Failed to delete post');
            }
            
            return postId;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const like_post = createAsyncThunk(
    'posts/like',
    async ({ postId, type = 'like' }, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: get_auth_headers(),
                body: JSON.stringify({ type })
            });
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to like post');
            
            return { postId, type, data: data.data || data };
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

const posts_slice = createSlice({
    name: 'posts',
    initialState: 
    {
        posts: [],
        currentPost: null,
        loading: false,
        error: null,
        pagination: 
        {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
        }
    },
    reducers: 
    {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentPost: (state) => {
            state.currentPost = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetch posts
            .addCase(fetch_posts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetch_posts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload.posts || action.payload;
                
                if(action.payload.pagination) 
                    {
                    state.pagination = action.payload.pagination;
                }
            })
            .addCase(fetch_posts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetch post by ID
            .addCase(fetch_post_by_id.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetch_post_by_id.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPost = action.payload;
            })
            .addCase(fetch_post_by_id.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // create post
            .addCase(create_post.fulfilled, (state, action) => {
                state.posts.unshift(action.payload);
            })
            // update post
            .addCase(update_post.fulfilled, (state, action) => {
                const index = state.posts.findIndex(p => p.id === action.payload.id);
                
                if(index !== -1) state.posts[index] = action.payload;

                if(state.currentPost?.id === action.payload.id) 
                    {
                    state.currentPost = action.payload;
                }
            })
            // delete post
            .addCase(delete_post.fulfilled, (state, action) => {
                state.posts = state.posts.filter(p => p.id !== action.payload);
                if(state.currentPost?.id === action.payload) 
                    {
                    state.currentPost = null;
                }
            })
            // like post
            .addCase(like_post.fulfilled, (state, action) => {
                const post = state.posts.find(p => p.id === action.payload.postId);
                if(post && action.payload.data) 
                    {
                    post.likes = action.payload.data.likes;
                    post.dislikes = action.payload.data.dislikes;
                }
            });
    }
});

export const { clearError, clearCurrentPost } = posts_slice.actions;
export default posts_slice.reducer;
