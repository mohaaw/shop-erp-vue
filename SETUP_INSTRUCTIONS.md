# Shop ERP System - Setup Instructions

Complete guide to set up and run the Shop ERP application locally.

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **npm** v6 or higher (comes with Node.js)
- A text editor or IDE (VS Code recommended)
- Git (for version control)

### Verify Installation

Run these commands in PowerShell to verify:
```powershell
node --version
npm --version
git --version
```

## 📂 Project Structure After Setup

```
shop-erp-vue/
├── server/                         # Backend API
│   ├── server.js
│   ├── package.json
│   ├── .env                        # Create from .env.example
│   └── README.md
├── client/                         # Frontend Vue App
│   ├── src/                        # Application source code
│   ├── package.json
│   ├── .env                        # Create from .env.example
│   └── README.md
├── README.md                       # Main project documentation
└── SETUP_INSTRUCTIONS.md          # This file
```

## 🚀 Step-by-Step Setup

### Step 1: Extract/Clone the Project

If you have the project as a ZIP file:
```powershell
# Extract to your desired location
```

If cloning from Git:
```powershell
git clone <repository-url>
cd shop-erp-vue
```

### Step 2: Setup Backend Server

1. **Navigate to server folder:**
```powershell
cd server
```

2. **Install dependencies:**
```powershell
npm install
```

This will install:
- express (web framework)
- cors (cross-origin support)
- jsonwebtoken (JWT auth)
- bcryptjs (password hashing)

3. **Create environment file:**
```powershell
# Copy the template
Copy-Item .env.example .env
```

The `.env` file should contain:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-very-secret-key-for-shop-erp-project-secure
CORS_ORIGIN=http://localhost:5173
```

4. **Verify backend setup:**
```powershell
npm run dev
```

You should see:
```
🚀 Mock API Server running on http://localhost:3001
```

5. **Test the API:**

Open your browser and visit:
```
http://localhost:3001/api/test
```

You should see:
```json
{
  "success": true,
  "message": "Backend API is reachable!"
}
```

6. **Keep the backend running** and open a new terminal for the frontend setup.

### Step 3: Setup Frontend Client

1. **Open a new PowerShell terminal** and navigate to the project root:
```powershell
cd shop-erp-vue/client
```

2. **Install dependencies:**
```powershell
npm install
```

This will install Vue 3, Vite, Pinia, and other frontend tools.

3. **Create environment file:**
```powershell
Copy-Item .env.example .env
```

The `.env` file should contain:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

4. **Start the development server:**
```powershell
npm run dev
```

You should see:
```
  VITE v6.2.4  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

5. **Open in browser:**

Visit `http://localhost:5173/` in your web browser.

### Step 4: Login to the Application

Once the frontend loads, use these test credentials:

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`

**Staff Account:**
- Email: `staff@example.com`
- Password: `password123`

## ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] Backend installed and running on port 3001
- [ ] Backend API test endpoint returns success
- [ ] Frontend installed and running on port 5173
- [ ] Can access frontend in browser
- [ ] Can login with test credentials
- [ ] Dashboard loads without errors

## 🔧 Running the Application

### Quick Start (Both Services)

**Option 1: Two Terminal Windows**

Terminal 1 - Backend:
```powershell
cd server
npm run dev
```

Terminal 2 - Frontend:
```powershell
cd client
npm run dev
```

**Option 2: Single Command (PowerShell)**

From root directory:
```powershell
cd server; npm run dev &
cd ../client; npm run dev
```

## 📖 Available Commands

### Backend Commands

```powershell
cd server

# Start development server
npm run dev
npm start

# Install packages
npm install
```

### Frontend Commands

```powershell
cd client

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Install packages
npm install
```

## 🐛 Troubleshooting

### Issue: "Port 3001 is already in use"

**Solution:**
```powershell
# Find process using port 3001
Get-Process | Where-Object {$_.Name -like "*node*"}

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force

# Or use a different port in server/.env
# Change PORT=3001 to PORT=3002
```

### Issue: "Port 5173 is already in use"

**Solution:**
```powershell
# Change port in vite dev command
npm run dev -- --port 5174
```

### Issue: "CORS error in console"

**Solution:**
- Verify backend is running
- Check VITE_API_BASE_URL in client/.env
- Ensure it matches backend address

### Issue: "npm install fails"

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
Remove-Item node_modules -Recurse -Force

# Reinstall
npm install
```

### Issue: "Cannot find module errors"

**Solution:**
```powershell
# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### Issue: "Token expired / Login fails"

**Solution:**
- Default token expiration is 1 hour
- Clear browser localStorage: F12 → Application → Local Storage → Clear
- Login again

### Issue: "Build fails"

**Solution:**
```powershell
# Clear dist folder
Remove-Item dist -Recurse -Force

# Rebuild
npm run build
```

## 🌐 Accessing the Application

Once running:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001/api`
- **API Test**: `http://localhost:3001/api/test`

## 📱 Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/login` | User authentication |
| Dashboard | `/dashboard` | Home & analytics |
| Products | `/products` | Product management |
| Customers | `/customers` | Customer management |
| Sales | `/sales` | Sales tracking |
| POS | `/pos` | Point of Sale |
| Reports | `/reports` | Analytics reports |
| Settings | `/settings` | Application settings |

## 💾 Environment Variable Reference

### Server (.env)
```env
PORT=3001                    # Server port
NODE_ENV=development         # Environment
JWT_SECRET=<strong-secret>  # JWT signing key
CORS_ORIGIN=http://localhost:5173  # Allowed frontend URL
```

### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api  # Backend API URL
VITE_APP_ENV=development    # Environment
```

## 📚 Documentation

- **Main README**: `README.md` - Project overview
- **Backend README**: `server/README.md` - Backend documentation
- **Frontend README**: `client/README.md` - Frontend documentation

## 🔐 Security Notes

### For Development
- Provided mock credentials are for testing only
- JWT secret is provided for development
- No real database is configured

### For Production
- Change JWT_SECRET to a strong random value
- Use HTTPS instead of HTTP
- Implement a real database
- Add input validation
- Enable rate limiting
- Keep dependencies updated
- Use environment-specific configurations

## 🚀 Next Steps

1. **Explore the codebase:**
   - Check `server/server.js` for API implementation
   - Check `client/src/` for Vue components

2. **Customize the application:**
   - Update product categories
   - Customize dashboard widgets
   - Modify styling and themes

3. **Add functionality:**
   - Implement database integration
   - Add more API endpoints
   - Create additional components

4. **Deploy:**
   - Backend: Deploy to Heroku, AWS, or similar
   - Frontend: Deploy to Vercel, Netlify, or similar

## 📞 Getting Help

If you encounter issues:

1. Check the relevant README file
2. Review error messages in the console
3. Check the Troubleshooting section above
4. Verify all prerequisites are installed
5. Ensure ports 3001 and 5173 are available

## ✨ Features Overview

- ✅ User authentication with JWT
- ✅ Role-based access control
- ✅ Product management
- ✅ Customer tracking
- ✅ Point of Sale system
- ✅ Sales management
- ✅ Inventory tracking
- ✅ Reports and analytics
- ✅ Dashboard with widgets
- ✅ Theme switching

---

**You're all set!** Start with Step 2 to set up the backend, then Step 3 for the frontend.

For detailed information, refer to the README files in the `server` and `client` directories.
