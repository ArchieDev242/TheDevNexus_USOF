import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const login = createAsyncThunk(
    'auth/login',
    async ({ login, password }, { rejectWithValue }) => {
        try 
        {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ loginOrEmail: login, password })
            });

            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.error || 'Login failed');
            
            return data;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try 
        {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            
            if(!response.ok) return rejectWithValue(data.error || 'Registration failed');
            
            return data;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try 
        {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            return null;
        } catch(error) 
        {
            return rejectWithValue(error.message);
        }
    }
);

export const fetch_current_user = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try 
        {
            const response = await fetch('/api/users/me', {
                credentials: 'include'
            });
            
            if(!response.ok) 
            {
                // Return null instead of rejecting, so it doesn't clear auth state
                return null;
            }
            
            const data = await response.json();
            console.log('fetch_current_user response:', data.data || data);
            return data.data || data;
        } catch(error) 
        {
            // Return null on error instead of rejecting
            console.error('Error fetching current user:', error);
            return null;
        }
    }
);

const auth_slice = createSlice({
    name: 'auth',
    initialState: 
    {
        user: null,
        isAuthenticated: false,
        loading: true, // Start with true to prevent redirect during initial load
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
            // login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(fetch_current_user.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetch_current_user.fulfilled, (state, action) => {
                state.loading = false;
                if(action.payload) 
                {
                    state.user = action.payload;
                    state.isAuthenticated = true;
                } else {
                    // User not authenticated
                    state.user = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(fetch_current_user.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            });
    }
});

export const { clearError } = auth_slice.actions;
export default auth_slice.reducer;
