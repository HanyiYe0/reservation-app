-- Function to clean up past time slots from barbers' availability
CREATE OR REPLACE FUNCTION cleanup_barber_slots()
RETURNS void AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Log the start of cleanup
    RAISE NOTICE 'Starting barber slots cleanup at %', NOW();
    RAISE NOTICE 'Current date is: %', CURRENT_DATE;

    WITH updated_barbers AS (
        UPDATE barbers
        SET availability = (
            SELECT jsonb_object_agg(k, v)
            FROM jsonb_each(availability) AS t(k,v)
            WHERE k::date >= CURRENT_DATE
        ),
        updated_at = NOW()
        WHERE EXISTS (
            SELECT 1
            FROM jsonb_each(availability) AS t(k,v)
            WHERE k::date < CURRENT_DATE
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO updated_count
    FROM updated_barbers;

    -- Log the cleanup results
    RAISE NOTICE 'Cleanup completed: Updated % barbers availability', updated_count;

    -- Verify the cleanup
    SELECT COUNT(DISTINCT b.id) INTO updated_count
    FROM barbers b,
    jsonb_each(b.availability) AS t(k,v)
    WHERE k::date < CURRENT_DATE;

    IF updated_count > 0 THEN
        RAISE EXCEPTION 'Cleanup verification failed: % barbers still have past dates', updated_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing scheduled job if it exists
SELECT cron.unschedule('cleanup-barber-slots');

-- Create a scheduled job to run daily at midnight
SELECT cron.schedule(
    'cleanup-barber-slots',      -- Job name
    '0 0 * * *',                 -- Cron schedule (daily at midnight)
    'SELECT cleanup_barber_slots();'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_barber_slots() TO service_role; 