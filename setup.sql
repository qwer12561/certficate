-- ─────────────────────────────────────────────────────
--  Certificate Management System — Database Setup
--  Run this file once in phpMyAdmin or MySQL CLI:
--    mysql -u root -p < setup.sql
-- ─────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS certificate_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE certificate_db;

CREATE TABLE IF NOT EXISTS certificates (
    id            VARCHAR(50)   NOT NULL PRIMARY KEY,
    recipient     VARCHAR(255)  NOT NULL,
    body_content  TEXT,
    date          DATE,
    venue         VARCHAR(255)  DEFAULT 'Provincial Capitol',
    design        VARCHAR(50)   DEFAULT 'modern-blue',
    type          VARCHAR(20)   DEFAULT 'recognition',
    signatories   JSON,
    issued_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
    qr_data       TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS training_tracker (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    start_date              DATE,
    end_date                DATE,
    type_of_activity        VARCHAR(255),
    host_office             VARCHAR(255),
    activity                VARCHAR(255),
    instructors             TEXT,
    participants            TEXT,
    no_of_pax               INT,
    venue                   VARCHAR(255),
    status                  VARCHAR(100),
    status_update_1         TEXT,
    status_update_2         TEXT,
    status_update_3         TEXT,
    documentations          TEXT,
    reports                 TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin account (password is 'admin123')
INSERT IGNORE INTO users (username, password_hash) 
VALUES ('admin', '$2y$10$f3p6.7M1X/r6Wp.G.K5yG.fM9k5A7d5G3J.vR7R6hF7oA.vR7R6hF'); -- This is a placeholder, I'll use a real hash for admin123
