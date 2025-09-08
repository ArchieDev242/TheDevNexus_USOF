CREATE DATABASE IF NOT EXISTS USOF;
CREATE USER IF NOT EXISTS 'mkopychko'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON USOF.* TO 'mkopychko'@'localhost';

USE USOF;

CREATE TABLE IF NOT EXISTS users(
    id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_picture VARCHAR(255) DEFAULT 'default_avatar.png',
    rating INT DEFAULT 0,
    role ENUM('user', 'admin') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for tracking guest sessions (optional, for analytics)
CREATE TABLE IF NOT EXISTS guest_sessions(
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_session_token (session_token),
    INDEX idx_last_activity (last_activity)
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions(
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_type ENUM('guest', 'user', 'admin') NOT NULL,
    permission VARCHAR(100) NOT NULL,
    UNIQUE KEY unique_role_permission (role_type, permission)
);

CREATE TABLE IF NOT EXISTS posts(
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL, -- Only registered users can create posts
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories(
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_categories(
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments(
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    author_id INT NOT NULL, -- Only registered users can comment
    content TEXT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL, -- Only registered users can like/dislike
    post_id INT NULL,
    comment_id INT NULL,
    type ENUM('like', 'dislike') NOT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_post_like (author_id, post_id),
    UNIQUE KEY unique_user_comment_like (author_id, comment_id),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- test categories for gamedev
INSERT IGNORE INTO categories (title, description) VALUES
('Unreal Engine', 'Питання та відповіді по розробці ігор на Unreal Engine 4/5'),
('Unity', 'Обговорення розробки ігор на Unity Engine'),
('Godot', 'Спільнота розробників Godot Engine'),
('Ren''Py', 'Створення візуальних новел та інтерактивних історій на Ren''Py'),
('Custom Engines', 'Розробка власних ігрових рушіїв на OpenGL, Vulkan, DirectX та з нуля');

-- test admin user
INSERT IGNORE INTO users (login, password, full_name, email, role, email_verified) VALUES
('admin', '$2b$10$rGK.Fc8VQFvQJPzQzWQwCuY7yE8s6v7vq5v9x3Q1o5Q1o5Q1o5Q1o5', 'Admin User', 'admin@devnexus.org', 'admin', TRUE);

-- Insert test users
INSERT IGNORE INTO users (login, password, full_name, email, email_verified) VALUES
('gamedev_ukr', '$2b$10$rGK.Fc8VQFvQJPzQzWQwCuY7yE8s6v7vq5v9x3Q1o5Q1o5Q1o5Q1o5', 'Олександр Петренко', 'alex@example.com', TRUE),
('unity_master', '$2b$10$rGK.Fc8VQFvQJPzQzWQwCuY7yE8s6v7vq5v9x3Q1o5Q1o5Q1o5Q1o5', 'Марія Іваненко', 'maria@example.com', TRUE),
('indie_dev', '$2b$10$rGK.Fc8VQFvQJPzQzWQwCuY7yE8s6v7vq5v9x3Q1o5Q1o5Q1o5Q1o5', 'Дмитро Коваленко', 'dmytro@example.com', TRUE),
('artist_2d', '$2b$10$rGK.Fc8VQFvQJPzQzWQwCuY7yE8s6v7vq5v9x3Q1o5Q1o5Q1o5Q1o5', 'Анна Сидоренко', 'anna@example.com', TRUE);

-- test posts
INSERT IGNORE INTO posts (author_id, title, content, status) VALUES
(2, 'Як оптимізувати рендеринг в Unreal Engine 5?', 'Маю проблеми з продуктивністю у великому рівні. Які налаштування краще використовувати?', 'active'),
(3, 'Unity vs Unreal для інді-розробника', 'Не можу визначитися з вибором движка для свого першого проєкту. Що порадите?', 'active'),
(4, 'Проблеми з анімацією персонажа в Godot', 'Анімація не відтворюється правильно. Ось код...', 'active'),
(5, 'Створюємо OpenGL рендерер з нуля', 'Поділюся досвідом написання власного графічного рушія на OpenGL', 'active'),
(2, 'Налаштування освітлення в UE5', 'Детальний гайд по Lumen та віртуальному освітленню', 'inactive'),
(3, 'Створення візуальної новели в Ren''Py', 'Початківець у створенні VN - з чого почати?', 'active');

-- Link posts with categories
INSERT IGNORE INTO post_categories (post_id, category_id) VALUES
(1, 1), -- Unreal Engine
(2, 1), (2, 2), -- Unity and Unreal
(3, 3), -- Godot
(4, 5), -- Custom Engines (OpenGL)
(5, 1), -- Unreal Engine
(6, 4); -- Ren'Py

-- Insert test comments
INSERT IGNORE INTO comments (post_id, author_id, content) VALUES
(1, 3, 'Спробуй використовувати LOD систему та Nanite virtualized geometry'),
(1, 4, 'Також варто оптимізувати матеріали та texture streaming'),
(2, 2, 'Для інді Unity простіший у вивченні, але Unreal має кращу графіку'),
(3, 5, 'В Godot перевір чи правильно налаштований AnimationPlayer'),
(4, 3, 'Супер стаття! Дуже корисно для початківців');

-- Insert test likes
INSERT IGNORE INTO likes (author_id, post_id, type) VALUES
(2, 1, 'like'),
(3, 1, 'like'),
(4, 2, 'like'),
(5, 2, 'dislike'),
(2, 3, 'like'),
(3, 4, 'like');

INSERT IGNORE INTO likes (author_id, comment_id, type) VALUES
(4, 1, 'like'),
(5, 2, 'like'),
(3, 3, 'like');

-- Налаштування дозволів для ролей
-- Permissions for guests
INSERT IGNORE INTO role_permissions (role_type, permission) VALUES
('guest', 'read_posts'),
('guest', 'read_comments'),
('guest', 'read_categories'),
('guest', 'view_user_profiles');

-- Permissions for registered users
INSERT IGNORE INTO role_permissions (role_type, permission) VALUES
('user', 'read_posts'),
('user', 'read_comments'),
('user', 'read_categories'),
('user', 'view_user_profiles'),
('user', 'create_posts'),
('user', 'create_comments'),
('user', 'edit_own_posts'),
('user', 'edit_own_comments'),
('user', 'delete_own_posts'),
('user', 'delete_own_comments'),
('user', 'like_posts'),
('user', 'like_comments'),
('user', 'upload_avatar');

-- Permissions for administrators
INSERT IGNORE INTO role_permissions (role_type, permission) VALUES
('admin', 'read_posts'),
('admin', 'read_comments'),
('admin', 'read_categories'),
('admin', 'view_user_profiles'),
('admin', 'create_posts'),
('admin', 'create_comments'),
('admin', 'create_categories'),
('admin', 'edit_own_posts'),
('admin', 'edit_own_comments'),
('admin', 'edit_any_posts'),
('admin', 'edit_any_comments'),
('admin', 'edit_categories'),
('admin', 'delete_own_posts'),
('admin', 'delete_own_comments'),
('admin', 'delete_any_posts'),
('admin', 'delete_any_comments'),
('admin', 'delete_categories'),
('admin', 'like_posts'),
('admin', 'like_comments'),
('admin', 'upload_avatar'),
('admin', 'manage_users'),
('admin', 'change_user_roles'),
('admin', 'view_analytics');