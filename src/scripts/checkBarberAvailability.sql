-- Check the structure of a barber's availability
SELECT id, name, availability
FROM barbers
WHERE availability IS NOT NULL
LIMIT 1; 