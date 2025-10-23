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

            let enrichedUser = data.user;

            try 
            {
                const me_response = await fetch('/api/users/me', {
                    credentials: 'include'
                });

                if(me_response.ok) 
                {
                    const me_data = await me_response.json();
                    enrichedUser = me_data.data || me_data;
                }
            } catch(fetch_error) 
            {
                console.error('Failed to refresh user after login:', fetch_error);
            }

            return { ...data, user: enrichedUser };
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
            const payload = await response.json().catch(() => null);

            if(response.status === 401) 
            {
                return { authenticated: false, user: null };
            }

            if(!response.ok) 
            {
                const message = payload?.message || payload?.error || 'Failed to fetch current user';
                return rejectWithValue(message);
            }

            return { authenticated: true, user: payload?.data || payload };
        } catch(error) 
        {
            console.error('Error fetching current user:', error);
            return rejectWithValue(error.message);
        }
    }
);

const auth_slice = createSlice({
    name: 'auth',
    initialState: 
    {
        user: null,
        isAuthenticated: false,
        loading: true,
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
                const user_data = action.payload?.user;
                state.user = user_data ? { ...user_data, avatar: user_data.avatar || user_data.profile_picture || null } : null;
                state.error = null;
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
                state.error = null;
            })
            .addCase(fetch_current_user.fulfilled, (state, action) => {
                state.loading = false;
                if(action.payload?.authenticated && action.payload.user) 
                {
                    const user_data = action.payload.user;
                    state.user = { ...user_data, avatar: user_data.avatar || user_data.profile_picture || null };
                    state.isAuthenticated = true;
                } else if(action.payload && action.payload.authenticated === false) 
                {
                    state.user = null;
                    state.isAuthenticated = false;
                }
            })
            .addCase(fetch_current_user.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error?.message || null;
                if(!state.user) 
                {
                    state.isAuthenticated = false;
                }
            });
    }
});

export const { clearError } = auth_slice.actions;
export default auth_slice.reducer;
