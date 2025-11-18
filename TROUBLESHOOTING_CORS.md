# 🔧 Troubleshooting Guide - "Failed to Fetch" Error

## What Was Fixed

✅ **CORS Configuration Improved**
- Added specific allowed origins
- Enabled preflight request handling (OPTIONS)
- Set proper credentials and headers

✅ **Backend Server Restarted**
- Server now runs with updated CORS config
- Ready to handle requests from frontend

## 🔍 Quick Diagnostic

### Step 1: Verify Backend is Running
Open this URL in your browser:
```
http://localhost:3001/api/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Backend API is reachable!"
}
```

### Step 2: Check Frontend Configuration
The `.env` file in `client/` should have:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Step 3: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty cache and hard refresh"
4. Or use: Ctrl+Shift+R

### Step 4: Try Login Again
1. Visit http://localhost:5173
2. Try logging in with:
   - Email: admin@example.com
   - Password: password123

## 🛠️ If Still Having Issues

### Check Browser Console
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for error messages
4. Check "Network" tab to see if request reaches backend

### Check Backend Logs
Look for this message in the backend terminal:
```
Backend Request: POST /api/auth/login Body: {"email":"admin@example.com",...}
Backend: Login successful for: admin@example.com. Token generated.
```

### Common Issues & Solutions

#### Issue: CORS Error in Console
**Solution**: Backend was restarted with proper CORS config
- Refresh page: Ctrl+Shift+R
- Clear cache: DevTools > Network > Disable cache checkbox

#### Issue: 404 - API Not Found
**Solution**: Check VITE_API_BASE_URL in client/.env
- Should be: `http://localhost:3001/api`
- Not: `http://localhost:3001` (missing `/api`)

#### Issue: Connection Refused
**Solution**: Backend server not running
```powershell
cd server
npm start
```

#### Issue: Network Error
**Solution**: Ports might be blocked
- Frontend should be on port 5173
- Backend should be on port 3001
- Check Windows Firewall settings

## ✅ What You Should See

### Backend Terminal
```
🚀 Mock API Server running on http://localhost:3001
Backend Request: POST /api/auth/login Body: {...}
Backend: Login successful for: admin@example.com. Token generated.
```

### Browser Network Tab (DevTools)
```
POST http://localhost:3001/api/auth/login
Status: 200 OK
Response: {
  "success": true,
  "token": "eyJh...",
  "user": {...}
}
```

### Browser Console
No CORS errors, just normal logs

## 🚀 Next Steps

1. **Hard Refresh Browser**: Ctrl+Shift+R
2. **Try Login**: admin@example.com / password123
3. **Check Console**: F12 > Console tab
4. **Check Network**: F12 > Network tab
5. **Backend Logs**: Check terminal output

## 📞 Emergency Restart

If nothing works, restart everything:

```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force

# Restart backend
cd c:\Users\TheDevil\repo\shop-erp-vue\server
npm start

# In new terminal, restart frontend
cd c:\Users\TheDevil\repo\shop-erp-vue\client
npm run dev
```

## ✨ Verification Steps

After following above:

- [ ] Backend test endpoint works: http://localhost:3001/api/test
- [ ] Frontend loads: http://localhost:5173
- [ ] Login page visible
- [ ] Can enter email and password
- [ ] No CORS errors in console
- [ ] Login request reaches backend
- [ ] Get token in response
- [ ] Dashboard loads after login

---

**Status**: ✅ CORS Fixed & Backend Restarted
**Time**: 2025-11-18
