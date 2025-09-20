-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Using auth.uid() instead of auth.jwt() for Supabase compatibility

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- User sessions policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- User generations policies
CREATE POLICY "Users can view their own generations" ON user_generations
    FOR SELECT USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can insert their own generations" ON user_generations
    FOR INSERT WITH CHECK (firebase_uid = auth.uid()::text);

CREATE POLICY "Admins can view all generations" ON user_generations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Admin actions policies (admin only)
CREATE POLICY "Admins can view admin actions" ON admin_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert admin actions" ON admin_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE firebase_uid = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE firebase_uid = auth.uid()::text
        )
    );

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- System settings policies (admin only)
CREATE POLICY "Admins can manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE firebase_uid = auth.uid()::text 
            AND role = 'admin'
        )
    );
