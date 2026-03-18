-- ─────────────────────────────────────────────────────
--  Migration: Separate Instructors and Participants
-- ─────────────────────────────────────────────────────

USE certificate_db;

-- 1. Create table for Instructors
CREATE TABLE IF NOT EXISTS training_instructors (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    tracker_id  INT NOT NULL,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tracker_id) REFERENCES training_tracker(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create table for Participants
CREATE TABLE IF NOT EXISTS training_participants (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    tracker_id  INT NOT NULL,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tracker_id) REFERENCES training_tracker(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. (Optional) Run a basic data migration from existing text field
-- Note: This is a complex step in SQL, so we'll handle the data "as we go" or 
-- just start fresh with the new tables if the existing data is not critical.
-- For this setup, we just ensure the tables exist.
