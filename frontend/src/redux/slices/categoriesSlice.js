import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetch_categories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to fetch categories');
            // Support both legacy and new API shapes
            // legacy: { status, data: Category[] }
            // new: { status, data: { categories: Category[], total_active_posts: number } }
            if (Array.isArray(data?.data)) {
                return { categories: data.data, total_active_posts: undefined };
            }
            if (data?.data && typeof data.data === 'object') {
                return { 
                    categories: data.data.categories || [], 
                    total_active_posts: data.data.total_active_posts
                };
            }
            // Fallback if server returned raw array
            if (Array.isArray(data)) {
                return { categories: data, total_active_posts: undefined };
            }
            return { categories: [], total_active_posts: undefined };
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const fetch_category_by_id = createAsyncThunk(
    'categories/fetchById',
    async (categoryId, { rejectWithValue }) => {
        try 
        {
            const response = await fetch(`/api/categories/${categoryId}`);
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to fetch category');
            
            return data.data || data;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const categories_slice = createSlice({
    name: 'categories',
    initialState: 
    {
        categories: [],
        totalActivePosts: 0,
        currentCategory: null,
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
            // categories
            .addCase(fetch_categories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetch_categories.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload || {};
                state.categories = payload.categories || [];
                if (typeof payload.total_active_posts === 'number') {
                    state.totalActivePosts = payload.total_active_posts;
                }
            })
            .addCase(fetch_categories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // category by ID
            .addCase(fetch_category_by_id.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetch_category_by_id.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCategory = action.payload;
            })
            .addCase(fetch_category_by_id.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = categories_slice.actions;
export default categories_slice.reducer;
