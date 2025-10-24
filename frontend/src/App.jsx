import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import CategoriesPage from './pages/CategoriesPage';
import SavedPostsPage from './pages/SavedPostsPage';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() 
{
    return (
        <Router>
            <Routes>
                <Route path = "/" element = {<HomePage />} />
                <Route path = "/posts" element = {<PostsPage />} />
                <Route path = "/posts/:post_id" element = {<PostDetailPage />} />
                <Route path = "/users/:userId" element = {<UserProfilePage />} />
                <Route path = "/about" element = {<AboutPage />} />
                <Route path = "/categories" element = {<CategoriesPage />} />
                <Route path = "/login" element = {
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />
                <Route path = "/register" element = {
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                } />
                <Route path = "/profile" element = {
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path = "/settings" element = {
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                } />
                <Route path = "/saved-posts" element = {
                    <ProtectedRoute>
                        <SavedPostsPage />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}