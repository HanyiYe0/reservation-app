-- Function to clean up past appointments
CREATE OR REPLACE FUNCTION cleanup_past_appointments()
RETURNS void AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Log the start of cleanup
    RAISE NOTICE 'Starting cleanup process at %', NOW();
    RAISE NOTICE 'Current date is: %', CURRENT_DATE;

    -- Count appointments before deletion
    SELECT COUNT(*) INTO deleted_count
    FROM appointments
    WHERE date < CURRENT_DATE;
    
    RAISE NOTICE 'Found % appointments before current date', deleted_count;

    -- Delete appointments from past dates and get count of deleted rows
    WITH deleted AS (
        DELETE FROM appointments 
        WHERE date < CURRENT_DATE
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count
    FROM deleted;

    -- Update barbers timestamp
    UPDATE barbers
    SET updated_at = NOW();

    -- Log the cleanup results
    RAISE NOTICE 'Cleanup completed: Deleted % appointments before %', deleted_count, CURRENT_DATE;

    -- Verify no past appointments remain
    SELECT COUNT(*) INTO deleted_count
    FROM appointments
    WHERE date < CURRENT_DATE;
    
    RAISE NOTICE 'Remaining past appointments: %', deleted_count;

    -- If any past appointments remain, raise an exception
    IF deleted_count > 0 THEN
        RAISE EXCEPTION 'Cleanup failed: % past appointments still remain', deleted_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing scheduled job if it exists
SELECT cron.unschedule('cleanup-past-appointments');

-- Create a scheduled job to run daily at midnight
SELECT cron.schedule(
    'cleanup-past-appointments',  -- Job name
    '0 0 * * *',                 -- Cron schedule (daily at midnight)
    'SELECT cleanup_past_appointments();'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_past_appointments() TO service_role; 