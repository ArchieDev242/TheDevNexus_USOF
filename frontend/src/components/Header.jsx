import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import 
{ 
    FiHome, 
    FiMessageSquare, 
    FiGrid, 
    FiInfo, 
    FiFileText, 
    FiSearch, 
    FiBell, 
    FiChevronDown, 
    FiUser, 
    FiSettings, 
    FiLogOut, 
    FiLogIn, 
    FiUserPlus, 
    FiMenu,
    FiBookmark
} from 'react-icons/fi';

import logo from '../images/logo.png';

export default function Header() 
{
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [is_menu_open, set_is_menu_open] = useState(false);
    
    return (
        <header className = "site-header">
            <div className = "container">
                <div className = "header-wrapper">
                    <div className = "header-left">
                        <a href = "/" className = "logo">
                            <img src = {logo} alt = "TheDevNexus Logo" className = "logo-image" />
                            <h3 className = "gradient-text">TheDevNexus</h3>
                        </a>
                        
                        <nav className = "main-nav" aria-label = "Main navigation">
                            <ul className = "nav-list">
                                <li className = 'nav-list__item'>
                                    <a href = "/">
                                        <FiHome />
                                        <span>Home</span>
                                    </a>
                                </li>
                                <li className = 'nav-list__item'>
                                    <a href = "/posts">
                                        <FiMessageSquare />
                                        <span>Forums</span>
                                    </a>
                                </li>
                                <li className = 'nav-list__item'>
                                    <a href = "/categories">
                                        <FiGrid />
                                        <span>Categories</span>
                                    </a>
                                </li>
                                <li className = 'nav-list__item'>
                                    <a href = "/about">
                                        <FiInfo />
                                        <span>About</span>
                                    </a>
                                </li>
                                <li className = 'nav-list__item'>
                                    <a href = "/posts">
                                        <FiFileText />
                                        <span>Posts</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    
                    <div className = "header-right">
                        <form className = 'search' action = '/search' method = 'GET'>
                            <input className = 'search__input' type = 'text' name = 'query' placeholder = 'Search...' />
                            <button className = 'search__button' type = 'submit' aria-label = 'Search'>
                                <FiSearch />
                            </button>
                        </form>
                        
                        <div className = "header-actions">
                            {isAuthenticated ? (
                                <>
                                    <a href="/saved" className = "icon-btn" aria-label = "Saved Posts">
                                        <FiBookmark />
                                    </a>
                                    <button className = "icon-btn" aria-label = "Notifications">
                                        <FiBell />
                                        <span className = "notification-badge">3</span>
                                    </button>
                                    <div className = "user-menu-wrapper">
                                        <button 
                                            className = "user-menu-btn"
                                            onClick = {() => set_is_menu_open(!is_menu_open)}
                                        >
                                            <div className = "user-avatar">
                                                {user?.avatar ? (
                                                    <img 
                                                        src = {user.avatar} 
                                                        alt = {user?.login} 
                                                        style = {{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                    />
                                                ) : (
                                                    <img 
                                                        src = "/user/avatar.jpg" 
                                                        alt = {user?.login} 
                                                        style = {{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                    />
                                                )}
                                            </div>
                                            <span className = "user-name">{user?.login || 'User'}</span>
                                            <FiChevronDown />
                                        </button>
                                        
                                        {is_menu_open && (
                                            <div className = "user-dropdown">
                                                <Link to = "/profile" className = "dropdown-item">
                                                    <FiUser />
                                                    <span>Profile</span>
                                                </Link>
                                                <a href = "/settings" className = "dropdown-item">
                                                    <FiSettings />
                                                    <span>Settings</span>
                                                </a>
                                                <hr className = "dropdown-divider" />
                                                <button className = "dropdown-item logout-btn">
                                                    <FiLogOut />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className = "auth-buttons">
                                    <Link to = "/login" className = "btn btn-outline">
                                        <FiLogIn />
                                        <span>Login</span>
                                    </Link>
                                    <Link to = "/register" className = "btn btn-gradient">
                                        <FiUserPlus />
                                        <span>Sign Up</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                        
                        <button className = "mobile-menu-btn" aria-label = "Toggle menu">
                            <FiMenu />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}