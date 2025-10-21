import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) 
{
    const { isAuthenticated, loading } = useSelector(state => state.auth);
    
    // Show loading while checking authentication
    if(loading) 
        {
        return (
            <div style = {{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'var(--dark, #0a0a0f)',
                color: 'var(--text, white)'
            }}>
                <div>Loading...</div>
            </div>
        );
    }
    
    if(!isAuthenticated) return <Navigate to = "/login" replace />;
    
    return children;
}
