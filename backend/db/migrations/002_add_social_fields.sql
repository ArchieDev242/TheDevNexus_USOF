-- Add social media and bio fields to users table
USE USOF;

ALTER TABLE users
ADD COLUMN bio TEXT DEFAULT NULL AFTER profile_picture,
ADD COLUMN website VARCHAR(255) DEFAULT NULL AFTER bio,
ADD COLUMN twitter VARCHAR(100) DEFAULT NULL AFTER website,
ADD COLUMN github VARCHAR(100) DEFAULT NULL AFTER twitter,
ADD COLUMN linkedin VARCHAR(100) DEFAULT NULL AFTER github;

SELECT 'Migration completed: Added bio, website, twitter, github, linkedin fields to users table' as status;
