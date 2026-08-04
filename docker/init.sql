-- ============================================
-- Todo List Application - Database Initialization
-- ============================================
-- This script runs automatically on first container startup
-- (mounted at /docker-entrypoint-initdb.d/init.sql)

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Todos table
CREATE TABLE IF NOT EXISTS Todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    due_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_todos_user
        FOREIGN KEY (user_id) REFERENCES Users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Seed Data
-- ============================================

-- Seed default demo user
-- Password: 'password123' (bcrypt hashed)
INSERT INTO Users (name, email, password) VALUES
('Demo User', 'demo@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON DUPLICATE KEY UPDATE email = email;

-- Seed sample todos for the demo user (user_id = 1)
INSERT INTO Todos (user_id, title, status, due_date) VALUES
(1, 'Complete Lab 5 Report', 'pending', '2026-08-10 23:59:59'),
(1, 'Review Lab 6 Requirements', 'pending', '2026-08-12 23:59:59'),
(1, 'Submit Lab 7 Deliverables', 'completed', '2026-08-01 23:59:59'),
(1, 'Set up Docker Compose', 'completed', '2026-08-02 23:59:59'),
(1, 'Write API documentation', 'pending', '2026-08-15 23:59:59');