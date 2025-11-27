# Shop ERP System

A comprehensive Enterprise Resource Planning (ERP) system for managing shop operations including products, customers, sales, inventory, and reporting.

## 🏗️ Project Structure

```
shop-erp-vue/
├── server/                    # Backend API Server (Node.js/Express)
│   ├── server.js             # Main Express application
│   ├── package.json          # Backend dependencies
│   ├── .env.example          # Environment variables template
│   └── README.md             # Backend setup instructions
├── client/                    # Frontend Application (Vue 3)
│   ├── src/                  # Source code
│   │   ├── components/       # Vue components
│   │   ├── pages/            # Page components
│   │   ├── stores/           # Pinia state management
│   │   ├── services/         # API services
│   │   └── router/           # Vue Router configuration
│   ├── index.html            # HTML entry point
│   ├── vite.config.js        # Vite build configuration
│   ├── package.json          # Frontend dependencies
│   ├── .env.example          # Environment variables template
│   └── README.md             # Frontend setup instructions
├── README.md                 # This file
└── .gitignore               # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v20.x LTS, v22.x LTS, or v24.x recommended)
  - ⚠️ **Do NOT use Node.js v25+** - has compatibility issues with Vite/Rollup
- **npm** (v10 or higher)

> **Important:** If you're using Node.js v25.2.1 or newer, you'll encounter build errors. Please downgrade to an LTS version (v20, v22, or v24).

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
copy .env.example .env
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

**Mock Credentials for Testing:**
- Email: `admin@example.com` | Password: `password123`
- Email: `staff@example.com` | Password: `password123`

### Frontend Setup

1. In a new terminal, navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
copy .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📋 Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Admin, Staff)
- Protected routes and API endpoints

### Dashboard
- Real-time analytics
- Sales summary
- Inventory status
- Quick action widgets
- Recent activity tracking

### Product Management
- Add, edit, and delete products
- Product categories
- Stock level tracking
- Product details and pricing

### Customer Management
- Customer profile management
- Contact information
- Purchase history
- Customer segmentation

### Point of Sale (POS)
- Fast product selection
- Shopping cart functionality
- Quick checkout
- Receipt generation
- Transaction recording

### Sales Management
- Sales order creation and tracking
- Order history
- Sales analytics
- Order status management

### Inventory Management
- Stock level tracking
- Stock adjustments
- Stock movement history
- Low stock alerts
- Inventory valuation

### Reports
- Sales reports by period
- Inventory valuation reports
- Stock movement reports
- Exportable reports (Excel)

### Settings
- Application preferences
- Theme switching
- User profile management

## 🔧 Configuration

### Backend Configuration

See `server/README.md` for detailed backend setup instructions.

**Key Environment Variables:**
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Frontend Configuration

See `client/README.md` for detailed frontend setup instructions.

**Key Environment Variables:**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

## 🔌 API Documentation

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Register
```
POST /api/auth/register
Body: { name, email, password }
Response: { user }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

#### Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { success: true }
```

#### Test API
```
GET /api/test
Response: { success: true, message: "Backend API is reachable!" }
```

## 📦 Technology Stack

### Backend
- **Express.js** - Web framework
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-Origin Resource Sharing

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Chart.js** - Data visualization
- **XLSX** - Excel export functionality
- **Axios** - HTTP client (configured in apiService)

## 📚 Running Both Client and Server

### Option 1: Two Terminals

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

### Option 2: PowerShell Commands

Run both simultaneously:
```powershell
# Navigate to server and start
cd server; npm install; npm run dev &
# In a new terminal
cd client; npm install; npm run dev
```

## 🔐 Security Notes

### Development
- Default JWT secret is provided for development only
- Mock users are included for testing

### Production
- **NEVER** use the default JWT secret in production
- Generate a strong secret: `openssl rand -base64 32`
- Use HTTPS for all communications
- Implement CSRF protection
- Use secure cookie settings
- Validate all user inputs
- Implement rate limiting
- Use environment variables for sensitive data

## ✨ Recent Improvements (2025-11-27)

### Code Quality ✅
- **ESLint Status**: 0 errors, 0 warnings (all 20+ errors resolved)
- **12 Vue components** cleaned and optimized
- **Removed**:
  - 20+ unused variables and parameters
  - 8 empty CSS rulesets  
  - Unused imports (`onUnmounted`, `computed`, `watch`, `ref`)
- **Fixed**: Corrupted `ProductDetailModal.vue` file

### Node.js Compatibility ✅
- **Resolved**: Node.js v25.2.1 breaking Vite/Rollup
- **Current Version**: Node.js v24.11.1 LTS
- **Dependencies**: 310 packages installed, 0 vulnerabilities
- **Dev Server**: Running successfully on http://localhost:5174/

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check if port 3001 is available
- Verify Node.js is installed: `node --version`
```bash
cd server
npm install --production
node server.js
```

### Frontend Production Build
```bash
cd client
npm run build
npm run preview  # Test production build locally
```

Deploy the `dist` folder to your hosting platform.

## 📝 Development Workflow

1. Create feature branches
2. Make changes in respective folders (client or server)
3. Test thoroughly
4. Run linting: `npm run lint`
5. Format code: `npm run format`
6. Commit and push changes

## 📖 Detailed Documentation

- **Backend Setup**: See `server/README.md`
- **Frontend Setup**: See `client/README.md`
- **API Reference**: See backend README for detailed endpoints

## 🤝 Contributing

1. Create a new branch for your feature
2. Follow the existing code structure
3. Add comments for complex logic
4. Test your changes
5. Ensure linting passes

## 📄 License

ISC

## 📞 Support

For issues or questions:
1. Check the relevant README (server or client)
2. Review the troubleshooting section
3. Check console logs and error messages

## 🎯 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app version
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Advanced permission system
- [ ] Audit logging
- [ ] API documentation (Swagger)

---

**Happy Coding!** 🎉

For more information about the project structure and setup, please refer to the individual README files in the `server` and `client` directories.
