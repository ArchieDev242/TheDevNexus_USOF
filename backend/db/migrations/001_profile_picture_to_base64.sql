-- Migration: Change profile_picture from VARCHAR to LONGTEXT for Base64 storage
-- Run this if you already have the database created

USE USOF;

-- Modify column type to LONGTEXT to store Base64 strings
ALTER TABLE users MODIFY COLUMN profile_picture LONGTEXT DEFAULT NULL;

-- Optional: Clear existing file paths (if you want to start fresh)
-- UPDATE users SET profile_picture = NULL WHERE profile_picture != 'default_avatar.png';

SELECT 'Migration completed: profile_picture is now LONGTEXT' as status;
