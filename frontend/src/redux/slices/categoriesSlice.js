import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetch_categories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.message || 'Failed to fetch categories');
            
            return data.data || data;
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
            // Fetch categories
            .addCase(fetch_categories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetch_categories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetch_categories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch category by ID
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
