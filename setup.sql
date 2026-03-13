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
    instructor_participants TEXT,
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
