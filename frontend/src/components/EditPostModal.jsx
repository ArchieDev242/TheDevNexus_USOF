import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 
{ 
    FiX,
    FiEye,
    FiEdit3,
    FiCode,
    FiLink,
    FiSmile,
    FiTag,
    FiSave
} from 'react-icons/fi';

import '../style/create-post-modal.css';

const EMOJI_LIST = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
    '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
    '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
    '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
    '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔',
    '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦'
];

export default function EditPostModal({ show, onClose, post, onPostUpdated }) {
    const { user } = useSelector(state => state.auth);
    const [active_tab, set_active_tab] = useState('write');
    const [show_emoji_picker, set_show_emoji_picker] = useState(false);
    const [categories_list, set_categories_list] = useState([]);
    const [loading, set_loading] = useState(false);
    
    const [post_data, set_post_data] = useState({
        title: '',
        content: '',
        categories: [],
        status: 'active'
    });

    useEffect(() => {
        if(post) 
            {
            set_post_data({
                title: post.title || '',
                content: post.content || '',
                categories: post.categories?.map(c => c.id) || [],
                status: post.status || 'active'
            });
        }
    }, [post]);

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
           
            if(data.status === 'success') set_categories_list(data.data || []);
        } catch(error) 
        {
            console.error('Error fetching categories:', error);
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
        if(!textarea) return;
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
            const cursor_pos = start + new_text.length;
            textarea.setSelectionRange(cursor_pos, cursor_pos);
        }, 0);
    };

    const insert_emoji = (emoji) => {
        const textarea = document.querySelector('.post-content-textarea');
        if(!textarea) return;
        const cursor_pos = textarea.selectionStart;
        
        const new_content = 
            post_data.content.substring(0, cursor_pos) + 
            emoji + 
            post_data.content.substring(cursor_pos);
        
        set_post_data(prev => ({ ...prev, content: new_content }));
        set_show_emoji_picker(false);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(cursor_pos + emoji.length, cursor_pos + emoji.length);
        }, 0);
    };

    const handle_submit = async (e) => {
        e.preventDefault();

        if(!post_data.title.trim()) 
            {
            alert('Будь ласка, введіть заголовок поста');
            return;
        }

        if(!post_data.content.trim()) 
            {
            alert('Будь ласка, введіть вміст поста');
            return;
        }

        if(!post_data.categories || post_data.categories.length === 0) 
            {
            alert('Будь ласка, виберіть хоча б одну категорію');
            return;
        }

        set_loading(true);

        try 
        {
            const response = await fetch(`/api/posts/${post.id}`, {
                method: 'PATCH',
                headers: 
                {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',
                body: JSON.stringify({
                    title: post_data.title,
                    content: post_data.content,
                    categories: post_data.categories,
                    status: post_data.status
                })
            });

            const data = await response.json();

            if(data.status === 'success') 
                {
                alert('Пост успішно оновлено!');
                onPostUpdated(data.data);
                onClose();
            } else 
                {
                alert(data.message || 'Помилка оновлення поста');
            }
        } catch(error) 
        {
            console.error('Error updating post:', error);
            alert('Помилка оновлення поста');
        } finally 
        {
            set_loading(false);
        }
    };

    if (!show) return null;

    return (
        <div className = "modal-overlay" onClick = {onClose}>
            <div className = "create-post-modal" onClick = {(e) => e.stopPropagation()}>
                <div className = "modal-header">
                    <h2>✨ Редагувати пост</h2>
                    <button className = "close-btn" onClick = {onClose}>
                        <FiX />
                    </button>
                </div>

                <div className = "modal-body">
                    <form onSubmit = {handle_submit}>
                        <div className = "form-group">
                            <label htmlFor = "title">Назва поста</label>
                            <input
                                type = "text"
                                id = "title"
                                name = "title"
                                className = "form-input"
                                placeholder = "Введіть назву вашого поста..."
                                value = {post_data.title}
                                onChange = {handle_input_change}
                                maxLength = {200}
                            />
                        </div>

                        <div className = "editor-tabs">
                            <button
                                type = "button"
                                className = {`tab-btn ${active_tab === 'write' ? 'active' : ''}`}
                                onClick = {() => set_active_tab('write')}
                            >
                                <FiEdit3 />
                                <span>Write</span>
                            </button>
                            <button
                                type = "button"
                                className = {`tab-btn ${active_tab === 'preview' ? 'active' : ''}`}
                                onClick = {() => set_active_tab('preview')}
                            >
                                <FiEye />
                                <span>Preview</span>
                            </button>
                        </div>

                        {active_tab === 'write' ? (
                            <>
                                <div className = "markdown-toolbar">
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('bold')}
                                        title = "Bold"
                                    >
                                        <strong>B</strong>
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('italic')}
                                        title = "Italic"
                                    >
                                        <em>I</em>
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('code')}
                                        title = "Inline code"
                                    >
                                        <FiCode />
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('code-block')}
                                        title = "Code block"
                                    >
                                        <code>{'{ }'}</code>
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('link')}
                                        title = "Link"
                                    >
                                        <FiLink />
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('heading')}
                                        title = "Heading"
                                    >
                                        H
                                    </button>
                                    <button
                                        type = "button"
                                        className = "toolbar-btn"
                                        onClick = {() => insert_markdown('list')}
                                        title = "List"
                                    >
                                        ☰
                                    </button>
                                    <div className = "emoji-picker-wrapper">
                                        <button
                                            type = "button"
                                            className = "toolbar-btn"
                                            onClick = {() => set_show_emoji_picker(!show_emoji_picker)}
                                            title = "Emoji"
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
                                    placeholder = "Напишіть ваш пост тут... Підтримується Markdown!"
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
                                    <p className = "preview-placeholder">Нічого для попереднього перегляду...</p>
                                )}
                            </div>
                        )}

                        <div className = "form-group">
                            <label>
                                <FiTag />
                                <span>Категорії</span>
                            </label>
                            <div className = "categories-grid">
                                {categories_list.map(category => (
                                    <label key = {category.id} className = "category-checkbox">
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

                        {user?.role === 'admin' && (
                            <div className = "form-group">
                                <label htmlFor = "status">Статус</label>
                                <select
                                    id = "status"
                                    name = "status"
                                    className = "form-input"
                                    value = {post_data.status}
                                    onChange = {handle_input_change}
                                >
                                    <option value = "active">Опублікувати зараз</option>
                                    <option value = "inactive">Зберегти як чернетку</option>
                                </select>
                            </div>
                        )}

                        <div className = "modal-footer">
                            <button 
                                type = "button" 
                                className = "btn btn-outline" 
                                onClick = {onClose}
                                disabled = {loading}
                            >
                                Скасувати
                            </button>
                            <button 
                                type = "submit" 
                                className = "btn btn-gradient"
                                disabled = {loading}
                            >
                                <FiSave />
                                <span>{loading ? 'Збереження...' : 'Зберегти зміни'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
