import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../redux/slices/authSlice';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus } from 'react-icons/fi';
import Header from '../components/Header';
import '../style/auth.css';

export default function LoginPage() 
{
    const [form_data, set_form_data] = useState({
        login: '',
        password: ''
    });
    const [show_password, set_show_password] = useState(false);
    const [particles, set_particles] = useState([]);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(state => state.auth);
    
    useEffect(() => {
        const particle_array = [];
        
        for(let i = 0; i < 20; i++) 
            {
            particle_array.push({
                id: i,
                left: Math.random() * 100,
                animation_delay: Math.random() * 5,
                duration: 3 + Math.random() * 4
            });
        }
        set_particles(particle_array);
    }, []);
    
    const handle_change = (e) => {
        set_form_data({
            ...form_data,
            [e.target.name]: e.target.value
        });
    };
    
    const handle_submit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(form_data));
        
        if(result.type === 'auth/login/fulfilled') navigate('/');
    };
    
    return (
        <>
            <Header />
            <div className = "auth-page">
                <div className = "auth-background">
                    {particles.map(particle => (
                        <div
                            key = {particle.id}
                            className = "particle"
                            style = {{
                                left: `${particle.left}%`,
                                animationDelay: `${particle.animation_delay}s`,
                                animationDuration: `${particle.duration}s`
                            }}
                        />
                    ))}
                <div className = "grid-overlay"></div>
            </div>

            <div className = "auth-container">
                <div className = "auth-card">
                    <div className = "auth-header">
                        <div className = "pixel-corners"></div>
                        <h1 className = "auth-title gradient-text">LOGIN</h1>
                        <p className = "auth-subtitle">ENTER THE NEXUS</p>
                    </div>
                    
                    <form onSubmit = {handle_submit} className = "auth-form">
                        {error && (
                            <div className = "error-message">
                                <span className = "error-icon">⚠</span>
                                {error}
                            </div>
                        )}

                        <div className = "form-group">
                            <label htmlFor = "login" className = "form-label">
                                <FiUser /> USERNAME OR EMAIL
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = "text"
                                    id = "login"
                                    name = "login"
                                    value = {form_data.login}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = "Enter your username"
                                    required
                                />
                                <div className = "input-glow"></div>
                            </div>
                        </div>

                        <div className = "form-group">
                            <label htmlFor = "password" className = "form-label">
                                <FiLock /> PASSWORD
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = {show_password ? "text" : "password"}
                                    id = "password"
                                    name = "password"
                                    value = {form_data.password}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = "Enter your password"
                                    required
                                />
                                <button
                                    type = "button"
                                    className = "password-toggle"
                                    onClick = {() => set_show_password(!show_password)}
                                >
                                    {show_password ? <FiEyeOff /> : <FiEye />}
                                </button>
                                <div className = "input-glow"></div>
                            </div>
                        </div>

                        <div className = "form-footer">
                            <a href = "/forgot-password" className = "forgot-link">
                                Forgot Password?
                            </a>
                        </div>
                        
                        <button
                            type = "submit"
                            className = "btn btn-game"
                            disabled = {loading}
                        >
                            {loading ? (
                                <>
                                    <span className = "loading-spinner"></span>
                                    LOADING...
                                </>
                            ) : (
                                <>
                                    <FiLogIn /> LOGIN
                                </>
                            )}
                        </button>

                        <div className = "auth-divider">
                            <span>OR</span>
                        </div>

                        <Link to = "/register" className = "btn btn-game-outline">
                            <FiUserPlus /> CREATE ACCOUNT
                        </Link>
                    </form>

                    <div className = "auth-footer">
                        <p>New to TheDevNexus? <Link to = "/register">Join now!</Link></p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
