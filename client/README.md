# Shop ERP - Frontend Client

This is the Vue 3 frontend application for the Shop ERP System, built with Vite and Pinia for state management.

## Features

- **Modern Vue 3 Framework**: Built with Vue 3 Composition API
- **Fast Build Tool**: Vite for fast development and production builds
- **State Management**: Pinia for managing application state
- **Responsive UI**: Tailored for both desktop and mobile devices
- **Dashboard**: Analytics and quick actions
- **Product Management**: Add, edit, and manage products
- **Customer Management**: Manage customer information
- **POS System**: Point-of-Sale functionality
- **Sales Tracking**: Monitor and record sales
- **Inventory Management**: Stock tracking and adjustments
- **Reports**: Sales and inventory reports

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env
# Frontend API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Application Environment
VITE_APP_ENV=development
```

**Important**: Make sure the `VITE_API_BASE_URL` matches the backend server URL.

## Running the Application

### Development Mode (with Hot Reload)

```bash
npm run dev
```

The application will start on `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

This allows you to preview the production build locally before deployment.

### Linting

Check and fix code style issues:

```bash
npm run lint
```

This runs both ESLint and Oxlint with automatic fixes.

### Format Code

Format code with Prettier:

```bash
npm run format
```

## Project Structure

```
client/
├── src/
│   ├── assets/              # Images, CSS, and other static assets
│   ├── components/          # Vue components
│   │   ├── common/          # Shared components (Header, Sidebar, etc.)
│   │   ├── customers/       # Customer-related components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── inventory/       # Inventory components
│   │   ├── pos/             # Point-of-Sale components
│   │   ├── products/        # Product components
│   │   ├── reports/         # Report components
│   │   └── sales/           # Sales components
│   ├── layouts/             # Layout components
│   ├── pages/               # Page components (routed)
│   ├── router/              # Vue Router configuration
│   ├── services/            # API service layer
│   ├── stores/              # Pinia store modules
│   ├── App.vue              # Root component
│   └── main.js              # Application entry point
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
├── jsconfig.json            # JavaScript configuration
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Key Pages and Routes

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Home page with analytics and quick actions |
| Products | `/products` | List and manage products |
| Add Product | `/products/add` | Add new product |
| Customers | `/customers` | Manage customer information |
| Sales | `/sales` | View and manage sales |
| POS | `/pos` | Point-of-Sale system |
| Reports | `/reports` | View various reports |
| Settings | `/settings` | Application settings |
| Login | `/login` | User authentication |

## State Management (Pinia Stores)

The application uses Pinia stores for state management:

- **userStore**: Manages user authentication and profile
- **cartStore**: Shopping cart state for POS
- **productStore**: Products data and management
- **customerStore**: Customer data and management
- **salesStore**: Sales transactions
- **stockMovementStore**: Inventory movements
- **toastStore**: Toast notifications
- **settingsStore**: Application settings

## API Integration

The application communicates with the backend API through the `apiService` module located in `src/services/apiService.js`.

### Base URL

The API base URL is configured through the `VITE_API_BASE_URL` environment variable.

### Authentication

- Tokens are stored in localStorage
- All protected API calls include the JWT token in the Authorization header
- Tokens expire after 1 hour (configurable on the backend)

### Making API Calls

```javascript
import apiService from '@/services/apiService'

// Login
const response = await apiService.login(email, password)

// Protected route example
const userData = await apiService.get('/auth/me')
```

## Development Tips

### Hot Module Replacement (HMR)

Vite provides automatic hot module replacement during development. Changes to files will reflect instantly in the browser.

### Vue DevTools

Install the [Vue DevTools](https://devtools.vuejs.org/) extension for your browser to debug Vue components and inspect the store state.

### Debugging

Use your browser's DevTools to:
- Inspect components
- View network requests
- Check console logs
- Debug JavaScript

## Building and Deployment

### Production Build

```bash
npm run build
```

### Deployment Steps

1. Build the project: `npm run build`
2. The `dist` folder contains all production-ready files
3. Deploy the `dist` folder to your web server or hosting platform
4. Update `VITE_API_BASE_URL` in your deployment configuration to point to your production backend

### Deployment Platforms

The built `dist` folder can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Traditional web servers (Nginx, Apache)

## Connecting to Backend

Ensure both frontend and backend are running:

1. **Backend**: Running on `http://localhost:3001`
2. **Frontend**: Running on `http://localhost:5173`

If you see CORS errors:
- Check the backend CORS configuration
- Verify the frontend URL is whitelisted in backend
- Ensure both are using the correct protocols (http/https)

## Common Issues

### Port Already in Use
```bash
# Change the development port
npm run dev -- --port 5174
```

### API Connection Issues
- Check if the backend server is running
- Verify `VITE_API_BASE_URL` is correct
- Check browser console for CORS errors
- Check backend server logs

### Build Errors
```bash
# Clear node_modules and reinstall
Remove-Item node_modules -Recurse
npm install
```

## Performance Optimization

The application includes:
- Code splitting with Vite
- Lazy-loaded routes
- Optimized component imports
- CSS modules

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding new features:
1. Create components in appropriate folders
2. Use Pinia for state management
3. Follow existing code style
4. Test with `npm run lint`
5. Format code with `npm run format`

## License

ISC

## Support

For issues or questions, please check the main project README at `../README.md`
