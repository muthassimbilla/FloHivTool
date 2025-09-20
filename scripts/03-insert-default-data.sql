-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('default_user_agent_limit', '100', 'Default user agent generation limit for new users'),
('default_subscription_days', '7', 'Default subscription period in days'),
('require_email_verification', 'true', 'Whether email verification is required'),
('auto_approve_users', 'false', 'Whether to auto-approve new users'),
('max_sessions_per_user', '5', 'Maximum concurrent sessions per user'),
('rate_limit_per_minute', '60', 'Rate limit for API requests per minute'),
('maintenance_mode', 'false', 'Whether the app is in maintenance mode')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample admin user (this will be created via Firebase Auth)
-- The actual user creation will happen through the authentication flow
