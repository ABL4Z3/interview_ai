# IntervuAI Frontend

React/Vite frontend for the IntervuAI platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Project Structure

```
src/
├── main.jsx             # Vite entry point
├── App.jsx              # Root component
├── components/          # Reusable components
│   ├── Navigation.jsx
│   ├── InterviewRoom.jsx
│   └── ...
├── pages/               # Page components
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   ├── Interview.jsx
│   └── ...
├── services/            # API services
│   ├── api.js           # Axios instance
│   ├── authService.js
│   └── interviewService.js
├── hooks/               # Custom React hooks
├── store/               # Zustand state management
├── utils/               # Helper functions
├── assets/              # Images, icons, etc.
├── styles/              # Global styles
│   └── globals.css
└── index.css            # Tailwind imports
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Custom CSS**: In `src/styles/`

## State Management

- **Zustand**: Lightweight state management
- Stores located in `src/store/`

## API Integration

- **Axios**: HTTP client
- Base URL configured in `.env.local`
- Services in `src/services/`

## Key Pages (Phase 1+)

- **Home** (`/`) - Landing page
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration
- **Dashboard** (`/dashboard`) - User dashboard
- **Interview Room** (`/interview/:id`) - Interview interface

## Features Roadmap

### Phase 1 (Backend foundation)
- [ ] User authentication
- [ ] Interview creation

### Phase 2 (Audio integration)
- [ ] Real-time audio streaming

### Phase 3 (Frontend UI)
- [ ] Interview room interface
- [ ] Microphone access
- [ ] Real-time transcription display
- [ ] Responsive design

### Phase 4 (Payments)
- [ ] Payment forms
- [ ] Subscription management

## Development Notes

- Uses React 18 with Hooks
- Vite for fast development and builds
- ES Modules throughout
- Responsive design with Tailwind
- Socket.io for real-time communication

## Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Deployment

Environment variables for production:
```env
VITE_API_BASE_URL=https://api.intervuai.com
VITE_SOCKET_URL=https://api.intervuai.com
```
