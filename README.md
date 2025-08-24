# Habitty - Comprehensive Productivity & Habit Tracking Application

Habitty is a modern, full-stack productivity application built with React, TypeScript, and Node.js. It helps users build consistency, track habits, manage tasks, and improve overall productivity through various integrated tools.

## Features

### Core Features

- 🎯 **Habit Tracking**: Create and manage habits with interactive heatmap visualization
- ✅ **Todo Management**: Organize tasks with priorities and descriptions
- ⏱️ **Pomodoro Timer**: Focus timer with customizable settings
- 💰 **Finance Tracker**: Monitor income, expenses, and balance
- 📝 **Journal**: Daily note-taking with rich text support
- 💪 **Health & Wellness**: Workout and diet plan management
- 😴 **Sleep Tracker**: Monitor sleep patterns and quality
- 🔐 **User Authentication**: Secure user accounts (backend ready)

### UI/UX Features

- 🎨 **Modern Design**: Beautiful gradient-based interface with glass effects
- 📱 **Responsive Design**: Optimized for all device sizes
- 🎭 **Smooth Animations**: Framer Motion powered interactions
- 🌙 **Dark Mode**: Consistent dark theme throughout
- 🔄 **Auto-save**: Real-time data persistence
- ⚡ **Fast Performance**: Optimized with Vite and SWC

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Data Persistence**: Browser LocalStorage (frontend) / MongoDB (backend)

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Development**: Nodemon for auto-restart
- **Environment**: Dotenv for configuration

## Project Structure

```
habitty/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── ui/             # shadcn/ui components
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                # Node.js backend application
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   │   └── User.ts     # User model for authentication
│   │   ├── db/             # Database configuration
│   │   │   └── connection.ts # MongoDB connection
│   │   └── index.ts        # Express server entry point
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your MongoDB connection string:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=3001
   ```

4. Start the development server:

   ```bash
   npm run dev:watch
   ```

5. The backend will be available at [http://localhost:3001](http://localhost:3001)

## Available Scripts

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend Scripts

- `npm run dev` - Run server once with ts-node
- `npm run dev:watch` - Run server with nodemon (auto-restart)
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Run built JavaScript (production)

## Features in Detail

### Habit Tracking

- Interactive heatmap calendar
- Streak tracking and statistics
- Custom habit creation and management
- Visual progress indicators

### Todo Management

- Priority-based task organization
- Expandable descriptions
- Mobile-optimized interface
- Confirmation dialogs for deletions

### Pomodoro Timer

- Customizable work/break intervals
- Session tracking
- Settings persistence
- Focus-enhancing interface

### Finance Tracker

- Income and expense tracking
- Balance calculation
- Visual statistics
- Category-based organization

### Journal

- Rich text support
- Daily note creation
- Entry management
- Search and navigation

### Health & Wellness

- Workout plan creation and management
- Diet plan tracking
- Weekly schedule assignment
- Progress visualization

### Sleep Tracker

- Sleep check-in/check-out
- Quality rating system
- Statistics and charts
- Journal integration

## Development

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Git hooks** for pre-commit checks

### Database

- **MongoDB** for data persistence
- **Mongoose** for schema management
- **Indexing** for performance optimization

### Security

- **Environment variables** for sensitive data
- **Input validation** on all endpoints
- **Password hashing** (ready for implementation)
- **JWT authentication** (ready for implementation)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, TypeScript, and Node.js
- Styled with Tailwind CSS and shadcn/ui
- Icons from Lucide React
- Animations powered by Framer Motion
- Database powered by MongoDB and Mongoose
