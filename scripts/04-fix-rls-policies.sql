-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can view all generations" ON user_generations;
DROP POLICY IF EXISTS "Admins can view admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE firebase_uid = auth.uid()::text 
    AND role = 'admin'
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate admin policies using the function
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all generations" ON user_generations
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view admin actions" ON admin_actions
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert admin actions" ON admin_actions
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage system settings" ON system_settings
    FOR ALL USING (is_admin());
