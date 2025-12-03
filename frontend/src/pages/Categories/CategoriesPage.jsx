import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 
{ 
    FiUsers,
    FiBook,
    FiImage,
    FiMessageCircle,
    FiPackage,
    FiZap,
    FiFileText
} from 'react-icons/fi';

import { SiUnrealengine, SiUnity, SiGodotengine, SiPython, SiVulkan, SiCryengine, SiGamemaker } from 'react-icons/si';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer'
import '../../components/CategoriesGrid/categories.css';

export default function CategoriesPage() 
{
    const navigate = useNavigate();
    const [categories, set_categories] = useState([]);
    const [loading, set_loading] = useState(true);

    // Game Engines Categories
    const engine_categories = [
        { 
            id: 'unreal-engine',
            name: 'Unreal Engine', 
            icon: <SiUnrealengine />,
            color: '#0E1128',
            description: 'Discussions about Unreal Engine development, blueprints, and C++'
        },
        { 
            id: 'unity',
            name: 'Unity', 
            icon: <SiUnity />,
            color: '#000000',
            description: 'Unity game development, C# scripting, and asset store resources'
        },
        { 
            id: 'godot',
            name: 'Godot', 
            icon: <SiGodotengine />,
            color: '#478CBF',
            description: 'Open-source Godot engine, GDScript, and 2D/3D development'
        },
        { 
            id: 'renpy',
            name: "Ren'Py", 
            icon: <SiPython />,
            color: '#FF7F7F',
            description: 'Visual novel creation with Ren\'Py engine and Python scripting'
        },
        { 
            id: 'gamemaker',
            name: 'GameMaker', 
            icon: <SiGamemaker />,
            color: '#8BC34A',
            description: '2D game development with GameMaker Studio and GML'
        },
        { 
            id: 'cryengine',
            name: 'CryEngine', 
            icon: <SiCryengine />,
            color: '#000000',
            description: 'CryEngine development, advanced graphics, and AAA quality games'
        },
        { 
            id: 'custom-engines',
            name: 'Custom Engines', 
            icon: <SiVulkan />,
            color: '#FF6584',
            description: 'Building your own game engines from scratch, often based on OpenGL/Vulkan'
        }
    ];

    const additional_categories = [
        {
            id: 'tutorials',
            name: 'Tutorials & Learning',
            icon: <FiBook />,
            color: '#10B981',
            description: 'Educational content, guides, and learning resources for game development'
        },
        {
            id: 'showcase',
            name: 'Showcase',
            icon: <FiImage />,
            color: '#F59E0B',
            description: 'Show off your games, mods, and projects to the community'
        },
        {
            id: 'general',
            name: 'General Discussion',
            icon: <FiMessageCircle />,
            color: '#8B5CF6',
            description: 'Off-topic discussions, community events, and general gamedev talk'
        },
        {
            id: 'resources',
            name: 'Resources',
            icon: <FiPackage />,
            color: '#EC4899',
            description: 'Assets, tools, plugins, and other useful gamedev resources'
        }
    ];

    useEffect(() => {
        const fetch_categories = async () => {
            try {
                set_loading(true);
                const response = await fetch('/api/categories', { credentials: 'include' });
                const data = await response.json();
                if (data.status === 'success') {
                    if (Array.isArray(data.data)) {
                        set_categories(data.data);
                    } else if (data.data && typeof data.data === 'object') {
                        set_categories(data.data.categories || []);
                    }
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                set_loading(false);
            }
        };
        fetch_categories();
    }, []);

    const categoriesByName = useMemo(() => {
        const map = new Map();
        for (const c of categories) {
            if (c?.title) map.set(c.title.toLowerCase(), c);
        }
        return map;
    }, [categories]);

    const handle_category_click = (displayName) => {
        const backend = categoriesByName.get(String(displayName).toLowerCase());
        if (backend?.id) {
            navigate(`/posts?category=${encodeURIComponent(String(backend.id))}`);
        }
    };

    return (
        <>
            <Header />
            <div className = "categories-page">
                <div className = "container">
                    {/* Hero Section */}
                    <div className = "categories-hero">
                        <h1 className = "gradient-text">Categories</h1>
                        <p className = "hero-subtitle-categories">
                            Explore different categories of game development discussions
                        </p>
                    </div>

                    {/* Game Engines Section */}
                    <section className = "categories-section">
                        <div className = "section-header">
                            <h2 className = "section-title">
                                <FiZap className = "section-icon" />
                                <span className = "gradient-text">Game Engines</span>
                            </h2>
                            <p className = "section-description">
                                Choose your preferred game engine and join the discussion
                            </p>
                        </div>

                        <div className = "categories-grid">
                            {engine_categories.map(category => {
                                const backend = categoriesByName.get(category.name.toLowerCase());
                                const count = backend?.posts_count ?? 0;
                                return (
                                <div 
                                    key = {category.id}
                                    className = "category-card"
                                    onClick = {() => handle_category_click(category.name)}
                                    style = {{ '--category-color': category.color }}
                                >
                                    <div className = "category-icon-wrapper">
                                        {category.icon}
                                    </div>
                                    <div className = "category-content">
                                        <h3 className = "category-name">{category.name}</h3>
                                        <p className = "category-description">{category.description}</p>
                                        <div className = "category-stats">
                                            <div className = "stat-item">
                                                <FiFileText />
                                                <span>{count}</span>
                                            </div>
                                            <div className = "stat-item">
                                                <FiUsers />
                                                <span>{Math.floor(Math.random() * 200) + 50}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );})}
                        </div>
                    </section>

                    {/* Additional Categories Section */}
                    <section className = "categories-section">
                        <div className = "section-header">
                            <h2 className = "section-title">
                                <FiPackage className = "section-icon" />
                                <span className = "gradient-text">Community</span>
                            </h2>
                            <p className = "section-description">
                                Share, learn, and discuss with the gamedev community
                            </p>
                        </div>

                        <div className = "categories-grid additional">
                            {additional_categories.map(category => {
                                const backend = categoriesByName.get(category.name.toLowerCase());
                                const count = backend?.posts_count ?? 0;
                                return (
                                <div
                                    key = {category.id}
                                    className = "category-card"
                                    onClick = {() => handle_category_click(category.name)}
                                    style = {{ '--category-color': category.color }}
                                >
                                    <div className = "category-icon-wrapper">
                                        {category.icon}
                                    </div>
                                    <div className = "category-content">
                                        <h3 className = "category-name">{category.name}</h3>
                                        <p className = "category-description">{category.description}</p>
                                        <div className = "category-stats">
                                            <div className = "stat-item">
                                                <FiFileText />
                                                <span>{count}</span>
                                            </div>
                                            <div className = "stat-item">
                                                <FiUsers />
                                                <span>{Math.floor(Math.random() * 300) + 100}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );})}
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className = "categories-stats">
                        <div className = "stats-card">
                            <div className = "stat-icon">
                                <FiFileText />
                            </div>
                            <div className = "stat-info">
                                <h3>{categories.reduce((sum, c) => sum + (Number(c.posts_count) || 0), 0)}</h3>
                                <p>Total Posts</p>
                            </div>
                        </div>
                        <div className = "stats-card">
                            <div className = "stat-icon">
                                <FiUsers />
                            </div>
                            <div className = "stat-info">
                                <h3>{engine_categories.length + additional_categories.length}</h3>
                                <p>Categories</p>
                            </div>
                        </div>
                        <div className = "stats-card">
                            <div className = "stat-icon">
                                <FiMessageCircle />
                            </div>
                            <div className = "stat-info">
                                <h3>500+</h3>
                                <p>Active Users</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}
