import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { create_post } from '../../redux/slices/postsSlice';

export default function create_post_form() 
{
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [title, set_title] = useState('');
    const [content, set_content] = useState('');
    const [categories, set_categories] = useState([]);
    
    if(!isAuthenticated) return <div>Please login to create a post</div>;
    
    const handle_submit = (e) => {
        e.preventDefault();
        
        dispatch(create_post({
            title,
            content,
            categories
        }));
        
        set_title('');
        set_content('');
        set_categories([]);
    };
    
    return (
        <div className = "create-post-form">
            <h2>Create New Post</h2>
            <form onSubmit = {handle_submit}>
                <input
                    type = "text"
                    placeholder = "Title"
                    value = {title}
                    onChange = {(e) => set_title(e.target.value)}
                    required
                />
                <textarea
                    placeholder = "Content"
                    value = {content}
                    onChange = {(e) => set_content(e.target.value)}
                    rows = "10"
                    required
                />
                <button type = "submit">Create Post</button>
            </form>
        </div>
    );
}
