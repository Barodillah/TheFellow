-- 1. Membuat tabel users
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NULL,
    role ENUM('admin', 'fellow', 'member') DEFAULT 'member',
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NULL,
    csm_title VARCHAR(100) NULL,
    join_year INT NULL,
    avatar VARCHAR(255) NULL,
    bio TEXT NULL,
    quote TEXT NULL,
    specializations JSON NULL,
    badges JSON NULL,
    stats_articles INT DEFAULT 0,
    stats_threads INT DEFAULT 0,
    stats_pdca_cases INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Membuat tabel user_achievements
CREATE TABLE user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    year VARCHAR(20) NULL,
    title VARCHAR(255) NOT NULL,
    competition VARCHAR(255) NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Membuat tabel otps
CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Membuat tabel publikasi
CREATE TABLE publikasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    cover_name VARCHAR(255) NOT NULL,
    visibility ENUM('public', 'private') DEFAULT 'public',
    status ENUM('draft', 'request', 'publish', 'archive') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE publikasi_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publikasi_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (publikasi_id) REFERENCES publikasi(id) ON DELETE CASCADE
);

-- 6. Membuat tabel forum_threads
CREATE TABLE forum_threads (
    id CHAR(36) PRIMARY KEY,
    author_id CHAR(36) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link_metadata JSON NULL,
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Membuat tabel forum_thread_tags
CREATE TABLE forum_thread_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id CHAR(36) NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE
);

-- 8. Membuat tabel forum_replies (Dengan Self-Referencing parent_id)
CREATE TABLE forum_replies (
    id CHAR(36) PRIMARY KEY,
    thread_id CHAR(36) NOT NULL,
    author_id CHAR(36) NOT NULL,
    parent_id CHAR(36) NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES forum_replies(id) ON DELETE CASCADE
);

-- 9. Membuat tabel forum_likes
CREATE TABLE forum_likes (
    user_id CHAR(36) NOT NULL,
    entity_id CHAR(36) NOT NULL,
    entity_type ENUM('thread', 'reply') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, entity_id, entity_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Membuat tabel quizzes
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    deadline DATETIME NOT NULL,
    status ENUM('active', 'expired', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Membuat tabel quiz_questions
CREATE TABLE quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 12. Membuat tabel quiz_submissions
CREATE TABLE quiz_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    user_id CHAR(36) NOT NULL,
    score INT NOT NULL,
    answers JSON NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. Membuat tabel events
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);