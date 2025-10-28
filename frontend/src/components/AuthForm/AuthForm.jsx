import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearError } from '../../redux/slices/authSlice';

export default function auth_form() 
{
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    
    const [is_login, set_is_login] = useState(true);
    const [form_data, set_form_data] = useState({
        login: '',
        password: '',
        pass_confirm: '',
        full_name: '',
        email: ''
    });

    const handle_change = (e) => {
        set_form_data({
            ...form_data,
            [e.target.name]: e.target.value
        });
    };

    const handle_submit = (e) => {
        e.preventDefault();
        
        if(is_login) 
            {
            dispatch(login({
                login: form_data.login,
                password: form_data.password
            }));
        } else 
            {
            dispatch(register(form_data));
        }
    };

    const toggle_mode = () => {
        set_is_login(!is_login);
        dispatch(clearError());
    };

    return (
        <div className = "auth-form">
            <h2>{is_login ? 'Login' : 'Register'}</h2>
            
            {error && <div className = "error">{error}</div>}
            
            <form onSubmit = {handle_submit}>
                <input
                    type = "text"
                    name = "login"
                    placeholder = "Login"
                    value = {form_data.login}
                    onChange = {handle_change}
                    required
                />
                
                {!is_login && (
                    <>
                        <input
                            type = "text"
                            name = "full_name"
                            placeholder = "Full Name"
                            value = {form_data.full_name}
                            onChange = {handle_change}
                            required
                        />
                        <input
                            type = "email"
                            name = "email"
                            placeholder = "Email"
                            value = {form_data.email}
                            onChange = {handle_change}
                            required
                        />
                    </>
                )}
                
                <input
                    type = "password"
                    name = "password"
                    placeholder = "Password"
                    value = {form_data.password}
                    onChange = {handle_change}
                    required
                />
                
                {!is_login && (
                    <input
                        type = "password"
                        name = "passwordConfirm"
                        placeholder = "Confirm Password"
                        value = {form_data.pass_confirm}
                        onChange = {handle_change}
                        required
                    />
                )}
                
                <button type = "submit" disabled = {loading}>
                    {loading ? 'Loading...' : (is_login ? 'Login' : 'Register')}
                </button>
            </form>

            <button onClick = {toggle_mode} className = "toggle-btn">
                {is_login ? 'Need an account? Register' : 'Have an account? Login'}
            </button>
        </div>
    );
}
