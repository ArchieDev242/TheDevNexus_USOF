import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetch_posts } from '../../redux/slices/postsSlice';
import { fetch_categories } from '../../redux/slices/categoriesSlice';
import Header from '../Header/Header';
import Hero from '../Hero';
import TrendingPosts from '../TrendingPosts';
import CategoriesGrid from '../CategoriesGrid';
import CommunityHighlights from '../CommunityHighlights';
import Footer from '../Footer';
import './home.css';

export default function HomePage() 
{
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetch_posts());
        dispatch(fetch_categories());
    }, [dispatch]);
    
    return (
        <div className = "home-page">
            <div className = "animated-background"></div>
            <Header />
            <Hero />
            <TrendingPosts />
            <CategoriesGrid />
            <CommunityHighlights />
            <Footer />
        </div>
    );
}
