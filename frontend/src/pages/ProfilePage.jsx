import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetch_current_user } from '../redux/slices/authSlice';
import 
{ 
    FiUser, 
    FiMail, 
    FiLock, 
    FiCamera, 
    FiTrash2, 
    FiSave,
    FiGlobe,
    FiTwitter,
    FiGithub,
    FiLinkedin,
    FiAward,
    FiTrendingUp,
    FiAlertTriangle,
    FiEdit2,
    FiX,
    FiFileText,
    FiSettings
} from 'react-icons/fi';

import Header from '../components/Header';
import '../style/profile.css';

export default function ProfilePage() {
    const { user, loading } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [active_tab, set_active_tab] = useState('posts');
    const [show_edit_modal, set_show_edit_modal] = useState(false);
    const [show_delete_modal, set_show_delete_modal] = useState(false);
    const [delete_password, set_delete_password] = useState('');
    const [user_posts, set_user_posts] = useState([]);

    const [profile_data, set_profile_data] = useState({
        login: '',
        full_name: '',
        email: '',
        bio: '',
        website: '',
        twitter: '',
        github: '',
        linkedin: ''
    });

    const [password_data, set_password_data] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [avatar_preview, set_avatar_preview] = useState(null);

    useEffect(() => {
        if(user) 
            {
            console.log('User data in ProfilePage:', user);
            set_profile_data({
                login: user.login || '',
                full_name: user.full_name || '',
                email: user.email || '',
                bio: user.bio || '',
                website: user.website || '',
                twitter: user.twitter || '',
                github: user.github || '',
                linkedin: user.linkedin || ''
            });

            fetch_user_posts();
        }
    }, [user]);

    const fetch_user_posts = async () => {
        try 
        {
            const response = await fetch(`/api/posts?author=${user.id}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if(data.status === 'success') set_user_posts(data.data || []);
        } catch(error) 
        {
            console.error('Error fetching user posts:', error);
        }
    };

    const handle_input_change = (e) => {
        const { name, value } = e.target;
        set_profile_data(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handle_password_change = (e) => {
        const { name, value } = e.target;
        set_password_data(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handle_avatar_change = async (e) => {
        const file = e.target.files[0];
        
        if(file) 
            {
            const reader = new FileReader();
            reader.onloadend = () => {
                set_avatar_preview(reader.result);
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('avatar', file);

            try 
            {
                const response = await fetch('/api/users/avatar', {
                    method: 'PATCH',
                    credentials: 'include',
                    body: formData
                });

                if(response.ok) 
                    {
                    const data = await response.json();

                    console.log('Avatar uploaded successfully:', data);
                    await dispatch(fetch_current_user());
                    set_avatar_preview(null);
                } else 
                    {
                    const error = await response.json();

                    alert(error.error || 'Failed to upload avatar');
                    set_avatar_preview(null);
                }
            } catch(error) 
            {
                console.error('Error uploading avatar:', error);
                alert('Failed to upload avatar');
                set_avatar_preview(null);
            }
        }
    };

    const handle_save_profile = async () => {
        try 
        {
            console.log('Saving profile with data:', profile_data);
            
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: 
                {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',
                body: JSON.stringify({
                    login: profile_data.login,
                    full_name: profile_data.full_name,
                    email: profile_data.email,
                    bio: profile_data.bio,
                    website: profile_data.website,
                    twitter: profile_data.twitter,
                    github: profile_data.github,
                    linkedin: profile_data.linkedin
                })
            });

            console.log('Response status:', response.status);
            
            if(response.ok) 
                {
                const data = await response.json();
                
                console.log('Profile updated successfully:', data);
                await dispatch(fetch_current_user());
                set_show_edit_modal(false);
                alert('Профіль успішно оновлено!');
            } else 
                {
                const error = await response.json();
                console.error('Error response:', error);
                alert(error.error || 'Failed to update profile');
            }
        } catch(error) 
        {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handle_save_password = async () => {
        if(password_data.new_password !== password_data.confirm_password) 
            {
            alert('Passwords do not match!');
            return;
        }
        // TODO: dispatch update password action
        console.log('Updating password');
        set_password_data({
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
    };

    const handle_delete_avatar = async () => {
        try 
        {
            const response = await fetch('/api/users/avatar', {
                method: 'DELETE',
                credentials: 'include'
            });

            if(response.ok) 
                {
                console.log('Avatar deleted successfully');
                await dispatch(fetch_current_user());
            } else 
                {
                const error = await response.json();
                alert(error.error || 'Failed to delete avatar');
            }
        } catch(error) 
        {
            console.error('Error deleting avatar:', error);
            alert('Failed to delete avatar');
        }
    };

    const handle_delete_account = async () => {
        if(!delete_password) 
            {
            alert('Please enter your password to confirm');
            return;
        }
        // TODO: dispatch delete account action
        console.log('Deleting account with password:', delete_password);
        set_show_delete_modal(false);
    };

    const user_achievements = [
        { 
            id: 1, 
            name: 'Hello World', 
            icon: '/user/achievements/HelloWorld.jpg', 
            description: 'Created your first post', 
            unlocked: user?.achievements?.includes('HelloWorld') || false 
        },
        { 
            id: 2, 
            name: 'Chatterbox', 
            icon: '/user/achievements/Chatterbox.jpg', 
            description: 'Posted 10 or more comments', 
            unlocked: user?.achievements?.includes('Chatterbox') || false 
        },
        { 
            id: 3, 
            name: 'Wise One', 
            icon: '/user/achievements/WiseOne.jpg', 
            description: 'Received 50+ likes on posts', 
            unlocked: user?.achievements?.includes('WiseOne') || false 
        },
        { 
            id: 4, 
            name: 'Hero Of The Day', 
            icon: '/user/achievements/HeroOfTheDay.jpg', 
            description: 'Top contributor of the day', 
            unlocked: user?.achievements?.includes('HeroOfTheDay') || false 
        },
        { 
            id: 5, 
            name: 'Architect', 
            icon: '/user/achievements/Architect.jpg', 
            description: 'Created 20+ posts', 
            unlocked: user?.achievements?.includes('Architect') || false 
        },
        { 
            id: 6, 
            name: 'Legend', 
            icon: '/user/achievements/Legend.jpg', 
            description: 'Community legend status', 
            unlocked: user?.achievements?.includes('Legend') || false 
        }
    ];

    if(loading) return null;

    return (
        <>
            <Header />
            <div className = "profile-page">
                <div className = "container">
                    <div className = "profile-layout">
                        {/* Sidebar */}
                        <aside className = "profile-sidebar">
                            <div className = "profile-card">
                                <div className = "avatar-section">
                                    <div className = "avatar-wrapper">
                                        <img 
                                            src = {avatar_preview || user?.avatar || '/user/avatar.jpg'} 
                                            alt = "Avatar" 
                                            className = "profile-avatar"
                                        />
                                        {avatar_preview && (
                                            <div className = "avatar-uploading">
                                                <div className = "spinner"></div>
                                            </div>
                                        )}
                                        <label htmlFor = "avatar-upload" className = "avatar-overlay">
                                            <FiCamera />
                                            <input 
                                                type = "file" 
                                                id = "avatar-upload"
                                                accept = "image/*"
                                                onChange = {handle_avatar_change}
                                                style = {{ display: 'none' }}
                                            />
                                        </label>
                                    </div>
                                    {!avatar_preview && user?.avatar && (
                                        <button onClick = {handle_delete_avatar} className = "btn-icon danger">
                                            <FiTrash2 /> Remove Avatar
                                        </button>
                                    )}
                                </div>

                                <div className = "profile-info">
                                    <h2 className = "gradient-text">{user?.login}</h2>
                                    <p className = "user-email">{user?.email}</p>
                                    <p className = "user-role">{user?.role?.toUpperCase()}</p>

                                    {/* Social Links */}
                                    {(user?.twitter || user?.github || user?.linkedin || user?.website) && (
                                        <div className = "social-links">
                                            {user?.website && (
                                                <a href = {user.website} target = "_blank" rel = "noopener noreferrer" className = "social-link">
                                                    <FiGlobe />
                                                </a>
                                            )}
                                            {user?.twitter && (
                                                <a href = {`https://twitter.com/${user.twitter}`} target = "_blank" rel = "noopener noreferrer" className = "social-link">
                                                    <FiTwitter />
                                                </a>
                                            )}
                                            {user?.github && (
                                                <a href = {`https://github.com/${user.github}`} target = "_blank" rel = "noopener noreferrer" className = "social-link">
                                                    <FiGithub />
                                                </a>
                                            )}
                                            {user?.linkedin && (
                                                <a href = {`https://linkedin.com/in/${user.linkedin}`} target = "_blank" rel = "noopener noreferrer" className = "social-link">
                                                    <FiLinkedin />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    <button 
                                        className = "btn-edit"
                                        onClick = {() => set_show_edit_modal(true)}
                                        style = {{ marginTop: '15px', display: 'flex', margin: '15px auto 0', justifyContent: 'center' }}
                                    >
                                        <FiEdit2 /> Edit Profile
                                    </button>
                                </div>

                                <div className = "profile-stats">
                                    <div className = "stat-item">
                                        <FiTrendingUp className = "stat-icon positive" />
                                        <div className = "stat-info">
                                            <span className = "stat-label">Rating</span>
                                            <span className = "stat-value positive">+{user?.rating || 0}</span>
                                        </div>
                                    </div>
                                    <div className = "stat-item">
                                        <FiAward className = "stat-icon" />
                                        <div className = "stat-info">
                                            <span className = "stat-label">Achievements</span>
                                            <span className = "stat-value">{user_achievements.filter(a => a.unlocked).length}/{user_achievements.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <nav className = "profile-nav">
                                    <button 
                                        className = {`nav-item ${active_tab === 'posts' ? 'active' : ''}`}
                                        onClick = {() => set_active_tab('posts')}
                                    >
                                        <FiFileText /> My Posts
                                    </button>
                                    <button 
                                        className = {`nav-item ${active_tab === 'achievements' ? 'active' : ''}`}
                                        onClick = {() => set_active_tab('achievements')}
                                    >
                                        <FiAward /> Achievements
                                    </button>
                                    <button 
                                        className = {`nav-item ${active_tab === 'settings' ? 'active' : ''}`}
                                        onClick = {() => set_active_tab('settings')}
                                    >
                                        <FiSettings /> Settings
                                    </button>
                                </nav>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className = "profile-content">
                            {/* Posts Tab */}
                            {active_tab === 'posts' && (
                                <div className = "content-section">
                                    <div className = "section-header">
                                        <h2>My Profile</h2>
                                    </div>

                                    {/* Bio Section */}
                                    {user?.bio && (
                                        <div className = "bio-section">
                                            <h3>About Me</h3>
                                            <p className = "bio-text">{user.bio}</p>
                                        </div>
                                    )}

                                    {/* User Posts */}
                                    <div className = "user-posts-section">
                                        <h3>My Posts ({user_posts.length})</h3>
                                        {user_posts.length === 0 ? (
                                            <div className = "empty-state">
                                                <FiFileText size={48} />
                                                <p>You haven't created any posts yet.</p>
                                            </div>
                                        ) : (
                                            <div className = "posts-grid">
                                                {user_posts.map(post => (
                                                    <div 
                                                        key = {post.id} 
                                                        className = "post-card"
                                                        onClick = {() => navigate(`/posts/${post.id}`)}
                                                        style = {{ cursor: 'pointer' }}
                                                    >
                                                        <div className = "post-header">
                                                            <h4>{post.title}</h4>
                                                            <span className = "post-status">{post.status}</span>
                                                        </div>
                                                        <p className = "post-content">{post.content.substring(0, 150)}...</p>
                                                        <div className = "post-footer">
                                                            <span className = "post-category">{post.categories?.[0]}</span>
                                                            <span className = "post-date">{new Date(post.publish_date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Achievements Tab */}
                            {active_tab === 'achievements' && (
                                <div className = "content-section">
                                    <div className = "section-header">
                                        <h2>Achievements</h2>
                                    </div>

                                    <div className = "achievements-grid">
                                        {user_achievements.map(achievement => (
                                            <div 
                                                key = {achievement.id} 
                                                className = {`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                                            >
                                                <div className = "achievement-icon">
                                                    <img src = {achievement.icon} alt={achievement.name} />
                                                </div>
                                                <div className = "achievement-info">
                                                    <h4>{achievement.name}</h4>
                                                    <p>{achievement.description}</p>
                                                </div>
                                                {achievement.unlocked && (
                                                    <div className = "achievement-badge">✓</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {active_tab === 'settings' && (
                                <div className = "content-section">
                                    <div className = "section-header">
                                        <h2>Security Settings</h2>
                                    </div>

                                    <div className = "security-section">
                                        <h3>Change Password</h3>
                                        <div className = "form-grid">
                                            <div className = "form-group full-width">
                                                <label className = "form-label">
                                                    <FiLock /> Current Password
                                                </label>
                                                <input
                                                    type = "password"
                                                    name ="current_password"
                                                    value = {password_data.current_password}
                                                    onChange = {handle_password_change}
                                                    className = "form-input"
                                                />
                                            </div>

                                            <div className = "form-group">
                                                <label className = "form-label">
                                                    <FiLock /> New Password
                                                </label>
                                                <input
                                                    type = "password"
                                                    name = "new_password"
                                                    value = {password_data.new_password}
                                                    onChange = {handle_password_change}
                                                    className = "form-input"
                                                />
                                            </div>

                                            <div className = "form-group">
                                                <label className = "form-label">
                                                    <FiLock /> Confirm Password
                                                </label>
                                                <input
                                                    type = "password"
                                                    name = "confirm_password"
                                                    value = {password_data.confirm_password}
                                                    onChange = {handle_password_change}
                                                    className = "form-input"
                                                />
                                            </div>
                                        </div>

                                        <div className = "form-actions">
                                            <button onClick = {handle_save_password} className = "btn btn-game">
                                                <FiSave /> Update Password
                                            </button>
                                        </div>
                                    </div>

                                    <div className = "danger-zone">
                                        <h3>Danger Zone</h3>
                                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                                        <button 
                                            onClick = {() => set_show_delete_modal(true)}
                                            className = "btn btn-danger"
                                        >
                                            <FiTrash2 /> Delete Account
                                        </button>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {show_delete_modal && (
                <div className = "modal-overlay" onClick={() => set_show_delete_modal(false)}>
                    <div className = "modal-content danger" onClick = {(e) => e.stopPropagation()}>
                        <div className = "modal-header">
                            <FiAlertTriangle className = "modal-icon" />
                            <h2>Delete Account</h2>
                        </div>
                        <div className = "modal-body">
                            <p>This action cannot be undone. This will permanently delete your account and remove all your data.</p>
                            <div className = "form-group">
                                <label className = "form-label">
                                    <FiLock /> Enter your password to confirm
                                </label>
                                <input
                                    type = "password"
                                    value={delete_password}
                                    onChange={(e) => set_delete_password(e.target.value)}
                                    className = "form-input"
                                    placeholder = "Enter password"
                                />
                            </div>
                        </div>
                        <div className = "modal-footer">
                            <button onClick = {() => set_show_delete_modal(false)} className = "btn btn-game-outline">
                                Cancel
                            </button>
                            <button onClick = {handle_delete_account} className = "btn btn-danger">
                                <FiTrash2 /> Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {show_edit_modal && (
                <div className = "modal-overlay" onClick = {() => set_show_edit_modal(false)}>
                    <div className = "modal-content edit-modal" onClick = {(e) => e.stopPropagation()}>
                        <div className = "modal-header">
                            <h2>Edit Profile</h2>
                            <button className = "btn-icon" onClick = {() => set_show_edit_modal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className = "modal-body">
                            <div className = "form-grid">
                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiUser /> Username
                                    </label>
                                    <input
                                        type = "text"
                                        name = "login"
                                        value = {profile_data.login}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiUser /> Full Name
                                    </label>
                                    <input
                                        type = "text"
                                        name = "full_name"
                                        value = {profile_data.full_name}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                    />
                                </div>

                                <div className = "form-group full-width">
                                    <label className = "form-label">
                                        <FiMail /> Email
                                    </label>
                                    <input
                                        type = "email"
                                        name = "email"
                                        value = {profile_data.email}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                    />
                                </div>

                                <div className = "form-group full-width">
                                    <label className = "form-label">
                                        <FiEdit2 /> Bio
                                    </label>
                                    <textarea
                                        name = "bio"
                                        value = {profile_data.bio}
                                        onChange = {handle_input_change}
                                        className = "form-textarea"
                                        rows = "4"
                                        placeholder = "Tell us about yourself..."
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiGlobe /> Website
                                    </label>
                                    <input
                                        type = "url"
                                        name = "website"
                                        value = {profile_data.website}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = "https://yourwebsite.com"
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiTwitter /> Twitter
                                    </label>
                                    <input
                                        type = "text"
                                        name = "twitter"
                                        value = {profile_data.twitter}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = "@username"
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiGithub /> GitHub
                                    </label>
                                    <input
                                        type = "text"
                                        name = "github"
                                        value = {profile_data.github}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = "username"
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiLinkedin /> LinkedIn
                                    </label>
                                    <input
                                        type = "text"
                                        name = "linkedin"
                                        value = {profile_data.linkedin}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = "username"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className = "modal-footer">
                            <button onClick = {() => set_show_edit_modal(false)} className = "btn btn-game-outline">
                                Cancel
                            </button>
                            <button onClick = {handle_save_profile} className = "btn btn-gradient">
                                <FiSave /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
