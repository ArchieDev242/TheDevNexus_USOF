import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const get_auth_headers = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const fetch_comments = createAsyncThunk(
    'comments/fetchByPostId',
    async (postId, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/posts/${postId}/comments`);
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to fetch comments');
            
            return { postId, comments: data.data || data };
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const create_comment = createAsyncThunk(
    'comments/create',
    async ({ postId, content }, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: get_auth_headers(),
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to create comment');
            
            return { postId, comment: data.data || data };
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const update_comment = createAsyncThunk(
    'comments/update',
    async ({ commentId, content }, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: get_auth_headers(),
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to update comment');
            
            return data.data || data;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const delete_comment = createAsyncThunk(
    'comments/delete',
    async (commentId, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: get_auth_headers()
            });
            
            if(!response.ok) 
                {
                const data = await response.json();

                return rejectWithValue(data.message || 'Failed to delete comment');
            }
            
            return commentId;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const like_comment = createAsyncThunk(
    'comments/like',
    async ({ commentId, type = 'like' }, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/comments/${commentId}/like`, {
                method: 'POST',
                headers: get_auth_headers(),
                body: JSON.stringify({ type })
            });
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to like comment');
            
            return { commentId, type, data: data.data || data };
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

const comments_slice = createSlice({
    name: 'comments',
    initialState: 
    {
        commentsByPost: {},
        loading: false,
        error: null
    },
    reducers: 
    {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch comments
            .addCase(fetch_comments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetch_comments.fulfilled, (state, action) => {
                state.loading = false;
                state.commentsByPost[action.payload.postId] = action.payload.comments;
            })
            .addCase(fetch_comments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // create comment
            .addCase(create_comment.fulfilled, (state, action) => {
                const { postId, comment } = action.payload;
                if(!state.commentsByPost[postId]) 
                    {
                    state.commentsByPost[postId] = [];
                }
                state.commentsByPost[postId].push(comment);
            })
            // update comment
            .addCase(update_comment.fulfilled, (state, action) => {
                const comment = action.payload;
                Object.keys(state.commentsByPost).forEach(postId => {
                    const index = state.commentsByPost[postId].findIndex(c => c.id === comment.id);
                    
                    if(index !== -1) state.commentsByPost[postId][index] = comment;
                });
            })
            // delete comment
            .addCase(delete_comment.fulfilled, (state, action) => {
                const comment_id = action.payload;
                Object.keys(state.commentsByPost).forEach(postId => {
                    state.commentsByPost[postId] = state.commentsByPost[postId].filter(
                        c => c.id !== comment_id
                    );
                });
            })
            // like comment
            .addCase(like_comment.fulfilled, (state, action) => {
                const { commentId, data } = action.payload;
                Object.keys(state.commentsByPost).forEach(postId => {
                    const comment = state.commentsByPost[postId].find(c => c.id === commentId);
                    if(comment && data) 
                        {
                        comment.likes = data.likes;
                        comment.dislikes = data.dislikes;
                    }
                });
            });
    }
});

export const { clearError } = comments_slice.actions;
export default comments_slice.reducer;
