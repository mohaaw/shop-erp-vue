# Shop ERP - Quick Reference

## 🚀 Quick Start (Copy & Paste)

### First Time Setup

```powershell
# Setup Backend
cd server
npm install
Copy-Item .env.example .env
npm run dev

# In new terminal - Setup Frontend
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

Then visit: `http://localhost:5173`

### Login with:
- Email: `admin@example.com` 
- Password: `password123`

---

## 📂 Project Structure

```
shop-erp-vue/
├── server/              ← Backend (Express, Port 3001)
│   ├── server.js
│   ├── package.json
│   └── README.md
├── client/              ← Frontend (Vue 3, Port 5173)
│   ├── src/
│   ├── package.json
│   └── README.md
├── README.md            ← Project Overview
└── SETUP_INSTRUCTIONS.md ← Detailed Setup
```

---

## 🔧 Common Commands

| Command | Location | Purpose |
|---------|----------|---------|
| `npm install` | server/ or client/ | Install dependencies |
| `npm run dev` | server/ | Start backend on :3001 |
| `npm run dev` | client/ | Start frontend on :5173 |
| `npm run build` | client/ | Build for production |
| `npm run lint` | client/ | Check code style |
| `npm run format` | client/ | Format code |

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| API Test | http://localhost:3001/api/test |

---

## 📝 Environment Files

### Create `.env` from `.env.example`:

**Server** (`server/.env`):
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-very-secret-key-for-shop-erp-project-secure
CORS_ORIGIN=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Staff | staff@example.com | password123 |

---

## 📚 Documentation Files

1. **README.md** - Project overview and features
2. **SETUP_INSTRUCTIONS.md** - Complete setup guide
3. **PROJECT_RESTRUCTURING_COMPLETE.md** - What was done
4. **server/README.md** - Backend API docs
5. **client/README.md** - Frontend docs
6. **This file** - Quick reference

---

## 🐛 Quick Troubleshooting

### Port Conflict
```powershell
# Kill node processes
Get-Process node | Stop-Process -Force

# Or use different port
npm run dev -- --port 5174
```

### Clear Cache
```powershell
npm cache clean --force
Remove-Item node_modules -Recurse -Force
npm install
```

### API Not Responding
- Check backend is running: `http://localhost:3001/api/test`
- Check VITE_API_BASE_URL in client/.env
- Restart both services

---

## ✅ Verification

After setup, verify everything works:

1. Backend: Visit `http://localhost:3001/api/test`
2. Frontend: Visit `http://localhost:5173`
3. Login: Use admin@example.com / password123
4. Dashboard: Should load without errors

---

## 🚀 Development Workflow

```
1. Make changes in src/ (client)
2. Hot reload happens automatically
3. Changes sync immediately in browser
4. For backend changes, restart npm run dev
```

---

## 📦 Key Dependencies

**Backend:**
- express (web framework)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- cors (cross-origin)

**Frontend:**
- vue (framework)
- vite (build tool)
- pinia (state management)
- vue-router (routing)
- axios (HTTP client)
- chart.js (charts)

---

## 🎯 Next Steps

1. ✅ Run both server and client
2. ✅ Login with test account
3. 📖 Read SETUP_INSTRUCTIONS.md
4. 🔧 Explore the codebase
5. ✨ Start customizing!

---

## 📞 Need Help?

1. Check SETUP_INSTRUCTIONS.md (Troubleshooting section)
2. Review server/README.md or client/README.md
3. Check browser console for errors
4. Check terminal output for API errors

---

**Happy Coding!** 🎉
