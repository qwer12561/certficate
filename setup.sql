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
