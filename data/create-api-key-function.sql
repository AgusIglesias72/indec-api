-- Function to generate API keys
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    api_key TEXT;
    key_exists BOOLEAN;
BEGIN
    -- Generate API key with format: ask_[32 random characters]
    LOOP
        api_key := 'ask_' || encode(gen_random_bytes(24), 'base64');
        -- Remove non-alphanumeric characters and limit to 32 chars after prefix
        api_key := 'ask_' || regexp_replace(substring(api_key from 5), '[^a-zA-Z0-9]', '', 'g');
        api_key := substring(api_key from 1 for 35); -- ask_ (4) + 31 chars
        
        -- Check if key already exists
        SELECT EXISTS (
            SELECT 1 FROM users WHERE api_key = api_key
        ) INTO key_exists;
        
        -- Exit loop if key is unique
        IF NOT key_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN api_key;
END;
$$;

-- Grant execute permission to authenticated and service roles
GRANT EXECUTE ON FUNCTION generate_api_key() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_api_key() TO service_role;