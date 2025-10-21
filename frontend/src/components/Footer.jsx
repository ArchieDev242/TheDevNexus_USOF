import React from 'react';
import { FiTwitter, FiGithub, FiYoutube, FiMessageCircle } from 'react-icons/fi';

export default function Footer() 
{
    
    return (
        <footer className = "site-footer">
            <div className = "container">
                <div className = "footer-grid">
                    <div className = "footer-col">
                        <h3 className = "footer-logo gradient-text">TheDevNexus</h3>
                        <p className = "footer-description">
                            The ultimate hub for game developers and tech enthusiasts to connect, learn, and create.
                        </p>
                    </div>
                    
                    <div className = "footer-col">
                        <h4 className = "footer-heading">Quick Links</h4>
                        <ul className = "footer-links">
                            <li><a href = "/">Home</a></li>
                            <li><a href = "/posts">Forums</a></li>
                            <li><a href = "/categories">Categories</a></li>
                            <li><a href = "/about">About</a></li>
                        </ul>
                    </div>
                    
                    <div className = "footer-col">
                        <h4 className = "footer-heading">Categories</h4>
                        <ul className = "footer-links">
                            <li><a href = "/category/gamedev">Game Dev</a></li>
                            <li><a href = "/category/programming">Programming</a></li>
                            <li><a href = "/category/design">Art & Design</a></li>
                            <li><a href = "/category/career">Career</a></li>
                        </ul>
                    </div>
                    
                    <div className = "footer-col">
                        <h4 className = "footer-heading">Connect</h4>
                        <div className = "social-links">
                            <a href = "#" className = "social-link" aria-label = "Twitter">
                                <FiTwitter />
                            </a>
                            <a href = "#" className = "social-link" aria-label = "GitHub">
                                <FiGithub />
                            </a>
                            <a href = "#" className = "social-link" aria-label = "YouTube">
                                <FiYoutube />
                            </a>
                            <a href = "#" className = "social-link" aria-label = "Discord">
                                <FiMessageCircle />
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className = "footer-bottom">
                    <p>© 2025 TheDevNexus. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
