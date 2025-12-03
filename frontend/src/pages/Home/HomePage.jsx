import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetch_posts } from '../../redux/slices/postsSlice';
import { fetch_categories } from '../../redux/slices/categoriesSlice';
import Header from '../../components/Header/Header';
import Hero from '../../components/Hero/Hero';
import TrendingPosts from '../../components/TrendingPosts/TrendingPosts';
import CategoriesGrid from '../../components/CategoriesGrid/CategoriesGrid';
import CommunityHighlights from '../../components/CommunityHighlights/CommunityHighlights';
import Footer from '../../components/Footer/Footer';
import './home.css';

export default function HomePage() 
{
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.auth);
    
    useEffect(() => {
        dispatch(fetch_posts());
        dispatch(fetch_categories());
    }, [dispatch]);
    
    return (
        <div className = "home-page">
            <div className = "animated-background"></div>
            <Header />
            <Hero isAuthenticated={isAuthenticated} />
            <TrendingPosts />
            <CategoriesGrid />
            <CommunityHighlights />
            <Footer />
        </div>
    );
}
