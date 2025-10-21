import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../redux/slices/authSlice';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiLogIn } from 'react-icons/fi';
import Header from '../components/Header';
import '../style/auth.css';

export default function RegisterPage() 
{
    const [form_data, set_form_data] = useState({
        login: '',
        email: '',
        password: '',
        password_confirmation: '',
        full_name: ''
    });
    const [show_password, set_show_password] = useState(false);
    const [show_confirm_password, set_show_confirm_password] = useState(false);
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
        
        if(form_data.password !== form_data.password_confirmation) 
            {
            alert('Passwords do not match!');

            return;
        }
        
        const result = await dispatch(register(form_data));
        
        if(result.type === 'auth/register/fulfilled') navigate('/login');
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
                        <h1 className = "auth-title gradient-text">REGISTER</h1>
                        <p className = "auth-subtitle">JOIN THE NEXUS</p>
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
                                <FiUser /> USERNAME
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = "text"
                                    id = "login"
                                    name = "login"
                                    value = {form_data.login}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder="Choose your username"
                                    required
                                />
                                <div className = "input-glow"></div>
                            </div>
                        </div>
                        
                        <div className = "form-group">
                            <label htmlFor = "full_name" className = "form-label">
                                <FiUser /> FULL NAME
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = "text"
                                    id = "full_name"
                                    name = "full_name"
                                    value = {form_data.full_name}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = "Enter your full name"
                                    required
                                />
                                <div className = "input-glow"></div>
                            </div>
                        </div>

                        <div className = "form-group">
                            <label htmlFor = "email" className = "form-label">
                                <FiMail /> EMAIL
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = "email"
                                    id = "email"
                                    name = "email"
                                    value = {form_data.email}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = "Enter your email"
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
                                    placeholder = "Create a password"
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

                        <div className = "form-group">
                            <label htmlFor = "password_confirmation" className = "form-label">
                                <FiLock /> CONFIRM PASSWORD
                            </label>
                            <div className = "input-wrapper">
                                <input
                                    type = {show_confirm_password ? "text" : "password"}
                                    id = "password_confirmation"
                                    name = "password_confirmation"
                                    value = {form_data.password_confirmation}
                                    onChange = {handle_change}
                                    className = "form-input"
                                    placeholder = "Confirm your password"
                                    required
                                />
                                <button
                                    type = "button"
                                    className = "password-toggle"
                                    onClick = {() => set_show_confirm_password(!show_confirm_password)}
                                >
                                    {show_confirm_password ? <FiEyeOff /> : <FiEye />}
                                </button>
                                <div className = "input-glow"></div>
                            </div>
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
                                    <FiUserPlus /> CREATE ACCOUNT
                                </>
                            )}
                        </button>

                        <div className = "auth-divider">
                            <span>OR</span>
                        </div>

                        <Link to = "/login" className = "btn btn-game-outline">
                            <FiLogIn /> LOGIN
                        </Link>
                    </form>

                    <div className = "auth-footer">
                        <p>Already have an account? <Link to="/login">Login here!</Link></p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
