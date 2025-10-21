import React from 'react';
import { useSelector } from 'react-redux';

export default function Hero({ isAuthenticated }) 
{
    return (
        <section className = "hero-section">
            <div className = "hero-content">
                <h1 className = "hero-title">
                    <span className = "gradient-text">TheDevNexus</span>
                </h1>
                <p className = "hero-subtitle">
                    Where game developers and tech enthusiasts unite to create, share, and learn together.
                </p>
                <div className = "hero-buttons">
                    {!isAuthenticated ? (
                        <>
                            <button className = "btn btn-primary">
                                Join the Community
                            </button>
                            <button className = "btn btn-outline">
                                Explore Forums
                            </button>
                        </>
                    ) : (
                        <>
                            <button className = "btn btn-primary">
                                Create New Post
                            </button>
                            <button className = "btn btn-outline">
                                Browse Categories
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className = "hero-background"></div>
        </section>
    );
}
