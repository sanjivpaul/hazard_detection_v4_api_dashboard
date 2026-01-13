# Hazard Detection AI Dashboard

A modern, enterprise-grade dashboard for monitoring and managing AI-powered hazard detection systems. Built with React, Vite, and Tailwind CSS.

## Features

- 🎥 **Live CCTV Monitoring** - View multiple camera feeds simultaneously
- 🚨 **Hazard Detection Logs** - Real-time tracking and filtering of detected hazards
- 🎨 **Dark/Light Mode** - Seamless theme switching with persistent preferences
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- ⚙️ **Settings Management** - Comprehensive configuration options
- 🏗️ **Enterprise Architecture** - Clean, scalable folder structure following best practices

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Sidebar, DashboardLayout)
│   ├── cctv/           # CCTV-related components
│   └── hazards/        # Hazard-related components
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard page
│   └── Settings.jsx    # Settings page
├── contexts/           # React Context providers
│   └── ThemeContext.jsx
├── hooks/              # Custom React hooks
│   ├── useHazards.js
│   └── useCCTVChannels.js
├── services/           # API service layer
│   └── api.js
├── utils/              # Utility functions and constants
│   └── constants.js
├── App.jsx             # Main app component with routing
└── main.jsx            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### API Integration

The dashboard is set up to connect to your backend API. Update the API endpoints in:
- `src/utils/constants.js` - API endpoint definitions
- `src/services/api.js` - API service methods

Currently, the app uses mock data. To connect to your actual API:
1. Uncomment the API calls in `src/hooks/useHazards.js` and `src/hooks/useCCTVChannels.js`
2. Update the mock data in components with real API responses

## Key Components

### Dashboard
- Overview statistics
- Recent hazards
- Quick actions

### CCTV Feeds
- Grid/List view toggle
- Multiple channel support
- Play/pause controls
- Fullscreen mode
- Volume control

### Hazard Logs
- Search and filter functionality
- Severity-based filtering
- Status tracking
- Export capabilities

### Settings
- Theme switching (Light/Dark)
- Notification preferences
- System configuration
- Security settings

## Technologies Used

- **React 19** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities
- **Vite** - Build tool and dev server

## Best Practices Implemented

✅ Component-based architecture  
✅ Separation of concerns (components, pages, services, hooks)  
✅ Context API for global state (theme)  
✅ Custom hooks for reusable logic  
✅ Service layer for API calls  
✅ Responsive design with mobile-first approach  
✅ Accessibility considerations  
✅ Dark mode support  
✅ Clean, maintainable code structure  

## Customization

### Adding New Routes

1. Create a new page component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Add a menu item in `src/components/layout/Sidebar.jsx`

### Styling

The project uses Tailwind CSS. Customize colors and themes in `tailwind.config.js`.

### Adding New Features

Follow the existing folder structure:
- Components → `src/components/`
- Pages → `src/pages/`
- Hooks → `src/hooks/`
- Services → `src/services/`
- Utils → `src/utils/`

## License

MIT
