import React, { useState, useEffect, useRef } from 'react';
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
    FiGithub,
    FiLinkedin,
    FiCode,
    FiLink,
    FiSmile,
    FiAlertTriangle,
    FiEdit2,
    FiX,
    FiFileText,
    FiSettings,
    FiZap
} from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import { FaBrain, FaTwitch } from 'react-icons/fa';
import { GiAchievement } from 'react-icons/gi';
import { GoBlocked } from 'react-icons/go';
import { SiUnrealengine, SiUnity, SiGodotengine, SiPython, SiVulkan, SiCryengine, SiGamemaker, SiItchdotio, SiGamebanana, SiGamejolt } from 'react-icons/si';

import Header from '../components/Header/Header';
import '../style/profile.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { defaultSchema } from 'hast-util-sanitize';
import { useTranslation } from 'react-i18next';

const BIO_ALLOWED_COLOR_NAMES = new Set([
    'red', 'orange', 'yellow', 'gold', 'amber', 'lime', 'green', 'emerald', 'teal', 'cyan',
    'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'magenta',
    'brown', 'maroon', 'crimson', 'white', 'black', 'gray', 'grey', 'silver'
]);

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const NAMED_COLOR_REGEX = /^[a-zA-Z]+$/;
const BIO_CLASS_REGEX = /^bio-[a-z0-9_-]+$/;
const COLOR_VALUE_REGEX = /^(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)$/;

const bio_sanitize_schema = {
    ...defaultSchema,
    tagNames: Array.from(new Set([...(defaultSchema.tagNames || []), 'span', 'mark'])),
    attributes: {
        ...defaultSchema.attributes,
        span: [
            ...(defaultSchema.attributes?.span || []),
            ['className', value => BIO_CLASS_REGEX.test(value)],
            'style'
        ],
        mark: [
            ...(defaultSchema.attributes?.mark || []),
            ['className', value => BIO_CLASS_REGEX.test(value)]
        ],
        a: [
            ...(defaultSchema.attributes?.a || []),
            'href',
            'title',
            'target',
            'rel'
        ]
    }
};

const normalize_bio_color = (value) => {
    if(!value) return null;
    const trimmed = value.trim();
    if(HEX_COLOR_REGEX.test(trimmed)) return trimmed.toLowerCase();
    if(NAMED_COLOR_REGEX.test(trimmed)) 
        {
        const lower = trimmed.toLowerCase();
        if(BIO_ALLOWED_COLOR_NAMES.has(lower)) return lower;
    }
    return null;
};

const transform_bio_markup = (value) => {
    if(!value) return '';
    let result = value;

    result = result.replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, (match, colorToken, inner) => {
        const normalized = normalize_bio_color(colorToken);
        if(!normalized) return inner;
        return `<span class="bio-color" style="color: ${normalized};">${inner}</span>`;
    });

    result = result.replace(/\[bg=([^\]]+)\]([\s\S]*?)\[\/bg\]/gi, (match, colorToken, inner) => {
        const normalized = normalize_bio_color(colorToken);
        if(!normalized) return inner;
        return `<span class="bio-bg-chip" style="background-color: ${normalized};">${inner}</span>`;
    });

    result = result.replace(/\[mark\]([\s\S]*?)\[\/mark\]/gi, '<mark class="bio-mark">$1</mark>');

    return result;
};

const BIO_EMOJI_LIST = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏',
    '💻', '🖥️', '⌨️', '🖱️', '💾', '💿', '🧮', '🎮', '🕹️', '🚀',
    '🔥', '✨', '💡', '🎉', '🎊', '🎈', '🏆', '🥇', '🥈', '🥉'
];

const GAME_ENGINE_DEFINITIONS = [
    { 
        id: 'unreal-engine', 
        name: 'Unreal Engine', 
        icon: <SiUnrealengine />, 
        color: '#0E1128',
        translationKey: 'unreal_engine'
    },
    { 
        id: 'unity', 
        name: 'Unity', 
        icon: <SiUnity />, 
        color: '#3A3F4B',
        translationKey: 'unity'
    },
    { 
        id: 'godot', 
        name: 'Godot', 
        icon: <SiGodotengine />, 
        color: '#3F8FC9',
        translationKey: 'godot'
    },
    { 
        id: 'renpy', 
        name: "Ren'Py", 
        icon: <SiPython />, 
        color: '#FF6B8A',
        translationKey: 'renpy'
    },
    { 
        id: 'gamemaker', 
        name: 'GameMaker', 
        icon: <SiGamemaker />, 
        color: '#58B947',
        translationKey: 'gamemaker'
    },
    { 
        id: 'cryengine', 
        name: 'CryEngine', 
        icon: <SiCryengine />, 
        color: '#00B4D8',
        translationKey: 'cryengine'
    },
    { 
        id: 'custom-engines', 
        name: 'Custom Engines', 
        icon: <SiVulkan />, 
        color: '#FFB400',
        translationKey: 'custom_engines'
    }
];

export default function ProfilePage() {
    const { user, loading } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [active_tab, set_active_tab] = useState('posts');
    const [show_edit_modal, set_show_edit_modal] = useState(false);
    const [show_delete_modal, set_show_delete_modal] = useState(false);
    const [delete_password, set_delete_password] = useState('');
    const [user_posts, set_user_posts] = useState([]);
    const [loaded_achievements, set_loaded_achievements] = useState([]);
    const [all_achievements, set_all_achievements] = useState([]);
    const [engine_popup, set_engine_popup] = useState(null);
    const bio_textarea_ref = useRef(null);
    const bio_toolbar_ref = useRef(null);
    const [show_bio_emoji_picker, set_show_bio_emoji_picker] = useState(false);

    const [profile_data, set_profile_data] = useState({
        login: '',
        full_name: '',
        email: '',
        bio: '',
        website: '',
        twitter: '',
        github: '',
        linkedin: '',
        itch: '',
        gamebanana: '',
        gamejolt: '',
        twitch: '',
        engines: []
    });

    const [password_data, set_password_data] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [avatar_preview, set_avatar_preview] = useState(null);

    const strip_markdown = (text) => {
        if(!text) return '';
        
        let cleaned = text
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]+`/g, '')
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            .replace(/(\*|_)(.*?)\1/g, '$2')
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
            .replace(/^>\s+/gm, '')
            .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
            .replace(/^[\s]*[-*+]\s+/gm, '')
            .replace(/^[\s]*\d+\.\s+/gm, '')
            .replace(/\n\s*\n/g, '\n')
            .trim();
        
        return cleaned;
    };

    const format_social_url = (type, value) => {
        if(!value) return null;
        const trimmed = value.trim();
        if(!trimmed) return null;
        if(/^https?:\/\//i.test(trimmed)) return trimmed;

        const sanitized = trimmed.replace(/^@/, '');

        switch(type) 
        {
            case 'website':
                return sanitized.startsWith('www.') ? `https://${sanitized}` : `https://${sanitized}`;
            case 'twitter':
                return `https://twitter.com/${sanitized}`;
            case 'github':
                return `https://github.com/${sanitized}`;
            case 'linkedin':
                return `https://linkedin.com/in/${sanitized}`;
            case 'itch':
                if(sanitized.includes('itch.io') || sanitized.includes('/')) {
                    return sanitized.startsWith('www.') ? `https://${sanitized}` : `https://${sanitized}`;
                }
                return `https://${sanitized}.itch.io`;
            case 'gamebanana':
                if(sanitized.includes('gamebanana.com')) {
                    return sanitized.startsWith('www.') ? `https://${sanitized}` : `https://${sanitized}`;
                }
                return `https://gamebanana.com/members/${sanitized}`;
            case 'gamejolt':
                if(sanitized.toLowerCase().includes('gamejolt.com')) {
                    return sanitized.startsWith('www.') ? `https://${sanitized}` : `https://${sanitized}`;
                }
                return `https://gamejolt.com/@${sanitized}`;
            case 'twitch':
                return `https://twitch.tv/${sanitized}`;
            default:
                return trimmed.startsWith('www.') ? `https://${trimmed}` : `https://${trimmed}`;
        }
    };

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
                linkedin: user.linkedin || '',
                itch: user.itch || '',
                gamebanana: user.gamebanana || '',
                gamejolt: user.gamejolt || '',
                twitch: user.twitch || '',
                engines: user.engines || []
            });

            fetch_user_posts();
            fetch_user_achievements();
            fetch_all_achievements();
        }
    }, [user]);

    useEffect(() => {
        if(!show_edit_modal) set_show_bio_emoji_picker(false);
    }, [show_edit_modal]);

    useEffect(() => {
        if(!show_bio_emoji_picker) return;

        const handle_click_outside = (event) => {
            if(bio_toolbar_ref.current && !bio_toolbar_ref.current.contains(event.target)) 
                {
                set_show_bio_emoji_picker(false);
            }
        };

        document.addEventListener('mousedown', handle_click_outside);
        return () => document.removeEventListener('mousedown', handle_click_outside);
    }, [show_bio_emoji_picker]);

    const fetch_user_achievements = async () => {
        try 
        {
            const response = await fetch(`/api/users/me/achievements`, {
                credentials: 'include'
            });
            const data = await response.json();

            if(data.status === 'success') set_loaded_achievements(data.data || []);
        } catch(error) 
        {
            console.error('Error fetching achievements:', error);
        }
    };

    const fetch_all_achievements = async () => {
        try 
        {
            const response = await fetch(`/api/achievements`, {
                credentials: 'include'
            });
            const data = await response.json();

            if(data.status === 'success') set_all_achievements(data.data || []);
        } catch(error) 
        {
            console.error('Error fetching all achievements:', error);
        }
    };

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

    const insert_bio_markdown = (type) => {
        const textarea = bio_textarea_ref.current;
        if(!textarea) return;

        textarea.focus();
        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? start;
        const current_bio = profile_data.bio || '';
        const selected_text = current_bio.slice(start, end);

        let snippet = '';
        let highlightStartOffset = 0;
        let highlightEndOffset = 0;

        const setHighlightFor = (inner) => {
            if(!inner)
                {
                highlightStartOffset = snippet.length;
                highlightEndOffset = snippet.length;
                return;
            }

            const index = snippet.indexOf(inner);
            if(index !== -1) 
                {
                highlightStartOffset = index;
                highlightEndOffset = index + inner.length;
            } else 
                {
                highlightStartOffset = snippet.length;
                highlightEndOffset = snippet.length;
            }
        };

        switch(type) 
        {
            case 'bold': {
                const placeholder = selected_text || 'bold text';
                snippet = `**${placeholder}**`;
                setHighlightFor(placeholder);
                break;
            }
            case 'italic': {
                const placeholder = selected_text || 'italic text';
                snippet = `*${placeholder}*`;
                setHighlightFor(placeholder);
                break;
            }
            case 'code': {
                const placeholder = selected_text || 'code';
                snippet = `\`${placeholder}\``;
                setHighlightFor(placeholder);
                break;
            }
            case 'code-block': {
                const placeholder = selected_text || '// code snippet';
                snippet = `\n\`\`\`\n${placeholder}\n\`\`\`\n`;
                setHighlightFor(placeholder);
                break;
            }
            case 'link': {
                const label = selected_text || 'link text';
                snippet = `[${label}](url)`;
                const urlPlaceholder = 'url';
                const idx = snippet.indexOf(urlPlaceholder);
                if(idx !== -1) 
                    {
                    highlightStartOffset = idx;
                    highlightEndOffset = idx + urlPlaceholder.length;
                } else 
                    {
                    highlightStartOffset = snippet.length;
                    highlightEndOffset = snippet.length;
                }
                break;
            }
            case 'heading': {
                const placeholder = selected_text || 'Heading';
                snippet = `\n## ${placeholder}\n`;
                setHighlightFor(placeholder);
                break;
            }
            case 'list': {
                const placeholder = selected_text || 'List item';
                snippet = `\n- ${placeholder}\n`;
                setHighlightFor(placeholder);
                break;
            }
            case 'color': {
                const placeholder = selected_text || 'кольоровий текст';
                snippet = `[color=#ff6b6b]${placeholder}[/color]`;
                setHighlightFor(placeholder);
                break;
            }
            case 'background': {
                const placeholder = selected_text || 'фонований текст';
                snippet = `[bg=yellow]${placeholder}[/bg]`;
                setHighlightFor(placeholder);
                break;
            }
            case 'mark': {
                const placeholder = selected_text || 'виділення';
                snippet = `[mark]${placeholder}[/mark]`;
                setHighlightFor(placeholder);
                break;
            }
            default:
                return;
        }

        if(!snippet) return;

        const new_bio = `${current_bio.substring(0, start)}${snippet}${current_bio.substring(end)}`;
        const selection_start = start + Math.min(highlightStartOffset, snippet.length);
        const selection_end = start + Math.min(highlightEndOffset, snippet.length);

        set_profile_data(prev => ({ ...prev, bio: new_bio }));
        set_show_bio_emoji_picker(false);

        requestAnimationFrame(() => {
            if(bio_textarea_ref.current) 
                {
                bio_textarea_ref.current.focus();
                bio_textarea_ref.current.setSelectionRange(selection_start, selection_end);
            }
        });
    };

    const insert_bio_emoji = (emoji) => {
        const textarea = bio_textarea_ref.current;
        if(!textarea) return;

        textarea.focus();
        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? start;
        const current_bio = profile_data.bio || '';

        const new_bio = `${current_bio.substring(0, start)}${emoji}${current_bio.substring(end)}`;
        const new_cursor = start + emoji.length;

        set_profile_data(prev => ({ ...prev, bio: new_bio }));
        set_show_bio_emoji_picker(false);

        requestAnimationFrame(() => {
            if(bio_textarea_ref.current) 
                {
                bio_textarea_ref.current.focus();
                bio_textarea_ref.current.setSelectionRange(new_cursor, new_cursor);
            }
        });
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
            // Validate file type
            const allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowed_types.includes(file.type)) {
            alert(t('profile.notifications.avatar_format_error'));
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
            alert(t('profile.notifications.avatar_size_error'));
                return;
            }

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

                    alert(error.error || t('profile.notifications.avatar_upload_error'));
                    set_avatar_preview(null);
                }
            } catch(error) 
            {
                console.error('Error uploading avatar:', error);
                alert(t('profile.notifications.avatar_upload_error'));
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
                    linkedin: profile_data.linkedin,
                    itch: profile_data.itch,
                    gamebanana: profile_data.gamebanana,
                    gamejolt: profile_data.gamejolt,
                    twitch: profile_data.twitch,
                    engines: profile_data.engines
                })
            });

            console.log('Response status:', response.status);
            
            if(response.ok) 
                {
                const data = await response.json();
                
                console.log('Profile updated successfully:', data);
                await dispatch(fetch_current_user());
                set_show_edit_modal(false);
                alert(t('profile.notifications.profile_update_success'));
            } else 
                {
                const error = await response.json();
                console.error('Error response:', error);
                alert(error.error || t('profile.notifications.profile_update_error'));
            }
        } catch(error) 
        {
            console.error('Error updating profile:', error);
            alert(t('profile.notifications.profile_update_error'));
        }
    };

    const handle_save_password = async () => {
        if(password_data.new_password !== password_data.confirm_password) 
            {
            alert(t('profile.notifications.password_mismatch'));
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
                alert(error.error || t('profile.notifications.avatar_delete_error'));
            }
        } catch(error) 
        {
            console.error('Error deleting avatar:', error);
            alert(t('profile.notifications.avatar_delete_error'));
        }
    };

    const handle_delete_account = async () => {
        if(!delete_password) 
            {
            alert(t('profile.notifications.delete_password_required'));
            return;
        }
        // TODO: dispatch delete account action
        console.log('Deleting account with password:', delete_password);
        set_show_delete_modal(false);
    };

    const social_links_config = [
        { key: 'website', type: 'website', value: user?.website, icon: <FiGlobe /> },
        { key: 'twitter', type: 'twitter', value: user?.twitter, icon: <FaXTwitter /> },
        { key: 'github', type: 'github', value: user?.github, icon: <FiGithub /> },
        { key: 'linkedin', type: 'linkedin', value: user?.linkedin, icon: <FiLinkedin /> },
        { key: 'itch', type: 'itch', value: user?.itch, icon: <SiItchdotio /> },
        { key: 'gamebanana', type: 'gamebanana', value: user?.gamebanana, icon: <SiGamebanana /> },
        { key: 'gamejolt', type: 'gamejolt', value: user?.gamejolt, icon: <SiGamejolt /> },
        { key: 'twitch', type: 'twitch', value: user?.twitch, icon: <FaTwitch /> }
    ];

    const active_social_links = social_links_config
        .map((link) => ({ ...link, href: format_social_url(link.type, link.value) }))
        .filter(link => !!link.href);



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
                                            alt = {t('profile.avatar_alt')}
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
                                                accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                onChange = {handle_avatar_change}
                                                style = {{ display: 'none' }}
                                            />
                                        </label>
                                    </div>
                                    {!avatar_preview && user?.avatar && (
                                        <button onClick = {handle_delete_avatar} className = "btn-icon danger">
                                            <FiTrash2 /> {t('profile.remove_avatar')}
                                        </button>
                                    )}
                                    <p className = "avatar-hint">
                                        {t('profile.avatar_hint')}
                                    </p>
                                </div>

                                <div className = "profile-info">
                                    <h2 className = "gradient-text">{user?.login}</h2>
                                    <p className = "user-email">{user?.email}</p>
                                    <p className = "user-role">{user?.role?.toUpperCase()}</p>

                                    {/* Social Links */}
                                    {active_social_links.length > 0 && (
                                        <div className = "social-links">
                                            {active_social_links.map(link => (
                                                <a
                                                    key = {link.key}
                                                    href = {link.href}
                                                    target = "_blank"
                                                    rel = "noopener noreferrer"
                                                    className = "social-link"
                                                >
                                                    {link.icon}
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {/* Game Engines */}
                                    {user?.engines && user.engines.length > 0 && (
                                        <div className = "user-engines">
                                            <p className = "engines-label">{t('profile.game_engines_label')}</p>
                                            <div className = "engines-icons">
                                                {user.engines.map(engine_id => {
                                                    const engine = GAME_ENGINE_DEFINITIONS.find(e => e.id === engine_id);
                                                    if (!engine) return null;
                                                    return (
                                                        <div 
                                                            key = {engine_id} 
                                                            className = "engine-icon" 
                                                            style = {{ color: engine.color }}
                                                            onClick = {() => set_engine_popup(engine)}
                                                        >
                                                            {engine.icon}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        className = "btn-edit-profile"
                                        onClick = {() => set_show_edit_modal(true)}
                                    >
                                        <FiEdit2 /> {t('profile.edit_profile')}
                                    </button>

                                    {user?.role === 'admin' && (
                                        <button 
                                            className = "btn-admin"
                                            onClick = {() => navigate('/admin-dashboard')}
                                        >
                                            <FiSettings /> {t('admin.title')}
                                        </button>
                                    )}
                                </div>

                                <div className = "profile-stats">
                                    <div className = "stat-item">
                                        <FaBrain className = "profile-stat-icon positive" />
                                        <div className = "stat-info">
                                            <span className = "stat-label">{t('profile.stats.rating_label')}</span>
                                            <span className = "stat-value positive">
                                                {t('profile.stats.rating_value', { value: user?.rating || 0 })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className = "stat-item">
                                        <GiAchievement className = "profile-stat-icon" />
                                        <div className = "stat-info">
                                            <span className = "stat-label">{t('profile.stats.achievements_label')}</span>
                                            <span className = "stat-value">
                                                {t('profile.stats.achievements_value', { count: loaded_achievements?.length || 0 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <nav className = "profile-nav">
                                    <button 
                                        className = {`nav-item ${active_tab === 'posts' ? 'active' : ''}`}
                                        onClick = {() => set_active_tab('posts')}
                                    >
                                        <FiFileText /> {t('profile.my_posts')}
                                    </button>
                                    <button 
                                        className = {`nav-item ${active_tab === 'achievements' ? 'active' : ''}`}
                                        onClick = {() => set_active_tab('achievements')}
                                    >
                                        <GiAchievement /> {t('profile.my_achievements')}
                                    </button>
                                    {user?.role === 'admin' && (
                                        <button 
                                            className = {`nav-item ${active_tab === 'admin' ? 'active' : ''}`}
                                            onClick = {() => navigate('/admin-dashboard')}
                                        >
                                            <FiSettings /> {t('admin.title')}
                                        </button>
                                    )}
                                    <button 
                                        className = {`nav-item ${active_tab === 'settings' ? 'active' : ''}`}
                                        onClick = {() => set_active_tab('settings')}
                                    >
                                        <FiSettings /> {t('settings.title')}
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
                                        <h2>{t('profile.title')}</h2>
                                    </div>

                                    {/* Bio Section */}
                                    {user?.bio && user.bio.trim() && (
                                        <div className = "bio-section">
                                            <h3>{t('profile.bio')}</h3>
                                            <div className = "bio-text">
                                                <ReactMarkdown
                                                    remarkPlugins = {[remarkGfm]}
                                                    rehypePlugins = {[
                                                        rehypeRaw,
                                                        [rehypeSanitize, bio_sanitize_schema]
                                                    ]}
                                                    components = {{
                                                        a: ({ node, ...props }) => (
                                                            <a
                                                                {...props}
                                                                target = "_blank"
                                                                rel = "noopener noreferrer"
                                                            />
                                                        ),
                                                        span: ({ node, ...props }) => {
                                                            const className = props.className || '';
                                                            const style = { ...(props.style || {}) };

                                                            if(className.split(' ').includes('bio-bg-chip')) 
                                                                {
                                                                if(!style.color) style.color = '#0b1120';
                                                            }

                                                            return <span {...props} style = {style} />;
                                                        }
                                                    }}
                                                >
                                                    {transform_bio_markup(user.bio)}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {/* User Posts */}
                                    <div className = "user-posts-section">
                                        <h3>{t('profile.sections.posts.list_title', { count: user_posts.length })}</h3>
                                        {user_posts.length === 0 ? (
                                            <div className = "empty-state">
                                                <FiFileText size={48} />
                                                <p>{t('profile.sections.posts.empty')}</p>
                                            </div>
                                        ) : (
                                            <div className = "posts-grid">
                                                {user_posts.map(post => {
                                                    const normalized_status = (post.status || '').toLowerCase();
                                                    const is_inactive = normalized_status === 'inactive';
                                                    let status_key = is_inactive ? 'inactive' : 'active';
                                                    if (post.is_closed) status_key = 'closed';

                                                    return (
                                                        <div 
                                                            key = {post.id} 
                                                            className = "post-card"
                                                            onClick = {() => navigate(`/posts/${post.id}`)}
                                                            style = {{ cursor: 'pointer' }}
                                                        >
                                                            <div className = "post-header">
                                                                <h4>{post.title}</h4>
                                                                <div className = "post-status-badges">
                                                                    {post.is_closed && (
                                                                        <span className = "post-status closed" title={t('profile.sections.posts.closed_tooltip')}>
                                                                            <GoBlocked size={16} />
                                                                        </span>
                                                                    )}
                                                                    <span className = {`post-status${is_inactive || post.is_closed ? ' inactive' : ''}`}>
                                                                        {t(`profile.sections.posts.status.${status_key}`)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className = "post-content">
                                                                {strip_markdown(post.content || '').substring(0, 150)}
                                                                {post.content && strip_markdown(post.content).length > 150 ? '...' : ''}
                                                            </p>
                                                            <div className = "post-footer">
                                                                <div className = "post-stats">
                                                                    <span className = "stat">👍 {post.likes || 0}</span>
                                                                    <span className = "stat">💬 {post.comments_count || 0}</span>
                                                                    <span className = "stat">👁️ {post.views || 0}</span>
                                                                </div>
                                                                <div className = "post-meta">
                                                                    <span className = "post-category">{post.categories?.[0]}</span>
                                                                    <span className = "post-date">{new Date(post.publish_date).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Achievements Tab */}
                            {active_tab === 'achievements' && (
                                <div className = "content-section">
                                    <div className = "section-header">
                                        <h2>{t('profile.sections.achievements.title')}</h2>
                                    </div>

                                    <div className = "achievements-grid">
                                        {all_achievements && all_achievements.length > 0 ? (
                                            all_achievements.map(achievement => {
                                                const is_earned = loaded_achievements.some(a => a.id === achievement.id);
                                                return (
                                                    <div 
                                                        key = {achievement.id} 
                                                        className = {`achievement-card ${is_earned ? 'unlocked' : 'locked'}`}
                                                    >
                                                        <div className = "achievement-icon">
                                                            <img 
                                                                src = {achievement.icon} 
                                                                alt = {achievement.title}
                                                                style = {{
                                                                    filter: is_earned ? 'none' : 'grayscale(100%)',
                                                                    opacity: is_earned ? 1 : 0.5
                                                                }}
                                                            />
                                                        </div>
                                                        <div className = "achievement-info">
                                                            <h4>{achievement.title}</h4>
                                                            <p>{achievement.description}</p>
                                                            {achievement.points && (
                                                                <small className = "achievement-points">
                                                                    {t('profile.sections.achievements.points', { points: achievement.points })}
                                                                </small>
                                                            )}
                                                        </div>
                                                        {is_earned && (
                                                            <div className = "achievement-badge">✓</div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className = "no-achievements">
                                                {t('profile.sections.achievements.empty')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {active_tab === 'settings' && (
                                <div className = "content-section">
                                    <div className = "section-header">
                                        <h2>{t('profile.sections.settings.title')}</h2>
                                    </div>

                                    <div className = "security-section">
                                        <h3>{t('profile.sections.settings.change_password.title')}</h3>
                                        <div className = "form-grid">
                                            <div className = "form-group full-width">
                                                <label className = "form-label">
                                                    <FiLock /> {t('profile.sections.settings.change_password.current')}
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
                                                    <FiLock /> {t('profile.sections.settings.change_password.new')}
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
                                                    <FiLock /> {t('profile.sections.settings.change_password.confirm')}
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
                                                <FiSave /> {t('profile.sections.settings.change_password.submit')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className = "danger-zone">
                                        <h3>{t('profile.sections.settings.danger_zone.title')}</h3>
                                        <p>{t('profile.sections.settings.danger_zone.description')}</p>
                                        <button 
                                            onClick = {() => set_show_delete_modal(true)}
                                            className = "btn btn-danger"
                                        >
                                            <FiTrash2 /> {t('profile.sections.settings.danger_zone.delete_button')}
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
                            <h2>{t('profile.delete_modal.title')}</h2>
                        </div>
                        <div className = "modal-body">
                            <p>{t('profile.delete_modal.description')}</p>
                            <div className = "form-group">
                                <label className = "form-label">
                                    <FiLock /> {t('profile.delete_modal.password_label')}
                                </label>
                                <input
                                    type = "password"
                                    value={delete_password}
                                    onChange={(e) => set_delete_password(e.target.value)}
                                    className = "form-input"
                                    placeholder = {t('profile.delete_modal.password_placeholder')}
                                />
                            </div>
                        </div>
                        <div className = "modal-footer">
                            <button onClick = {() => set_show_delete_modal(false)} className = "btn btn-game-outline">
                                {t('common.cancel')}
                            </button>
                            <button onClick = {handle_delete_account} className = "btn btn-danger">
                                <FiTrash2 /> {t('profile.delete_modal.delete_button')}
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
                            <h2>{t('profile.edit_modal.title')}</h2>
                            <button className = "btn-icon" onClick = {() => set_show_edit_modal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className = "modal-body">
                            <div className = "form-grid">
                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiUser /> {t('profile.edit_modal.username')}
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
                                        <FiUser /> {t('profile.edit_modal.full_name')}
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
                                        <FiMail /> {t('profile.edit_modal.email')}
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
                                        <FiEdit2 /> {t('profile.edit_modal.bio')}
                                    </label>
                                    <div className = "bio-field-wrapper" ref = {bio_toolbar_ref}>
                                        <div className = "bio-markdown-toolbar">
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('bold')}
                                                title = {t('profile.edit_modal.toolbar.bold')}
                                            >
                                                <strong>B</strong>
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('italic')}
                                                title = {t('profile.edit_modal.toolbar.italic')}
                                            >
                                                <em>I</em>
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('code')}
                                                title = {t('profile.edit_modal.toolbar.inline_code')}
                                            >
                                                <FiCode />
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('code-block')}
                                                title = {t('profile.edit_modal.toolbar.code_block')}
                                            >
                                                <code>{'{ }'}</code>
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('link')}
                                                title = {t('profile.edit_modal.toolbar.link')}
                                            >
                                                <FiLink />
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('heading')}
                                                title = {t('profile.edit_modal.toolbar.heading')}
                                            >
                                                H2
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('list')}
                                                title = {t('profile.edit_modal.toolbar.list')}
                                            >
                                                ☰
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('color')}
                                                title = {t('profile.edit_modal.toolbar.color')}
                                            >
                                                <span className = "bio-toolbar-swatch" style = {{ background: '#ff6b6b' }}></span>
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('background')}
                                                title = {t('profile.edit_modal.toolbar.background')}
                                            >
                                                <span className = "bio-toolbar-swatch gradient"></span>
                                            </button>
                                            <button
                                                type = "button"
                                                className = "bio-toolbar-btn"
                                                onClick = {() => insert_bio_markdown('mark')}
                                                title = {t('profile.edit_modal.toolbar.mark')}
                                            >
                                                <mark>MK</mark>
                                            </button>
                                            <div className = "bio-emoji-picker-wrapper">
                                                <button
                                                    type = "button"
                                                    className = {`bio-toolbar-btn${show_bio_emoji_picker ? ' active' : ''}`}
                                                    onClick = {() => set_show_bio_emoji_picker(prev => !prev)}
                                                    title = {t('profile.edit_modal.toolbar.emoji')}
                                                >
                                                    <FiSmile />
                                                </button>
                                                {show_bio_emoji_picker && (
                                                    <div className = "bio-emoji-dropdown">
                                                        {BIO_EMOJI_LIST.map((emoji, index) => (
                                                            <button
                                                                key = {`${emoji}-${index}`}
                                                                type = "button"
                                                                className = "bio-emoji-btn"
                                                                onClick = {() => insert_bio_emoji(emoji)}
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <textarea
                                            ref = {bio_textarea_ref}
                                            name = "bio"
                                            value = {profile_data.bio}
                                            onChange = {handle_input_change}
                                            className = "form-textarea bio-textarea"
                                            rows = "5"
                                            placeholder = {t('profile.edit_modal.bio_placeholder')}
                                        />
                                        <p className = "bio-markdown-hint">
                                            {t('profile.edit_modal.bio_hint')}
                                        </p>
                                    </div>
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiGlobe /> {t('profile.edit_modal.website')}
                                    </label>
                                    <input
                                        type = "url"
                                        name = "website"
                                        value = {profile_data.website}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = {t('profile.edit_modal.website_placeholder')}
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FaXTwitter /> {t('profile.edit_modal.twitter')}
                                    </label>
                                    <input
                                        type = "text"
                                        name = "twitter"
                                        value = {profile_data.twitter}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = {t('profile.edit_modal.twitter_placeholder')}
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiGithub /> {t('profile.edit_modal.github')}
                                    </label>
                                    <input
                                        type = "text"
                                        name = "github"
                                        value = {profile_data.github}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = {t('profile.edit_modal.github_placeholder')}
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FiLinkedin /> {t('profile.edit_modal.linkedin')}
                                    </label>
                                    <input
                                        type = "text"
                                        name = "linkedin"
                                        value = {profile_data.linkedin}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = {t('profile.edit_modal.linkedin_placeholder')}
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <SiItchdotio /> {t('profile.edit_modal.itch')}
                                    </label>
                                    <input
                                        type = "text"
                                        name = "itch"
                                        value = {profile_data.itch}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = {t('profile.edit_modal.itch_placeholder')}
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <SiGamebanana /> {t('profile.edit_modal.gamebanana')}
                                    </label>
                                    <input
                                        type = "text"
                                        name = "gamebanana"
                                        value = {profile_data.gamebanana}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = {t('profile.edit_modal.gamebanana_placeholder')}
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <SiGamejolt /> {t('profile.edit_modal.gamejolt')}
                                    </label>
                                    <input
                                        type = "text"
                                        name = "gamejolt"
                                        value = {profile_data.gamejolt}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = {t('profile.edit_modal.gamejolt_placeholder')}
                                    />
                                </div>

                                <div className = "form-group">
                                    <label className = "form-label">
                                        <FaTwitch /> {t('profile.edit_modal.twitch')}
                                    </label>
                                    <input
                                        type = "text"
                                        name = "twitch"
                                        value = {profile_data.twitch}
                                        onChange = {handle_input_change}
                                        className = "form-input"
                                        placeholder = {t('profile.edit_modal.twitch_placeholder')}
                                    />
                                </div>

                                <div className = "form-group full-width">
                                    <label className = "form-label">
                                        <FiZap /> {t('profile.edit_modal.engines')}
                                    </label>
                                    <div className = "engines-selector">
                                        {GAME_ENGINE_DEFINITIONS.map(engine => {
                                            const is_selected = profile_data.engines.includes(engine.id);
                                            return (
                                                <button
                                                    key = {engine.id}
                                                    type = "button"
                                                    className = {`engine-selector-btn ${is_selected ? 'selected' : ''}`}
                                                    onClick = {() => {
                                                        const new_engines = is_selected
                                                            ? profile_data.engines.filter(id => id !== engine.id)
                                                            : [...profile_data.engines, engine.id];
                                                        set_profile_data(prev => ({ ...prev, engines: new_engines }));
                                                    }}
                                                    style = {{ 
                                                        borderColor: is_selected ? engine.color : 'transparent',
                                                        backgroundColor: is_selected ? `${engine.color}20` : 'transparent'
                                                    }}
                                                >
                                                    <span className = "engine-selector-icon" style = {{ color: engine.color }}>
                                                        {engine.icon}
                                                    </span>
                                                    <span className = "engine-selector-name">{engine.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className = "modal-footer">
                            <button onClick = {() => set_show_edit_modal(false)} className = "btn btn-game-outline">
                                {t('common.cancel')}
                            </button>
                            <button onClick = {handle_save_profile} className = "btn btn-gradient">
                                <FiSave /> {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Engine Info Popup */}
            {engine_popup && (
                <div className = "modal-overlay" onClick = {() => set_engine_popup(null)}>
                    <div className = "modal-content engine-popup" onClick = {(e) => e.stopPropagation()}>
                        <div className = "modal-header" style = {{ borderBottomColor: engine_popup.color }}>
                            <div className = "engine-popup-title">
                                <span className = "engine-popup-icon" style = {{ color: engine_popup.color }}>
                                    {engine_popup.icon}
                                </span>
                                <h2>{engine_popup.name}</h2>
                            </div>
                            <button className = "btn-icon" onClick = {() => set_engine_popup(null)}>
                                <FiX />
                            </button>
                        </div>
                        <div className = "modal-body">
                            <div className = "engine-info-section">
                                <h4>{t('profile.engine_modal.description_title')}</h4>
                                <p>{t(`profile.engines.${engine_popup.translationKey}.description`)}</p>
                            </div>
                            <div className = "engine-info-section">
                                <h4>{t('profile.engine_modal.audience_title')}</h4>
                                <p>{t(`profile.engines.${engine_popup.translationKey}.audience`)}</p>
                            </div>
                            <div className = "engine-info-section">
                                <h4>{t('profile.engine_modal.languages_title')}</h4>
                                <p className = "engine-languages">{t(`profile.engines.${engine_popup.translationKey}.languages`)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
