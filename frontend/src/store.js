import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk('users/fetch', async () => {
    const res = await fetch('/api/users?limit=1');
    if (!res.ok) throw new Error('API error ' + res.status);
    return res.json();
});

const appSlice = createSlice({
    name: 'app',
    initialState: { apiStatus: 'idle', usersCount: null, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => { state.apiStatus = 'checking...'; state.error = null; })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.apiStatus = 'OK';
                const arr = Array.isArray(action.payload?.data) ? action.payload.data : [];
                state.usersCount = arr.length;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.apiStatus = 'unreachable';
                state.error = action.error?.message || 'Unknown error';
            })
    }
});

export const store = configureStore({
    reducer: {
        app: appSlice.reducer
    }
});
