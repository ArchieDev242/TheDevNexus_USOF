import React from 'react';
import { useSelector } from 'react-redux';
import { FiMessageSquare, FiHeart, FiClock, FiChevronRight } from 'react-icons/fi';

export default function TrendingPosts() 
{
    const { posts, loading } = useSelector(state => state.posts);
    
    if(loading) return <div className="loading-spinner">Loading posts...</div>;
    
    const display_posts = posts.slice(0, 6);
    
    return (
        <section className = "trending-section">
            <div className = "container">
                <div className = "section-header">
                    <h2 className = "section-title">
                        <span className = "gradient-text">Trending Topics</span>
                    </h2>
                    <a href = "/posts" className = "view-all-link">
                        View all <FiChevronRight />
                    </a>
                </div>

                <div className = "posts-grid">
                    {display_posts.length > 0 ? (
                        display_posts.map((post) => (
                            <div key = {post.id} className = "post-card">
                                <div className = "post-card-header">
                                    <div className = "post-author">
                                        <div className = "author-avatar">
                                            {post.author_avatar ? (
                                                <img 
                                                    src = {post.author_avatar} 
                                                    alt = {post.author_name} 
                                                    style = {{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '50%' }}
                                                />
                                            ) : (
                                                <img 
                                                    src = "/user/avatar.jpg" 
                                                    alt = {post.author_name} 
                                                    style = {{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '50%' }}
                                                />
                                            )}
                                        </div>
                                        <div className = "author-info">
                                            <h3 className = "post-title">{post.title}</h3>
                                            <p className = "author-name">by {post.author_name || 'Anonymous'}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className = "post-excerpt">
                                    {post.content?.substring(0, 120)}...
                                </p>
                                <div className = "post-meta">
                                    <div className = "meta-item">
                                        <FiMessageSquare />
                                        <span>{post.comments_count || 0} comments</span>
                                    </div>
                                    <div className = "meta-item">
                                        <FiHeart />
                                        <span>{post.likes || 0} likes</span>
                                    </div>
                                    <div className = "meta-item">
                                        <FiClock />
                                        <span>2h ago</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className = "no-posts">
                            <p>No posts available yet. Be the first to create one!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
