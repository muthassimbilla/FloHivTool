-- Create first admin user setup script
-- This script helps create the first admin user for the system

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('auto_approve_first_user', 'true', 'Automatically approve the first registered user as admin'),
('require_email_verification', 'true', 'Require email verification for new users'),
('default_user_limit', '100', 'Default user agent generation limit'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to make first user admin
CREATE OR REPLACE FUNCTION make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the first user
    IF (SELECT COUNT(*) FROM users) = 1 THEN
        -- Make the first user an admin and approve them
        UPDATE users 
        SET 
            role = 'admin',
            is_approved = true,
            email_verified = true,
            user_agent_limit = 999999,
            custom_limit = true,
            subscription_type = 'unlimited'
        WHERE id = NEW.id;
        
        -- Create welcome notification for admin
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            NEW.id,
            'Welcome Admin!',
            'You have been automatically set as the first admin user. You can now manage users and system settings.',
            'success'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically make first user admin
DROP TRIGGER IF EXISTS auto_admin_first_user ON users;
CREATE TRIGGER auto_admin_first_user
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION make_first_user_admin();

-- Create function to manually promote user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO user_id FROM users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    -- Update user to admin
    UPDATE users 
    SET 
        role = 'admin',
        is_approved = true,
        email_verified = true,
        user_agent_limit = 999999,
        custom_limit = true,
        subscription_type = 'unlimited'
    WHERE id = user_id;
    
    -- Create notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        user_id,
        'Admin Access Granted',
        'You have been promoted to admin. You can now access the admin dashboard.',
        'success'
    );
    
    RAISE NOTICE 'User % promoted to admin successfully', user_email;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
