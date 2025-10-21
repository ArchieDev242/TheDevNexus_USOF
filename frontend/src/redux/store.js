import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import commentsReducer from './slices/commentsSlice';
import categoriesReducer from './slices/categoriesSlice';

export const store = configureStore({
    reducer: 
    {
        auth: authReducer,
        posts: postsReducer,
        comments: commentsReducer,
        categories: categoriesReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export default store;
