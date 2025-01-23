-- Drop any existing foreign key constraints that might prevent column modification
DO $$ 
BEGIN
    -- Get all foreign key constraints referencing users table
    FOR r IN (SELECT constraint_name 
              FROM information_schema.table_constraints 
              WHERE table_name = 'users' 
              AND constraint_type = 'FOREIGN KEY') LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Make phone column nullable
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Recreate foreign key constraints for appointments table
ALTER TABLE appointments
    ADD CONSTRAINT fk_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE; 