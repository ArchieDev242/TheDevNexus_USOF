import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PublicRoute({ children }) 
{
    const { isAuthenticated, loading } = useSelector(state => state.auth);
    
    if(loading) return null;
    
    if(isAuthenticated) return <Navigate to = "/" replace />;
    
    return children;
}
