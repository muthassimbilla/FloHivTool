# Admin Setup Guide

## 🚀 Complete Admin Setup Process

### Step 1: Database Setup
1. Run the database scripts in order:
   \`\`\`
   01-create-enhanced-auth-tables.sql
   02-create-rls-policies-fixed.sql  
   03-create-first-admin.sql
   \`\`\`

### Step 2: First Admin User (Automatic)
1. Go to `/register` on your website
2. Register with your admin email
3. **The first user is automatically made admin!**
4. Check your email for verification (if required)
5. Login at `/login`
6. You'll be redirected to `/admin` dashboard

### Step 3: Manual Admin Promotion (If Needed)
If you need to promote an existing user to admin:

1. Go to your database (Supabase SQL Editor)
2. Run this command:
   \`\`\`sql
   SELECT promote_user_to_admin('user@example.com');
   \`\`\`
3. Replace `user@example.com` with the actual email

### Step 4: Admin Features Access

**Admin Dashboard:** `/admin`
- User statistics
- System overview
- Recent activities

**User Management:** `/admin/users`
- View all users
- Approve/reject users
- Change user roles
- Set custom limits
- Delete users

**Admin Analytics:** `/admin/analytics`
- Usage statistics
- User activity tracking

### Step 5: System Configuration

**Default Settings:**
- New users need approval: `true`
- Email verification required: `true`
- Default user limit: `100 generations`
- Admin limit: `Unlimited`

**To Change Settings:**
Access admin dashboard and modify system settings as needed.

### 🔐 Admin Login Process:
1. Go to `/login`
2. Enter admin email/password
3. After login, you'll see admin navigation
4. Access admin features from the menu

### 🛠️ Troubleshooting:
- If admin access not working, check database `users` table
- Verify `role` column shows `'admin'`
- Check `is_approved` is `true`
- Ensure Firebase authentication is working

### 📧 Admin Notifications:
- Welcome message after first admin setup
- Notifications for user registrations
- System alerts and updates
