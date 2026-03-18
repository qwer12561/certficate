-- ─────────────────────────────────────────────────────
--  Migration: Shift to Flat Columns for Instructors & Participants
-- ─────────────────────────────────────────────────────

USE certificate_db;

-- 1. Add new columns to training_tracker
ALTER TABLE training_tracker 
ADD COLUMN instructors TEXT AFTER activity,
ADD COLUMN participants TEXT AFTER instructors;

-- 2. Drop the redundant tables
DROP TABLE IF EXISTS training_instructors;
DROP TABLE IF EXISTS training_participants;

-- 3. Remove the legacy column
ALTER TABLE training_tracker DROP COLUMN instructor_participants;
