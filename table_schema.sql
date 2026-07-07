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
