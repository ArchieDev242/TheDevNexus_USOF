import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetch_posts } from '../../redux/slices/postsSlice';

import '../PostsList/PostList.css';

export default function posts_list() 
{
    const dispatch = useDispatch();
    const { posts, loading, error } = useSelector((state) => state.posts);
    
    useEffect(() => {
        dispatch(fetch_posts());
    }, [dispatch]);
    
    if(loading) return <div>Loading posts...</div>;
    if(error) return <div>Error: {error}</div>;
    
    return (
        <div className = "posts-list">
            <h2>Posts</h2>
            {posts.length === 0 ? (
                <p>No posts yet</p>
            ) : (
                posts.map(post => (
                    <div key = {post.id} className = "post-item">
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        <div className = "post-meta">
                            <span>By: {post.author}</span>
                            <span>Likes: {post.likes || 0}</span>
                            <span>Comments: {post.comments_count || 0}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
