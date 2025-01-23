-- Check all appointments and their dates
SELECT id, date, time_slot, status, created_at
FROM appointments
ORDER BY date;

-- Check specifically past appointments
SELECT COUNT(*) as past_appointments
FROM appointments
WHERE date < CURRENT_DATE; 