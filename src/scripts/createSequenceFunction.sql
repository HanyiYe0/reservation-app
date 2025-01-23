-- Create a function to get the next value from a sequence
CREATE OR REPLACE FUNCTION get_next_id(seq_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_val integer;
BEGIN
    EXECUTE 'SELECT nextval($1::regclass)' INTO next_val USING seq_name;
    RETURN next_val;
END;
$$; 