import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    SiVulkan,
    SiCryengine,
    SiGamemaker
} from 'react-icons/si';

import { FiFolder } from 'react-icons/fi';

export default function CategoriesGrid() 
{
    const { categories, loading } = useSelector(state => state.categories);
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const category_icons = {
        'Game Development': FaGamepad,
        'Programming': FaCode,
        'Unity': FaUnity,
        'Unreal Engine': SiUnrealengine,
        'Godot': SiGodotengine,
        'Godot Engine': SiGodotengine,
        "Ren'Py": SiPython,
        'GameMaker': SiGamemaker,
        'CryEngine': SiCryengine,
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
                    <span className = "gradient-text">{t('categories.title')}</span>
                </h2>
                
                <div className = "categories-grid">
                    {loading ? (
                        <p>{t('common.loading')}</p>
                    ) : categories.length > 0 ? (
                        categories.map((category) => {
                            const IconComponent = category_icons[category.title] || FiFolder;
                            return (
                                <div 
                                    key = {category.id} 
                                    className = "category-card"
                                    onClick = {() => navigate(`/posts?category=${encodeURIComponent(String(category.id))}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className = "category-icon">
                                        <IconComponent />
                                    </div>
                                    <h3 className = "category-name">{category.title}</h3>
                                    <p className = "category-description">
                                        {category.description?.substring(0, 80) || t('categories.select_category')}
                                    </p>
                                    <div className = "category-stats">
                                        <FaBook />
                                        <span>{t('categories.posts_count', { count: category.posts_count ?? 0 })}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>{t('categories.no_categories')}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
