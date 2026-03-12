-- ======================================
-- Blog Database Initialization Script
-- ======================================

-- Supabase has its own database; 不需要创建或连接

-- 启用 UUID 生成扩展（Supabase 推荐 pgcrypto）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- 或者：CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- 枚举类型定义
-- ======================================

-- 用户角色枚举：admin(全部权限) > editor(编辑权限) > viewer(阅读权限)
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- 评论状态枚举：pending(待审核) -> approved(已批准) / rejected(已拒绝)
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected');

-- ======================================
-- Users Table
-- ======================================
-- 用户表：存储所有系统用户信息
-- 注意：password 字段为必填，前端需验证强度；is_active 用于软停用用户而无需删除

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- 必填字段：确保用户密码安全
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,   -- 激活状态：true=可用，false=禁用（软删除）
    role user_role DEFAULT 'viewer',  -- 角色权限：admin/editor/viewer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 自动更新：用触发器维护
);

-- ======================================
-- Categories Table
-- ======================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- Posts Table
-- ======================================
-- 文章表：博客文章的核心内容存储
-- 关键设计：
--   - slug 用于 URL 友好的链接生成
--   - published/published_at：分离发布状态与发布时间（由触发器自动同步）
--   - deleted_at：软删除字段，支持恢复已删除的文章
--   - view_count：浏览计数（可选择改为单独的 views 表以便统计）

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,        -- URL友好的路径标识符
    content TEXT NOT NULL,
    excerpt TEXT,                              -- 摘要：列表页展示用
    cover_image VARCHAR(255),                  -- 封面图片URL

    author_id UUID NOT NULL,
    category_id UUID,                          -- 可选：同一篇文章只属于一个分类

    published BOOLEAN DEFAULT FALSE,           -- 发布状态
    published_at TIMESTAMP,                    -- 发布时间戳（由触发器自动设置）
    view_count INT DEFAULT 0,                  -- 浏览次数

    deleted_at TIMESTAMP,                      -- 软删除时间戳

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_author
        FOREIGN KEY(author_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL                     -- 删除分类不删除文章，只清除分类关联
);

-- ======================================
-- Comments Table
-- ======================================
-- 评论表：支持已登录用户和匿名访客的评论
-- 关键约束：check_comment_author 确保登录用户和匿名用户只能二选一
--   - 登录用户：user_id 非空，guest_name/guest_email 必为 NULL
--   - 匿名访客：user_id 为 NULL，guest_name 必填
-- 审核流程：pending -> approved / rejected

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    post_id UUID NOT NULL,
    user_id UUID,                             -- 登录用户ID（匿名评论时为NULL）
    
    -- 匿名访客信息
    guest_name VARCHAR(100),                  -- 访客昵称（登录用户时为NULL）
    guest_email VARCHAR(255),                 -- 访客邮箱（用于回复通知）
    
    status comment_status DEFAULT 'pending',  -- 审核状态
    
    deleted_at TIMESTAMP,                     -- 软删除
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post
        FOREIGN KEY(post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,
    
    -- 强制：登录用户或匿名用户二选一，不允许混淆
    CONSTRAINT check_comment_author
        CHECK ((user_id IS NOT NULL AND guest_name IS NULL) OR 
               (user_id IS NULL AND guest_name IS NOT NULL))
);

-- ======================================
-- Tags Table
-- ======================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- Post Likes Table
-- ======================================
-- 点赞表：支持已登录用户和匿名访客的点赞
-- 关键设计：
--   - 使用部分唯一索引处理 NULL 值（UNIQUE 约束无法正确处理 NULL）
--   - 确保同个用户或IP对一篇文章只能点赞一次
--   - check_like_source 约束确保用户和IP二选一

CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL,
    user_id UUID,                             -- 登录用户ID（匿名点赞时为NULL）
    guest_ip VARCHAR(45),                     -- 访客IP（IPv4或IPv6）
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_like_post
        FOREIGN KEY(post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_like_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,
    
    -- 强制：用户或IP地址二选一
    CONSTRAINT check_like_source
        CHECK ((user_id IS NOT NULL AND guest_ip IS NULL) OR 
               (user_id IS NULL AND guest_ip IS NOT NULL))
);

-- ======================================
-- Post Tags Table (Many-to-Many)
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

-- Users 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Categories 索引
CREATE INDEX idx_categories_slug ON categories(slug);

-- Posts 索引
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(published, published_at DESC);
CREATE INDEX idx_posts_deleted ON posts(deleted_at);

-- Comments 索引
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_deleted ON comments(deleted_at);

-- Tags 索引
CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- Likes 索引
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
CREATE UNIQUE INDEX idx_post_likes_user_unique ON post_likes(post_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_post_likes_ip_unique ON post_likes(post_id, guest_ip) WHERE guest_ip IS NOT NULL;

-- 全文搜索索引（支持多语言）
CREATE INDEX idx_posts_title_content ON posts USING gin(to_tsvector('simple', title || ' ' || content));

-- ======================================
-- Example Data
-- ======================================

-- 示例用户
INSERT INTO users (name, email, password, role)
VALUES
('Jack', 'jack@example.com', 'temp_password_123', 'admin');

-- 示例分类
INSERT INTO categories (name, slug, description)
VALUES
('Frontend', 'frontend', 'Frontend development'),
('Backend', 'backend', 'Backend development'),
('Database', 'database', 'Database related topics'),
('DevOps', 'devops', 'DevOps and deployment');

-- 示例标签
INSERT INTO tags (name, slug)
VALUES
('React', 'react'),
('JavaScript', 'javascript'),
('Web Development', 'web-development');

-- ======================================
-- 数据库触发器（自动化业务逻辑）
-- ======================================
-- 触发器作用：在数据修改时自动执行相关业务逻辑，保持数据一致性

-- 通用函数：自动更新所有表的 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 专用函数：自动管理文章的发布时间戳
-- 逻辑：published 为 true 时自动设置 published_at；改回 false 时清除发布时间
CREATE OR REPLACE FUNCTION set_post_published_at()
RETURNS TRIGGER AS $$
BEGIN
    -- 文章从草稿状态改为已发布：设置发布时间
    IF NEW.published = TRUE AND OLD.published = FALSE THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    -- 文章从已发布改为草稿：清除发布时间
    IF NEW.published = FALSE AND OLD.published = TRUE THEN
        NEW.published_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 绑定触发器：posts 表发布状态变化时自动更新 published_at
CREATE TRIGGER posts_publish_timestamp BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION set_post_published_at();

-- 绑定触发器：comments 表更新时自动更新 updated_at
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 绑定触发器：tags 表更新时自动更新 updated_at
CREATE TRIGGER tags_updated_at BEFORE UPDATE ON tags
FOR EACH ROW EXECUTE FUNCTION update_updated_at();