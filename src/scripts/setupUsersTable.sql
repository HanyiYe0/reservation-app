-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing unique ID for each user
    clerk_id VARCHAR(255) NOT NULL UNIQUE, -- Clerk user ID for authentication
    name VARCHAR(100) NOT NULL,           -- Full name of the user
    email VARCHAR(150) NOT NULL UNIQUE,   -- Email address (must be unique)
    password VARCHAR(255),                -- Optional password field since we're using Clerk
    phone VARCHAR(15),                    -- Optional phone number
    created_at TIMESTAMP DEFAULT NOW(),   -- Timestamp for account creation
    updated_at TIMESTAMP DEFAULT NOW()    -- Timestamp for last update
); 