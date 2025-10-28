import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import 
{ 
    FiX, 
    FiEye, 
    FiEdit3, 
    FiCode, 
    FiLink, 
    FiSmile,
    FiTag,
    FiSend,
    FiPlus,
    FiTrash2
} from 'react-icons/fi';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../style/create-post-modal.css';

const EMOJI_LIST = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏',
    '💻', '🖥️', '⌨️', '🖱️', '🖨️', '💾', '💿', '📀', '🧮', '🎮',
    '🕹️', '🎯', '🎲', '🎰', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼',
    '🚀', '🛸', '🌟', '⭐', '💫', '✨', '🔥', '💥', '⚡', '💡',
    '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️'
];

export default function CreatePostModal({ show, onClose, onPostCreated }) 
{
    const { user } = useSelector(state => state.auth);
    const { t } = useTranslation();
    const [active_tab, set_active_tab] = useState('write');
    const [show_emoji_picker, set_show_emoji_picker] = useState(false);
    
    const [post_data, set_post_data] = useState({
        title: '',
        content: '',
        categories: [],
        status: 'active',
        blueprints: []
    });

    const [categories_list, set_categories_list] = useState([]);
    const [loading, set_loading] = useState(false);
    const [blueprint_url, set_blueprint_url] = useState('');
    const [blueprint_search, set_blueprint_search] = useState('');
    const [blueprint_results, set_blueprint_results] = useState([]);
    const [searching_blueprints, set_searching_blueprints] = useState(false);
    const [show_create_blueprint, set_show_create_blueprint] = useState(false);
    const [creating_blueprint, set_creating_blueprint] = useState(false);
    const [blueprint_form, set_blueprint_form] = useState({
        title: '',
        author: '',
        url: ''
    });

    useEffect(() => {
        if(show) fetch_categories();
    }, [show]);

    const fetch_categories = async () => {
        try 
        {
            const response = await fetch('/api/categories', {
                credentials: 'include'
            });
            
            const data = await response.json();
            console.log('Categories fetched:', data);
            
            if(data.status === 'success') 
                {
                // API returns { categories, total_active_posts }
                const categories = Array.isArray(data.data?.categories) 
                    ? data.data.categories 
                    : (Array.isArray(data.data) ? data.data : []);
                console.log('Setting categories:', categories);
                set_categories_list(categories);
            } else 
                {
                console.log('API returned non-success status:', data);
                set_categories_list([]);
            }
        } catch(error) 
        {
            console.error('Error fetching categories:', error);
            set_categories_list([]);
        }
    };

    const search_blueprints = async (query) => {
        if(!query.trim()) 
        {
            set_blueprint_results([]);
            return;
        }

        set_searching_blueprints(true);
        try 
        {
            // Try backend API first (for custom blueprints)
            const response = await fetch(`/api/blueprints/search?query=${encodeURIComponent(query)}&limit=8`, {
                credentials: 'include'
            });

            const data = await response.json();
            
            if(data.status === 'success' && data.data) 
            {
                set_blueprint_results(data.data);
            } else 
            {
                console.error('Blueprint search failed:', data.error);
                set_blueprint_results([]);
            }
        } catch(error) 
        {
            console.error('Error searching blueprints:', error);
            set_blueprint_results([]);
        } finally 
        {
            set_searching_blueprints(false);
        }
    };

    const add_blueprint = (blueprint) => {
        if(!post_data.blueprints.find(b => b.id === blueprint.id))
        {
            set_post_data(prev => ({
                ...prev,
                blueprints: [...prev.blueprints, blueprint]
            }));
            set_blueprint_search('');
            set_blueprint_results([]);
        }
    };

    const remove_blueprint = (blueprint_id) => {
        set_post_data(prev => ({
            ...prev,
            blueprints: prev.blueprints.filter(b => b.id !== blueprint_id)
        }));
    };

    const handle_create_blueprint = async () => {
        if(!blueprint_form.title.trim())
        {
            alert(t('post_form.validation.blueprint_title_required'));
            return;
        }

        set_creating_blueprint(true);
        try 
        {
            const response = await fetch('/api/blueprints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: blueprint_form.title,
                    author: blueprint_form.author || user?.login,
                    url: blueprint_form.url
                })
            });

            const data = await response.json();
            
            if(response.ok && data.status === 'success')
            {
                // Add newly created blueprint to selection
                add_blueprint(data.data);
                
                // Reset form
                set_blueprint_form({ title: '', author: '', url: '' });
                set_show_create_blueprint(false);
                alert(t('post_form.notifications.blueprint_created'));
            } else 
            {
                alert(data.error || t('post_form.errors.blueprint_create'));
            }
        } catch(error)
        {
            console.error('Error creating blueprint:', error);
            alert(t('post_form.errors.blueprint_create'));
        } finally 
        {
            set_creating_blueprint(false);
        }
    };

    const handle_input_change = (e) => {
        const { name, value } = e.target;
        set_post_data(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handle_category_toggle = (category_id) => {
        set_post_data(prev => {
            const categories = prev.categories.includes(category_id)
                ? prev.categories.filter(id => id !== category_id)
                : [...prev.categories, category_id];
            return { ...prev, categories };
        });
    };

    const insert_markdown = (type) => {
        const textarea = document.querySelector('.post-content-textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected_text = post_data.content.substring(start, end);
        let new_text = '';

        switch(type) 
        {
            case 'bold': new_text = `**${selected_text || 'bold text'}**`; break;
            case 'italic': new_text = `*${selected_text || 'italic text'}*`; break;
            case 'code': new_text = `\`${selected_text || 'code'}\``; break;
            case 'code-block': new_text = `\n\`\`\`javascript\n${selected_text || '// Your code here'}\n\`\`\`\n`; break;
            case 'link': new_text = `[${selected_text || 'link text'}](url)`; break;
            case 'heading': new_text = `\n## ${selected_text || 'Heading'}\n`; break;
            case 'list': new_text = `\n- ${selected_text || 'List item'}\n`; break;
            default: return;
        }

        const new_content = 
            post_data.content.substring(0, start) + 
            new_text + 
            post_data.content.substring(end);

        set_post_data(prev => ({ ...prev, content: new_content }));

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + new_text.length, start + new_text.length);
        }, 0);
    };

    const insert_emoji = (emoji) => {
        const textarea = document.querySelector('.post-content-textarea');
        const start = textarea.selectionStart;
        
        const new_content = 
            post_data.content.substring(0, start) + 
            emoji + 
            post_data.content.substring(start);

        set_post_data(prev => ({ ...prev, content: new_content }));
        set_show_emoji_picker(false);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
    };

    const handle_submit = async (e) => {
        e.preventDefault();
        
        if(!post_data.title.trim()) 
            {
            alert(t('post_form.validation.title_required'));
            return;
        }

        if(!post_data.content.trim()) 
            {
            alert(t('post_form.validation.content_required'));
            return;
        }

        if(!post_data.categories || post_data.categories.length === 0) 
            {
            alert(t('post_form.validation.categories_required'));
            return;
        }

        set_loading(true);

        try 
        {
            console.log('Sending post data:', {
                title: post_data.title,
                content: post_data.content,
                status: post_data.status,
                categories: post_data.categories
            });

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',
                body: JSON.stringify({
                    title: post_data.title,
                    content: post_data.content,
                    status: post_data.status,
                    categories: post_data.categories,
                    blueprints: post_data.blueprints.map(b => ({
                        id: b.id,
                        title: b.title,
                        author: b.author,
                        url: b.url
                    }))
                })
            });

            const data = await response.json();
            console.log('Response:', data);

            if(response.ok && data.status === 'success') 
                {
                alert(t('post_form.notifications.post_created'));
                set_post_data({
                    title: '',
                    content: '',
                    categories: [],
                    status: 'active',
                    blueprints: []
                });
                if(onPostCreated) onPostCreated(data.data);
                onClose();
            } else 
                {
                alert(data.error || t('post_form.errors.post_create'));
            }
        } catch(error) 
        {
            console.error('Error creating post:', error);
            alert(t('post_form.errors.post_create'));
        } finally 
        {
            set_loading(false);
        }
    };

    if(!show) return null;

    return (
        <div className = "modal-overlay" onClick = {onClose}>
            <div className = "create-post-modal" onClick = {(e) => e.stopPropagation()}>
                <div className = "modal-header">
                    <h2>✨ {t('post_form.create.title')}</h2>
                    <button className = "close-btn" onClick = {onClose}>
                        <FiX />
                    </button>
                </div>

                <div className = "modal-body">
                    <form onSubmit = {handle_submit}>
                        <div className = "form-group">
                            <label htmlFor = "title">{t('post_form.fields.title_label')}</label>
                            <input
                                type = "text"
                                id = "title"
                                name = "title"
                                className = "form-input"
                                placeholder = {t('post_form.fields.title_placeholder')}
                                value = {post_data.title}
                                onChange = {handle_input_change}
                                required
                            />
                        </div>

                        <div className = "editor-tabs">
                            <button
                                type = "button"
                                className = {`tab-btn ${active_tab === 'write' ? 'active' : ''}`}
                                onClick = {() => set_active_tab('write')}
                            >
                                <FiEdit3 />
                                <span>{t('post_form.tabs.write')}</span>
                            </button>
                            <button
                                type = "button"
                                className = {`tab-btn ${active_tab === 'preview' ? 'active' : ''}`}
                                onClick = {() => set_active_tab('preview')}
                            >
                                <FiEye />
                                <span>{t('post_form.tabs.preview')}</span>
                            </button>
                        </div>

                        {active_tab === 'write' ? (
                            <>
                                <div className = "markdown-toolbar">
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('bold')}
                                        title = {t('post_form.toolbar.bold')}
                                    >
                                        <strong>B</strong>
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('italic')}
                                        title = {t('post_form.toolbar.italic')}
                                    >
                                        <em>I</em>
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('code')}
                                        title = {t('post_form.toolbar.inline_code')}
                                    >
                                        <FiCode />
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('code-block')}
                                        title = {t('post_form.toolbar.code_block')}
                                    >
                                        <code>{'{ }'}</code>
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('link')}
                                        title = {t('post_form.toolbar.link')}
                                    >
                                        <FiLink />
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('heading')}
                                        title = {t('post_form.toolbar.heading')}
                                    >
                                        H
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('list')}
                                        title = {t('post_form.toolbar.list')}
                                    >
                                        ☰
                                    </button>
                                    <div className = "emoji-picker-wrapper">
                                        <button
                                            type = "button"
                                            className = "toolbar-btn"
                                            onClick = {() => set_show_emoji_picker(!show_emoji_picker)}
                                            title = {t('post_form.toolbar.emoji')}
                                        >
                                            <FiSmile />
                                        </button>
                                        {show_emoji_picker && (
                                            <div className = "emoji-picker">
                                                {EMOJI_LIST.map((emoji, index) => (
                                                    <button
                                                        key = {index}
                                                        type = "button"
                                                        className = "emoji-btn"
                                                        onClick = {() => insert_emoji(emoji)}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <textarea
                                    name = "content"
                                    className = "form-input post-content-textarea"
                                    placeholder = {t('post_form.fields.content_placeholder')}
                                    value = {post_data.content}
                                    onChange = {handle_input_change}
                                    rows = {15}
                                    required
                                />
                            </>
                        ) : (
                            <div className = "markdown-preview">
                                {post_data.content ? (
                                    <ReactMarkdown
                                        remarkPlugins = {[remarkGfm]}
                                        components = {{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <pre className = "code-block">
                                                        <code className = {className} {...props}>
                                                            {String(children).replace(/\n$/, '')}
                                                        </code>
                                                    </pre>
                                                ) : (
                                                    <code className = {className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {post_data.content}
                                    </ReactMarkdown>
                                ) : (
                                    <p className = "preview-placeholder">{t('post_form.preview.empty')}</p>
                                )}
                            </div>
                        )}

                        <div className = "form-group">
                            <label>
                                <FiTag />
                                <span>{t('post_form.categories.label')}</span>
                            </label>
                            <div className = "categories-grid">
                                {Array.isArray(categories_list) && categories_list.map(category => (
                                    <label key = {category.id} className = "category-checkbox" title = {category.title}>
                                        <input
                                            type = "checkbox"
                                            checked = {post_data.categories.includes(category.id)}
                                            onChange = {() => handle_category_toggle(category.id)}
                                        />
                                        <span>{category.title}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {post_data.categories.some(cat_id => 
                            categories_list.find(c => c.id === cat_id && c.title?.includes('Unreal'))
                        ) && (
                            <div className = "form-group">
                                <label>
                                    <FiCode />
                                    <span>{t('post_form.blueprints.section_title')}</span>
                                </label>
                                <div className = "blueprint-search-box">
                                    <input
                                        type = "text"
                                        className = "form-input"
                                        placeholder = {t('post_form.blueprints.search_placeholder')}
                                        value = {blueprint_search}
                                        onChange = {(e) => {
                                            set_blueprint_search(e.target.value);
                                            search_blueprints(e.target.value);
                                        }}
                                    />
                                    {searching_blueprints && (
                                        <div className = "blueprint-loading">{t('post_form.blueprints.loading')}</div>
                                    )}
                                    <button
                                        type = "button"
                                        className = "btn-create-blueprint"
                                        onClick = {() => set_show_create_blueprint(!show_create_blueprint)}
                                        title = {t('post_form.blueprints.create_button_title')}
                                    >
                                        <FiPlus />
                                    </button>
                                </div>

                                {show_create_blueprint && (
                                    <div className = "blueprint-create-form">
                                        <h4>{t('post_form.blueprints.create_title')}</h4>
                                        <input
                                            type = "text"
                                            className = "form-input"
                                            placeholder = {t('post_form.blueprints.name_placeholder')}
                                            value = {blueprint_form.title}
                                            onChange = {(e) => set_blueprint_form({...blueprint_form, title: e.target.value})}
                                        />
                                        <input
                                            type = "text"
                                            className = "form-input"
                                            placeholder = {t('post_form.blueprints.author_placeholder')}
                                            value = {blueprint_form.author}
                                            onChange = {(e) => set_blueprint_form({...blueprint_form, author: e.target.value})}
                                        />
                                        <input
                                            type = "text"
                                            className = "form-input"
                                            placeholder = {t('post_form.blueprints.url_placeholder')}
                                            value = {blueprint_form.url}
                                            onChange = {(e) => set_blueprint_form({...blueprint_form, url: e.target.value})}
                                        />
                                        <div className = "blueprint-form-actions">
                                            <button
                                                type = "button"
                                                className = "btn btn-gradient"
                                                onClick = {handle_create_blueprint}
                                                disabled = {creating_blueprint}
                                            >
                                                {creating_blueprint ? t('post_form.blueprints.creating') : t('post_form.blueprints.create_action')}
                                            </button>
                                            <button
                                                type = "button"
                                                className = "btn btn-outline"
                                                onClick = {() => {
                                                    set_show_create_blueprint(false);
                                                    set_blueprint_form({title: '', author: '', url: ''});
                                                }}
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {blueprint_results.length > 0 && (
                                    <div className = "blueprint-results">
                                        {blueprint_results.map(blueprint => (
                                            <div key = {blueprint.id} className = "blueprint-result-item" title = {blueprint.title}>
                                                <div className = "blueprint-info">
                                                    <div className = "blueprint-name">{blueprint.title}</div>
                                                    <div className = "blueprint-author">{t('post_form.blueprints.by_author', { author: blueprint.author || t('post_form.blueprints.unknown_author') })}</div>
                                                </div>
                                                <button
                                                    type = "button"
                                                    className = "btn-add-blueprint"
                                                    onClick = {() => add_blueprint(blueprint)}
                                                >
                                                    <FiPlus /> {t('post_form.blueprints.add_button')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {post_data.blueprints.length > 0 && (
                                    <div className = "blueprints-list">
                                        <label>{t('post_form.blueprints.selected_label')}</label>
                                        {post_data.blueprints.map(blueprint => (
                                            <div key = {blueprint.id} className = "blueprint-tag">
                                                <span>{blueprint.title}</span>
                                                <button
                                                    type = "button"
                                                    className = "remove-blueprint"
                                                    onClick = {() => remove_blueprint(blueprint.id)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className = "form-group">
                            <label htmlFor = "status">{t('post_form.status.label')}</label>
                            <select
                                id = "status"
                                name = "status"
                                className = "form-input"
                                value = {post_data.status}
                                onChange = {handle_input_change}
                            >
                                <option value = "active">{t('post_form.status.publish_now')}</option>
                                <option value = "inactive">{t('post_form.status.save_draft')}</option>
                            </select>
                        </div>

                        <div className = "modal-footer">
                            <button 
                                type = "button" 
                                className = "btn btn-outline" 
                                onClick = {onClose}
                                disabled = {loading}
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                type = "submit" 
                                className = "btn btn-gradient"
                                disabled = {loading}
                            >
                                <FiSend />
                                <span>{loading ? t('post_form.buttons.publishing') : t('post_form.buttons.publish')}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
