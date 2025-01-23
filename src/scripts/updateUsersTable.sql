-- Drop and recreate the sequence
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
CREATE SEQUENCE users_id_seq START 1;

DO $$ 
BEGIN
    -- Drop the id column if it exists (to recreate it properly)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'id') THEN
        -- First drop any existing primary key constraint
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
        ALTER TABLE users DROP COLUMN id;
    END IF;

    -- Add id column with proper sequence
    ALTER TABLE users ADD COLUMN id INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq');
    ALTER SEQUENCE users_id_seq OWNED BY users.id;

    -- Add clerk_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'clerk_id') THEN
        ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255);
        ALTER TABLE users ADD CONSTRAINT users_clerk_id_unique UNIQUE (clerk_id);
    END IF;

    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(100);
    END IF;

    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(150);
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;

    -- Add phone column if it doesn't exist (as nullable)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(15) NULL;
    ELSE
        -- If phone column exists, make it nullable
        ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;

    -- Make required columns NOT NULL if they aren't already
    ALTER TABLE users ALTER COLUMN clerk_id SET NOT NULL;
    ALTER TABLE users ALTER COLUMN name SET NOT NULL;
    ALTER TABLE users ALTER COLUMN email SET NOT NULL;

    -- Drop password column if it exists (since we're using Clerk for auth)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'password') THEN
        ALTER TABLE users DROP COLUMN password;
    END IF;

EXCEPTION
    WHEN others THEN
        -- If there's an error, it will be raised
        RAISE NOTICE 'Error updating users table: %', SQLERRM;
END $$; 