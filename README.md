# Taskify - Habit Tracking Application

Taskify is a modern, intuitive habit tracking application built with React and TypeScript. It helps users build consistency and achieve their goals through visual progress tracking using an interactive heatmap.

## Features

- 🎯 **Habit Creation**: Create and manage multiple habits with custom names
- 📊 **Visual Progress**: Track habits using an interactive heatmap calendar
- 🔥 **Streak Tracking**: Monitor your current streak and total completed days
- 🎨 **Modern UI**: Beautiful gradient-based design with smooth animations
- 📱 **Responsive Design**: Works seamlessly on all device sizes
- 💾 **Local Storage**: Data persists between sessions
- 🎭 **Animations**: Smooth transitions and interactions using Framer Motion
- 🎨 **Theme**: Dark mode with beautiful gradients and glass effects

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**:
  - Tailwind CSS
  - shadcn/ui components
  - Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router DOM
- **Data Persistence**: Browser LocalStorage
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Development Tools**:
  - ESLint
  - TypeScript
  - SWC (for faster builds)

## Getting Started

1. Clone the repository:

   ```bash
   git clone [repository-url]
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

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/
│   ├── CreateHabitModal.tsx    # Modal for creating new habits
│   ├── HabitHeatmap.tsx        # Main habit tracking component
│   └── ui/                     # Reusable UI components
├── pages/
│   ├── Index.tsx              # Main landing page
│   └── NotFound.tsx           # 404 page
├── lib/
│   └── utils.ts              # Utility functions
├── App.tsx                   # Root component
└── main.tsx                 # Entry point
```

## Features in Detail

### Habit Creation

- Create new habits with custom names
- Modal-based creation interface
- Input validation and error handling

### Progress Tracking

- Interactive heatmap calendar
- Visual representation of completion status
- Month labels for easy navigation
- Responsive grid layout

### Streak System

- Real-time streak calculation
- Animated streak counter
- Total days completed tracking
- Visual feedback for progress

### UI/UX Features

- Beautiful gradient-based design
- Smooth animations using Framer Motion
- Responsive layout for all devices
- Dark mode with glass effects
- Interactive tooltips and hover states

### Data Management

- Local storage persistence
- Real-time updates
- Safe deletion with confirmation
- Data validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development

The project uses several development tools and practices:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Local Storage** for data persistence

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS and shadcn/ui
- Icons from Lucide React
- Animations powered by Framer Motion
- UI components from Radix UI
