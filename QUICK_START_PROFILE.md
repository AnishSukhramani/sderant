# Quick Start - Profile Feature

## 🚀 Get Started in 3 Steps

### Step 1: Set Up Database (2 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file: `users-schema.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run**
7. ✅ Verify "Success. No rows returned" message

**Quick Verify**: Go to **Table Editor** and confirm you see the `users` table.

---

### Step 2: Restart Dev Server (30 seconds)

```bash
# Stop your current dev server (Ctrl+C)
npm run dev
# or
yarn dev
```

✅ Server should start without errors

---

### Step 3: Test It Out! (2 minutes)

#### Test Registration:
1. Navigate to `http://localhost:3000/app`
2. Click the **round profile icon** (top right)
3. Click **REGISTER_HERE**
4. Watch the cool animations! 🎬
5. Fill out the form:
   - Name: `Test User`
   - Username: `testuser`
   - Password: `password123`
   - Confirm: `password123`
6. Click **REGISTER_USER**
7. ✅ You should see success animation and redirect to `/app`

#### Test Profile Button:
1. You should now see your name in the profile dropdown
2. Click the profile button again
3. ✅ Verify dropdown shows:
   - "LOGGED_IN_AS: Test User"
   - User ID
   - LOGOUT button

#### Test Username Posting:
1. Click **OPEN_TERMINAL** (bottom of page)
2. When prompted for name, type: `uname`
3. ✅ Verify it says: "Name set to username: Test User"
4. Continue with post creation

#### Test Logout:
1. Click profile button
2. Click **LOGOUT**
3. ✅ Profile button should now show default user icon
4. Click it → should redirect to login page

#### Test Login:
1. Go to `/auth/login`
2. Enter:
   - Username: `testuser`
   - Password: `password123`
3. Click **ACCESS_SYSTEM**
4. ✅ Should see success animation and redirect

---

## ✅ Success Checklist

- [ ] SQL schema ran successfully
- [ ] `users` table exists in Supabase
- [ ] Dev server running without errors
- [ ] Profile button visible (top right of navbar)
- [ ] Can register new user
- [ ] Registration animations play correctly
- [ ] Can login with created account
- [ ] Login animations play correctly
- [ ] Profile dropdown shows user name
- [ ] Can logout successfully
- [ ] Can use `uname` command in terminal
- [ ] Session persists on page reload

---

## 🎯 What You Should See

### Profile Button States:

**Not Logged In:**
```
┌───┐
│ 👤│  ← Click this to go to login
└───┘
```

**Logged In:**
```
┌───┐
│ 👤│  ← Click this to open dropdown
└───┘
  ↓
┌─────────────────┐
│ LOGGED_IN_AS:   │
│ Your Name       │
│ User ID: xxx... │
├─────────────────┤
│ [icon] LOGOUT   │
└─────────────────┘
```

### Terminal Commands:

```bash
$ uname
Name set to username: Your Name

# OR

$ skip
Name skipped (will be anonymous)

# OR

$ John Doe
Name set: John Doe
```

---

## 🔥 Pro Tips

1. **Keyboard Shortcut**: Press `Ctrl + `` to open terminal quickly
2. **Username Posting**: Type `uname` or `username` (both work)
3. **Help Command**: Type `help` in terminal to see all commands
4. **Anonymous Posting**: Still works! Just type `skip` or don't login
5. **Session Persistence**: Your login persists across page reloads

---

## 🐛 Troubleshooting

### "Cannot read property 'from' of undefined"
→ Supabase env variables not set. Check `.env.local`

### "relation 'users' does not exist"
→ Run the SQL schema in Supabase

### Profile button not showing
→ Check browser console for errors
→ Verify AuthProvider is in layout.tsx

### Can't use `uname` command
→ Make sure you're logged in first
→ Check terminal shows "Logged in as: Your Name"

### Animations not playing
→ Clear browser cache
→ Check if framer-motion is installed

---

## 📞 Quick Reference

### Routes:
- `/` - Landing page
- `/app` - Main app
- `/auth/signup` - Registration
- `/auth/login` - Login

### Commands (in terminal):
- `help` - Show all commands
- `uname` - Use your username (requires login)
- `skip` - Post anonymously
- `clear` - Clear terminal
- `exit` - Close terminal
- `back` - Go to previous step

### Files to Check:
- `users-schema.sql` - Database schema
- `PROFILE_FEATURE_GUIDE.md` - Full documentation
- `PROFILE_FEATURE_SUMMARY.md` - Implementation details
- `ANIMATIONS_GUIDE.md` - Animation details

---

## 🎉 You're All Set!

Your profile system is now live with:
- ✅ Terminator-style animations
- ✅ Secure SHA-256 encryption
- ✅ Username posting support
- ✅ Beautiful UI matching your theme
- ✅ Mobile responsive design

**Enjoy your new profile feature!** 🚀

---

## 📚 Next Steps

Want to extend the feature? Consider adding:
- User profile page
- Edit profile
- Password reset
- User avatars
- Post history
- User badges
- Follow system

Check `PROFILE_FEATURE_GUIDE.md` for more ideas!

