import React from 'react';
import 
{  
    FiCode, 
    FiUsers, 
    FiHeart,
    FiTrendingUp,
    FiMessageCircle,
    FiBook,
    FiZap,
    FiGlobe,
    FiStar,
    FiMonitor,
    FiCpu,
    FiBox,
    FiFileText,
    FiTarget,
    FiTool,
    FiLayers
} from 'react-icons/fi';
import { SiUnrealengine, SiUnity, SiGodotengine } from 'react-icons/si';

import Header from '../components/Header';
import '../style/about.css';

export default function AboutPage() 
{
    const engines = [
        { name: 'Unreal Engine', icon: <SiUnrealengine /> },
        { name: 'Unity', icon: <SiUnity /> },
        { name: 'Godot', icon: <SiGodotengine /> },
        { name: "Ren'Py", icon: <FiFileText /> },
        { name: 'GameMaker', icon: <FiTarget /> },
        { name: 'CryEngine', icon: <FiZap /> },
        { name: 'Custom Engines', icon: <FiTool /> },
        { name: 'OpenGL / Vulkan', icon: <FiLayers /> }
    ];

    const features = [
        {
            icon: <FiUsers />,
            title: 'Ukrainian Community',
            description: 'Forum created for Ukrainian audience of game and mod developers'
        },
        {
            icon: <FiCode />,
            title: 'For All Levels',
            description: 'From beginners to professionals - everyone will find something interesting'
        },
        {
            icon: <FiBook />,
            title: 'Knowledge Base',
            description: 'Tutorials, guides and solutions to common problems from the community'
        },
        {
            icon: <FiMessageCircle />,
            title: 'Active Discussions',
            description: 'Discussions about technologies, practices and trends in game development'
        },
        {
            icon: <FiZap />,
            title: 'Quick Help',
            description: 'Get answers to your questions from experienced developers'
        },
        {
            icon: <FiHeart />,
            title: 'Open Source',
            description: 'We support the culture of open source and collaborative development'
        }
    ];

    return (
        <>
            <Header />
            <div className = "about-page">
                <div className = "container">
                    {/* Hero Section */}
                    <section className = "about-hero">
                        <h1 className = "gradient-text">
                            About TheDevNexus
                        </h1>
                        <p className = "hero-subtitle">
                            Ukrainian Forum for Game and Mod Developers
                        </p>
                        <div className = "hero-description">
                            <p>
                                TheDevNexus is a community created for Ukrainian video game 
                                and modification developers. We unite professionals and enthusiasts 
                                who work with popular game engines or create their own technologies.
                            </p>
                        </div>
                    </section>

                    {/* Mission Section */}
                    <section className = "about-mission">
                        <div className = "mission-card">
                            <div className = "mission-icon">
                                <FiGlobe size = {48} />
                            </div>
                            <h2 className = "gradient-text">Our Mission</h2>
                            <p>
                                To create the largest Ukrainian-language platform for sharing knowledge, 
                                experience and ideas in the field of video game development. We strive to support 
                                and develop the Ukrainian gamedev community by providing space for 
                                learning, collaboration and professional growth.
                            </p>
                        </div>
                    </section>

                    {/* Target Audience */}
                    <section className = "about-audience">
                        <h2 className = "section-title">
                            <span className = "gradient-text">Who Is This Forum For?</span>
                        </h2>
                        <div className = "audience-grid">
                            <div className = "audience-card">
                                <div className = "audience-icon"><FiMonitor size={48} /></div>
                                <h3>Game Developers</h3>
                                <p>
                                    Programmers, designers, artists and other specialists 
                                    working on creating video games
                                </p>
                            </div>
                            <div className = "audience-card">
                                <div className = "audience-icon"><FiCpu size={48} /></div>
                                <h3>Modders</h3>
                                <p>
                                    Enthusiasts who create modifications for their favorite games 
                                    and expand their capabilities
                                </p>
                            </div>
                            <div className = "audience-card">
                                <div className = "audience-icon"><FiBox size={48} /></div>
                                <h3>Engine Engineers</h3>
                                <p>
                                    Geeks who write their own game engines from scratch 
                                    or using OpenGL/Vulkan
                                </p>
                            </div>
                            <div className = "audience-card">
                                <div className = "audience-icon"><FiBook size={48} /></div>
                                <h3>Beginners</h3>
                                <p>
                                    Those who are just starting their journey in gamedev and looking for 
                                    advice and support
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Supported Engines */}
                    <section className = "about-engines">
                        <h2 className = "section-title">
                            <span className = "gradient-text">Supported Technologies</span>
                        </h2>
                        <p className = "engines-description">
                            Our forum covers a wide range of game engines and technologies
                        </p>
                        <div className = "engines-grid">
                            {engines.map((engine, index) => (
                                <div key = {index} className = "engine-card">
                                    <div className = "engine-icon">{engine.icon}</div>
                                    <h4>{engine.name}</h4>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features */}
                    <section className = "about-features">
                        <h2 className = "section-title">
                            <span className = "gradient-text">What Do We Offer?</span>
                        </h2>
                        <div className = "features-grid">
                            {features.map((feature, index) => (
                                <div key = {index} className = "feature-card">
                                    <div className = "feature-icon">
                                        {feature.icon}
                                    </div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stats */}
                    <section className = "about-stats">
                        <div className = "stats-grid">
                            <div className = "stat-card">
                                <FiUsers size = {40} />
                                <h3 className = "stat-number">500+</h3>
                                <p>Active Users</p>
                            </div>
                            <div className = "stat-card">
                                <FiMessageCircle size = {40} />
                                <h3 className = "stat-number">1000+</h3>
                                <p>Discussions</p>
                            </div>
                            <div className = "stat-card">
                                <FiStar size = {40} />
                                <h3 className = "stat-number">8</h3>
                                <p>Game Engines</p>
                            </div>
                            <div className = "stat-card">
                                <FiTrendingUp size = {40} />
                                <h3 className = "stat-number">100%</h3>
                                <p>Ukrainian Language</p>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className = "about-cta">
                        <div className = "cta-content">
                            <h2 className = "gradient-text">Join The Community!</h2>
                            <p>
                                Become part of the Ukrainian gamedev community. Share your experience, 
                                learn from the best and create amazing games together!
                            </p>
                            <div className = "cta-buttons">
                                <a href = "/register" className = "btn btn-gradient">
                                    Sign Up
                                </a>
                                <a href = "/posts" className = "btn btn-outline">
                                    View Posts
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
