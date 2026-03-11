-- ======================================
-- Blog Database Initialization Script
-- ======================================

-- 创建数据库
CREATE DATABASE blog_db;

-- 连接数据库
\c blog_db;

-- 启用 UUID 生成
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- Users Table
-- ======================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    avatar VARCHAR(255),
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- Posts Table
-- ======================================

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image VARCHAR(255),
    author_id UUID NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_author
        FOREIGN KEY(author_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ======================================
-- Comments Table
-- ======================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post
        FOREIGN KEY(post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ======================================
-- Tags Table
-- ======================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- Post Tags (Many-to-Many)
-- ======================================

CREATE TABLE post_tags (
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL,

    PRIMARY KEY(post_id, tag_id),

    CONSTRAINT fk_post_tag_post
        FOREIGN KEY(post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_post_tag_tag
        FOREIGN KEY(tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);

-- ======================================
-- Indexes
-- ======================================

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- ======================================
-- Example Data
-- ======================================

INSERT INTO users (name, email, role)
VALUES
('Jack', 'jack@example.com', 'admin');

INSERT INTO tags (name)
VALUES
('React'),
('JavaScript'),
('Web Development');
