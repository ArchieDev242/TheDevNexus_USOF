import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostsPage from './pages/PostsPage';
import AboutPage from './pages/AboutPage';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() 
{
    return (
        <Router>
            <Routes>
                <Route path = "/" element = {<HomePage />} />
                <Route path = "/posts" element = {<PostsPage />} />
                <Route path = "/about" element = {<AboutPage />} />
                <Route path = "/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}