I have created the backend tbales using supabase. The following is the schema:

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing unique ID for each user
    name VARCHAR(100) NOT NULL,           -- Full name of the user
    email VARCHAR(150) NOT NULL UNIQUE,   -- Email address (must be unique)
    password VARCHAR(255) NOT NULL,       -- Hashed password for security
    phone VARCHAR(15),                    -- Optional phone number
    created_at TIMESTAMP DEFAULT NOW(),   -- Timestamp for account creation
    updated_at TIMESTAMP DEFAULT NOW()    -- Timestamp for last update
);

-- Create Barbers Table
CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing unique ID for each barber
    name VARCHAR(100) NOT NULL,           -- Full name of the barber
    profile_picture TEXT,                 -- URL to the barber's profile picture
    availability JSONB NOT NULL,          -- JSON for storing available days and time slots
    created_at TIMESTAMP DEFAULT NOW(),   -- Timestamp for when the barber is added
    updated_at TIMESTAMP DEFAULT NOW()    -- Timestamp for last update
);
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,                  -- Unique ID for each appointment
    user_id INTEGER NOT NULL,               -- Foreign Key linking to Users table
    barber_id INTEGER NOT NULL,             -- Foreign Key linking to Barbers table
    date DATE NOT NULL,                     -- Appointment date
    time_slot TIME NOT NULL,                -- Appointment time
    status VARCHAR(50) DEFAULT 'booked',    -- Status: 'booked', 'canceled', etc.
    created_at TIMESTAMP DEFAULT NOW(),     -- Timestamp when the appointment was created
    updated_at TIMESTAMP DEFAULT NOW(),     -- Timestamp when the appointment was last updated

    -- Foreign Key Constraints
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_barber FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE
);

Features to implement:
#1 When the user signs up add it to the users table.
#2 Clear the current mock barbers data and import all the barbers from the barbers table. 
