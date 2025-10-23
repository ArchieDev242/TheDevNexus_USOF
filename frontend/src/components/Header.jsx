import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
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
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [is_menu_open, set_is_menu_open] = useState(false);
    const [search_query, set_search_query] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const current_query = params.get('search') || '';
        set_search_query(current_query);
    }, [location.search]);

    // Close menu when clicking outside
    useEffect(() => {
        const handle_click_outside = (event) => {
            if (is_menu_open && !event.target.closest('.user-menu-wrapper')) {
                set_is_menu_open(false);
            }
        };

        if (is_menu_open) {
            document.addEventListener('mousedown', handle_click_outside);
        }

        return () => {
            document.removeEventListener('mousedown', handle_click_outside);
        };
    }, [is_menu_open]);

    const handle_search_submit = (event) => {
        event.preventDefault();
        const trimmed_query = search_query.trim();
        if(trimmed_query)
            {
            navigate({ pathname: '/posts', search: `?search=${encodeURIComponent(trimmed_query)}` });
        }
        else
            {
            navigate('/posts');
        }
    };

    const handle_logout = async () => {
        try {
            await dispatch(logout()).unwrap();
            set_is_menu_open(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    
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
                        <form className = 'search' onSubmit = {handle_search_submit} role = 'search'>
                            <input 
                                className = 'search__input'
                                type = 'text'
                                name = 'search'
                                placeholder = 'Search...'
                                value = {search_query}
                                onChange = {(event) => set_search_query(event.target.value)}
                            />
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
                                                <Link to = "/settings" className = "dropdown-item">
                                                    <FiSettings />
                                                    <span>Settings</span>
                                                </Link>
                                                <hr className = "dropdown-divider" />
                                                <button 
                                                    className = "dropdown-item logout-btn"
                                                    onClick = {handle_logout}
                                                >
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