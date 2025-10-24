import React from 'react';
import { useSelector } from 'react-redux';
import 
{ 
    FaUnity,
    FaCode,
    FaPaintBrush,
    FaBriefcase,
    FaBook,
    FaGamepad,
    FaVrCardboard
} from 'react-icons/fa';

import 
{ 
    SiUnrealengine,
    SiGodotengine,
    SiPython,
    SiVulkan
} from 'react-icons/si';

import { FiFolder } from 'react-icons/fi';

export default function CategoriesGrid() 
{
    const { categories, loading } = useSelector(state => state.categories);
    
    const category_icons = {
        'Game Development': FaGamepad,
        'Programming': FaCode,
        'Unity': FaUnity,
        'Unreal Engine': SiUnrealengine,
        'Godot': SiGodotengine,
        'Godot Engine': SiGodotengine,
        "Ren'Py": SiPython,
        'Custom Engines': SiVulkan,
        'Custom Engine': SiVulkan,
        'Art & Design': FaPaintBrush,
        'VR/AR': FaVrCardboard,
        'Career': FaBriefcase,
        'Resources': FaBook
    };
    
    return (
        <section className = "categories-section">
            <div className = "container">
                <h2 className = "section-title centered">
                    <span className = "gradient-text">Explore Categories</span>
                </h2>
                
                <div className = "categories-grid">
                    {loading ? (
                        <p>Loading categories...</p>
                    ) : categories.length > 0 ? (
                        categories.map((category) => {
                            const IconComponent = category_icons[category.title] || FiFolder;
                            return (
                                <div key = {category.id} className = "category-card">
                                    <div className = "category-icon">
                                        <IconComponent />
                                    </div>
                                    <h3 className = "category-name">{category.title}</h3>
                                    <p className = "category-description">
                                        {category.description?.substring(0, 80) || 'Explore topics in this category'}
                                    </p>
                                    <div className = "category-stats">
                                        <FaBook />
                                        <span>{category.posts_count || 0} posts</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No categories available</p>
                    )}
                </div>
            </div>
        </section>
    );
}
