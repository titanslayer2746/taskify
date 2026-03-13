# Taskify Frontend - Complete Interview Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Authentication & Authorization Flow](#authentication--authorization-flow)
3. [Habit Tracking Flow](#habit-tracking-flow)
4. [Todo Management Flow](#todo-management-flow)
5. [Finance Tracking Flow](#finance-tracking-flow)
6. [Health & Wellness Flow](#health--wellness-flow)
7. [Sleep Tracking Flow](#sleep-tracking-flow)
8. [Journal Flow](#journal-flow)
9. [Pomodoro Timer Flow](#pomodoro-timer-flow)
10. [Projects Management Flow](#projects-management-flow)
11. [AI Chatbot Flow](#ai-chatbot-flow)
12. [State Management & Architecture](#state-management--architecture)
13. [Performance Optimizations](#performance-optimizations)

---

## Project Overview

**Taskify** is a comprehensive productivity ecosystem built with React + TypeScript + Vite that combines 7+ productivity tools into a single platform.

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: Context API + useReducer
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios with custom interceptors
- **Charts**: Recharts

### Key Features

1. Habit Tracking with heatmaps
2. Todo Management with priorities
3. Finance Tracker with analytics
4. Health & Wellness (Workout + Diet plans)
5. Sleep Tracker with quality metrics
6. Journal with rich text editing
7. Pomodoro Timer
8. Project Management (Kanban board)
9. AI-powered Chatbot assistant

---

## Authentication & Authorization Flow

### User Flow Diagram

```
Landing Page → Sign Up → OTP Verification → Dashboard (Habits)
                    ↓
            Sign In (if account exists)
                    ↓
         Forgot Password → Reset Password
```

### Detailed Flow: Sign Up

**Steps:**

1. User lands on `/` (landing page) - public route
2. Clicks "Get Started" or "Sign Up" button
3. Redirected to `/signup`
4. Fills form: Name, Email, Password, Confirm Password
5. Frontend validates:
   - All fields required
   - Email format validation
   - Password minimum 6 characters
   - Passwords match
6. Submits form → API call to `/users/register`
7. Backend creates user and sends OTP via email
8. Redirected to `/verify-otp` with email in state
9. User enters 6-digit OTP
10. OTP verified → Tokens stored → Redirected to `/habits`

**Technical Implementation:**

```typescript
// Key Components:
- SignUp.tsx: Form with validation
- VerifyOtp.tsx: OTP input with auto-focus
- AuthContext.tsx: Authentication state management
- apiService.register(): API call
- tokenStorage: LocalStorage management
```

### Detailed Flow: Sign In

**Steps:**

1. User navigates to `/signin`
2. Enters email and password
3. Frontend validation
4. API call to `/users/login`
5. Two scenarios:
   - **Verified user**: Receives tokens → Stored → Redirected to `/habits`
   - **Unverified user**: Redirected to `/verify-otp` to complete verification
6. Failed login shows inline error messages

**Technical Implementation:**

```typescript
// Key features:
- useLocation() for redirect after login (from parameter)
- Password visibility toggle
- Real-time error clearing on input change
- Loading states during API calls
```

### Detailed Flow: Forgot/Reset Password

**Steps:**

1. User clicks "Forgot Password" on sign-in page
2. Enters email → API sends reset link to email
3. User clicks link in email → Redirected to `/reset-password?token=xxx`
4. Enters new password + confirmation
5. Password reset → Redirected to sign in

### Protected Routes

**Implementation:**

```typescript
<ProtectedRoute>: Wraps authenticated pages
<PublicRoute>: Redirects authenticated users away from auth pages

// Logic:
- Checks AuthContext.isAuthenticated
- Shows loading state during initialization
- Redirects based on authentication status
```

### Token Management

**Features:**

1. **JWT Token Storage**: Access token in localStorage
2. **Refresh Token**: Stored separately, longer expiration
3. **Automatic Refresh**:
   - Monitors token expiration (TTL)
   - Auto-refreshes 5 minutes before expiry
   - Background service (`tokenRefreshService`)
4. **Token Interceptors**:
   - Request: Adds Authorization header
   - Response: Handles 401 errors, triggers refresh

**Implementation:**

```typescript
// Key files:
- storage.ts: Token storage utilities
- token-refresh.ts: Auto-refresh logic
- interceptors.ts: Axios interceptors
- AuthContext.tsx: Token state management
```

### Logout Flow

**Types of Logout:**

1. **Regular Logout**: User clicks logout button
2. **Force Logout**: Token expired/invalid
3. **Logout from All Devices**: Invalidates all sessions

**Steps:**

1. User clicks logout in navbar
2. Optional API call to `/users/logout` (blacklists token)
3. Stop token refresh service
4. Clear all storage (localStorage, sessionStorage, cache)
5. Reset AuthContext state
6. Redirect to `/signin`

---

## Interview Questions: Authentication

### Basic Level

**Q1: Explain how user authentication works in your application.**
**A:** We use JWT-based authentication. When a user logs in, the backend validates credentials and returns access + refresh tokens. Access token (short-lived, ~15 min) is used for API requests. Refresh token (longer-lived, ~7 days) is used to get new access tokens. Tokens are stored in localStorage and managed via AuthContext.

**Q2: How do you protect routes from unauthorized access?**
**A:** We have a `ProtectedRoute` component that wraps authenticated pages. It checks `AuthContext.isAuthenticated` before rendering. If not authenticated, it redirects to `/signin`. We also have `PublicRoute` that redirects authenticated users away from auth pages to `/habits`.

**Q3: What happens when a user refreshes the page?**
**A:** On app initialization, `AuthContext` runs an `initialize()` function that:

1. Reads tokens and user data from localStorage
2. Validates token expiration using JWT decode
3. If valid → Sets authenticated state
4. If expired → Clears storage and shows login
5. Starts auto-refresh service if authenticated

**Q4: How do you handle form validation?**
**A:** We use React Hook Form with Zod schemas for type-safe validation. Real-time validation on field blur, inline error messages, and disabled submit until valid. Also clear errors when user starts typing for better UX.

### Intermediate Level

**Q5: Explain your token refresh mechanism.**
**A:** We have a background service (`tokenRefreshService`) that:

1. Monitors token TTL (time-to-live) every minute
2. When token is 5 minutes from expiry, automatically calls `/users/refresh`
3. New access token is stored silently without user interaction
4. If refresh fails → Force logout
5. Service starts on login, stops on logout

**Q6: How do you prevent race conditions with token refresh?**
**A:** Our implementation:

1. Maintains a `isRefreshing` flag to prevent multiple simultaneous refreshes
2. Queues failed requests while refreshing
3. Once new token obtained, retries queued requests
4. Uses Promise-based queueing system in axios interceptors

**Q7: How is password security handled on the frontend?**
**A:**

- Minimum 6 characters enforced
- Password visibility toggle (UX feature)
- Never logged or stored in plain text
- Form data cleared after submission
- HTTPS only in production
- Password confirmation for sign-up
- Backend handles hashing (bcrypt)

**Q8: Explain your OTP verification implementation.**
**A:**

- 6-digit OTP sent via email
- Frontend uses `input-otp` library with auto-focus and auto-submit
- OTP expires in 10 minutes (countdown timer shown)
- Resend OTP functionality with rate limiting
- Stored in backend temporarily, not frontend
- Auto-redirect after successful verification

### Advanced Level

**Q9: How would you implement social authentication (Google/GitHub)?**
**A:** Implementation approach:

1. **Frontend**: Add OAuth buttons, redirect to OAuth provider
2. **Backend**: OAuth callback endpoint receives code
3. Exchange code for access token with provider
4. Fetch user info from provider
5. Create/update user in our database
6. Generate our JWT tokens
7. Redirect back to frontend with tokens
8. Frontend stores tokens same as email/password flow

**Q10: How do you handle token expiration for long-running operations?**
**A:**

- Check token TTL before starting operation
- Proactively refresh if < 5 minutes left
- For file uploads: Use signed URLs instead of Bearer tokens
- For WebSocket connections: Send refresh messages
- Implement operation resumption after re-authentication

**Q11: Explain how you would implement Multi-Factor Authentication.**
**A:**

1. After successful password verification
2. Generate TOTP secret (Time-based OTP)
3. User scans QR code with authenticator app
4. Store encrypted secret in backend
5. On login, request TOTP code after password
6. Verify TOTP on backend (time-window validation)
7. Only issue tokens after TOTP verification
8. Provide backup codes for account recovery

**Q12: How would you implement session management across multiple tabs?**
**A:** Using BroadcastChannel API or localStorage events:

1. When login in tab A → Broadcast "login" event
2. Other tabs listen and update AuthContext
3. When logout in any tab → All tabs logout
4. On token refresh → Broadcast new token
5. Implement cross-tab synchronization for better UX

---

## Habit Tracking Flow

### User Flow

```
Habits Page → Create Habit → View Heatmap → Toggle Daily Completion → Track Streaks
```

### Detailed Flow

**1. Create Habit**

- Click "Create Habit" button
- Modal opens with form (just name required)
- Submit → Optimistic update (shows immediately)
- API call to `/habits` POST
- If success → Replace with real data
- If error → Rollback optimistic update

**2. View Habits**

- Grid of habit cards
- Each card shows:
  - Habit name
  - Current streak (🔥 icon)
  - Total completions
  - Heatmap (GitHub-style)
  - Delete button

**3. Toggle Completion**

- Click on any date in heatmap
- Optimistic update (instant visual feedback)
- API call to `/habits/:id/toggle` PATCH
- Backend calculates new streak
- Updates state with real data
- Shows loading indicator if slow

**4. Delete Habit**

- Click delete icon
- Confirmation dialog appears
- Confirm → Optimistic removal
- API call to `/habits/:id` DELETE
- Rollback if error

### Technical Implementation

**Key Features:**

1. **Optimistic Updates**: UI updates immediately before API response
2. **Rollback on Error**: Reverts to previous state if API fails
3. **Loading States**: Shows loading for slow operations
4. **Error Handling**: Inline error banners with dismiss option

**Data Structure:**

```typescript
interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  completions: { [date: string]: boolean }; // "2024-01-15": true
  streak: number;
  totalCompletions: number;
  createdAt: string;
}
```

**Heatmap Logic:**

- Displays last 12 months (or configurable period)
- Color intensity based on completion (like GitHub contributions)
- Tooltip shows date and status on hover
- Click to toggle completion
- Calculates streaks: consecutive completed days

---

## Interview Questions: Habit Tracking

### Basic Level

**Q1: How does the habit completion tracking work?**
**A:** Each habit has a `completions` object mapping dates to boolean values. When user toggles a date, we update this object and recalculate the streak (consecutive completed days from today backwards). The heatmap visualizes this data with color intensity.

**Q2: What are optimistic updates and why use them?**
**A:** Optimistic updates mean updating the UI immediately before the server responds, assuming success. This makes the app feel instant. We store the optimistic state separately, so if the API fails, we can rollback to the original state and show an error.

**Q3: How do you calculate streaks?**
**A:** Backend calculates streaks:

1. Start from today
2. Count consecutive days with completions
3. Stop when we hit a day without completion
4. Frontend just displays the calculated value

### Intermediate Level

**Q4: How do you handle timezone issues in habit tracking?**
**A:**

- Store dates in ISO 8601 format with UTC
- Convert to user's local timezone on frontend using `date-fns`
- Backend uses user's timezone preference if stored
- Consistent date formatting across app
- "Today" is based on user's local time

**Q5: Explain your error recovery strategy for failed habit updates.**
**A:**

1. Store original state before optimistic update
2. Apply optimistic update immediately
3. Make API call
4. On error: Revert to original state
5. Show error banner (dismissable)
6. Retry button available
7. Network errors vs server errors handled differently

**Q6: How would you implement habit reminders?**
**A:** Using browser Notification API + service workers:

1. Request notification permission
2. User sets reminder time for each habit
3. Service worker schedules notifications
4. Show notification at set time
5. Click notification → Opens app to that habit
6. Backend could send push notifications for mobile

### Advanced Level

**Q7: How would you implement habit analytics (completion rate, best streaks, etc.)?**
**A:**

1. **Completion Rate**: (total completions / total days since creation) × 100
2. **Best Streak**: Track max streak historically (needs backend storage)
3. **Weekly/Monthly Stats**: Aggregate completions by time period
4. **Heatmap Analysis**: Color coding by completion density
5. **Predictive Analytics**: ML model to predict likely completion based on patterns
6. Use Recharts for visualization

**Q8: How would you optimize rendering for 50+ habits with large heatmaps?**
**A:**

1. **Virtualization**: Render only visible habits (react-window or react-virtuoso)
2. **Lazy Loading**: Load habits in chunks (pagination)
3. **Memoization**: useMemo for expensive heatmap calculations
4. **Code Splitting**: Dynamic imports for Heatmap component
5. **Debounce**: Debounce heatmap hover tooltips
6. **Web Workers**: Calculate stats in background thread

**Q9: Design a habit sharing feature.**
**A:**

1. Generate shareable link with habit template
2. Link includes habit name, description, frequency
3. Recipient can "clone" habit to their account
4. Public habit library/marketplace
5. Categories and search functionality
6. Rating/review system
7. Privacy controls (public/private/friends)

---

## Todo Management Flow

### User Flow

```
Todo Page → Create Todo → Set Priority/Due Date → Mark Complete → Edit/Delete
```

### Detailed Flow

**1. Create Todo**

- Click "+ Add Task" button
- Form expands inline or modal opens
- Fill fields:
  - Title (required)
  - Description (optional)
  - Priority (High/Medium/Low)
  - Due Date (date picker)
  - Category (optional)
- Submit → Optimistic add to list
- API call → Replace with server data

**2. View Todos**

- List view with sections:
  - Active todos (incomplete)
  - Completed todos (collapsed by default)
- Sort options:
  - By priority
  - By due date
  - By creation date
- Filter by:
  - Category
  - Priority
  - Completion status

**3. Toggle Todo**

- Checkbox click
- Strikes through text
- Moves to completed section
- Optimistic update
- API call to update

**4. Edit Todo**

- Click edit icon
- Inline editing or modal
- Update any field
- Save → Optimistic update → API call

**5. Delete Todo**

- Click delete icon
- Confirmation dialog
- Optimistic removal
- API call

### Technical Implementation

**Data Structure:**

```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Key Features:**

1. **Inline Editing**: Double-click to edit
2. **Drag & Drop**: Reorder todos (future feature)
3. **Bulk Actions**: Select multiple → Delete/Complete
4. **Smart Sorting**: Overdue items highlighted in red
5. **Categories**: Auto-suggest from existing categories

---

## Interview Questions: Todo Management

### Basic Level

**Q1: How do you handle todo state management?**
**A:** Todos are stored in component state (useState). On mount, we fetch from API and populate state. All CRUD operations update local state optimistically, then call API. We maintain an `optimisticUpdates` Map to track pending changes for rollback.

**Q2: How do you implement priority-based sorting?**
**A:**

```typescript
const sortByPriority = (todos: Todo[]) => {
  const priority = { high: 3, medium: 2, low: 1 };
  return [...todos].sort((a, b) => priority[b.priority] - priority[a.priority]);
};
```

**Q3: How do you show overdue todos?**
**A:**

- Parse `dueDate` with date-fns
- Compare with current date
- If dueDate < today && !completed → Mark as overdue
- Apply red styling/badge
- Sort overdue todos to top

### Intermediate Level

**Q4: Implement a search/filter system for todos.**
**A:**

```typescript
const filteredTodos = useMemo(() => {
  return todos
    .filter(
      (t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((t) => (categoryFilter ? t.category === categoryFilter : true))
    .filter((t) => (priorityFilter ? t.priority === priorityFilter : true))
    .filter((t) => showCompleted || !t.completed);
}, [todos, searchTerm, categoryFilter, priorityFilter, showCompleted]);
```

**Q5: How would you implement recurring todos?**
**A:**

1. Add `recurring` field: { enabled: bool, frequency: 'daily'|'weekly'|'monthly' }
2. Backend cron job or scheduled task
3. On completion, create next occurrence based on frequency
4. Frontend shows recurring indicator (🔁 icon)
5. "Complete all" vs "Complete once" options
6. Edit recurring: "This one" or "All future"

**Q6: Explain offline-first todo management.**
**A:**

1. Store todos in IndexedDB (local database)
2. All operations work offline, update IndexedDB
3. Queue failed API calls with retry logic
4. When back online, sync queued operations
5. Conflict resolution: last-write-wins or user prompt
6. Use service workers for background sync

### Advanced Level

**Q7: Design a real-time collaborative todo list.**
**A:**

1. **WebSocket Connection**: Establish persistent connection
2. **Operational Transform**: Resolve concurrent edits
3. **Presence Indicators**: Show who's viewing/editing
4. **Conflict Resolution**:
   - Lock editing when someone else editing
   - Or merge changes with OT algorithm
5. **Broadcast Changes**: On todo update → Send to all connected clients
6. **Optimistic UI**: Update immediately, rollback if server rejects
7. **Cursor Position**: Show where others are typing (like Figma)

**Q8: How would you implement todo dependencies?**
**A:**

1. Add `dependencies: string[]` field (array of todo IDs)
2. Visual: Show as hierarchical tree or Gantt chart
3. Logic: Can't complete parent until all dependencies complete
4. Validation: Prevent circular dependencies
5. Auto-complete children when parent completes (optional)
6. Critical path calculation for project planning
7. Drag to create dependency links

**Q9: Implement smart todo suggestions using AI.**
**A:**

1. Analyze user's todo patterns (NLP on descriptions)
2. Suggest categories based on content
3. Predict priority based on keywords ("urgent", "ASAP")
4. Suggest due dates based on historical completion times
5. Break down large tasks into subtasks (LLM)
6. Recommend related todos
7. Estimate completion time using historical data

---

## Finance Tracking Flow

### User Flow

```
Finance Page → Add Transaction (Income/Expense) → View Dashboard → Analytics → Filter by Date/Category
```

### Detailed Flow

**1. Add Transaction**

- Click "+ Add Transaction" button
- Modal opens with form:
  - Type: Income / Expense (toggle)
  - Amount (number input)
  - Category (dropdown with auto-suggest)
  - Description
  - Date (default: today)
  - Payment Method (optional)
- Color coding: Green (income), Red (expense)
- Submit → Optimistic add → API call

**2. View Dashboard**

- **Summary Cards**:
  - Total Income (this month)
  - Total Expenses (this month)
  - Balance (Income - Expenses)
  - Savings Rate
- **Charts**:
  - Pie chart: Expenses by category
  - Line chart: Income/Expense trend over time
  - Bar chart: Monthly comparison
- **Recent Transactions**: Last 10 transactions

**3. Analytics**

- Date range selector (This Month, Last Month, Custom)
- Category breakdown
- Spending insights: "You spent 30% on Food"
- Budget tracking (if budgets set)
- Export to CSV

**4. Edit/Delete Transaction**

- Click transaction card
- Edit modal opens
- Update fields → API call
- Delete with confirmation

### Technical Implementation

**Data Structure:**

```typescript
interface FinanceEntry {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: string;
  paymentMethod?: string;
  createdAt: string;
}

interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  categoryBreakdown: { category: string; amount: number }[];
}
```

**Key Features:**

1. **Real-time Calculations**: Stats update on every transaction
2. **Category Management**: Dynamic category creation
3. **Date Filtering**: Fast filtering without API calls
4. **Charts**: Recharts for data visualization
5. **Currency Formatting**: Using Intl.NumberFormat

---

## Interview Questions: Finance Tracking

### Basic Level

**Q1: How do you calculate the balance?**
**A:** `Balance = Total Income - Total Expenses`. We calculate this on the frontend by filtering transactions by date range, summing income transactions, summing expense transactions, and subtracting.

**Q2: How do you format currency?**
**A:**

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
```

**Q3: How do you categorize expenses?**
**A:** We maintain a predefined category list (Food, Transport, Entertainment, etc.) and allow users to add custom categories. Categories are stored as strings in transactions. We use autocomplete with existing categories for consistency.

### Intermediate Level

**Q4: How would you implement budget tracking?**
**A:**

1. User sets monthly budget per category
2. Track actual spending vs budget
3. Calculate percentage used: `(spent / budget) × 100`
4. Visual indicators: Progress bars, red if over budget
5. Notifications when approaching/exceeding budget
6. Budget rollover option (unused budget → next month)

**Q5: Explain your approach to data visualization for finance.**
**A:**

- **Pie Chart**: Category distribution (top 5 + "Others")
- **Line Chart**: Trend over time (dual-axis: income & expense)
- **Bar Chart**: Monthly comparison (grouped bars)
- **Heatmap**: Spending intensity by day of week
- Interactive: Click legend to toggle, hover for details
- Responsive: Adjust chart size/layout for mobile
- Color scheme: Consistent (green=income, red=expense)

**Q6: How do you handle large transaction lists (1000+)?**
**A:**

1. **Pagination**: Load 50 transactions at a time
2. **Infinite Scroll**: Load more on scroll bottom
3. **Virtualization**: Render only visible transactions
4. **Server-side Filtering**: Send filters to backend
5. **Caching**: Cache frequent queries with React Query
6. **Indexing**: Backend database indexes on date, category

### Advanced Level

**Q7: Design a recurring transaction system.**
**A:**

1. Add `recurring` field: { enabled: bool, frequency: 'daily'|'weekly'|'monthly', endDate?: string }
2. Backend scheduled job runs daily
3. Creates new transaction based on recurrence rules
4. Frontend shows recurring indicator (🔁)
5. Edit options: "This one" or "All future"
6. Pause/Resume recurring transactions
7. Handle edge cases: Last day of month (Feb 28/29)

**Q8: Implement multi-currency support.**
**A:**

1. Add `currency` field to transactions
2. Store exchange rates (updated daily via API)
3. Convert all to base currency for calculations
4. Display in original currency + converted amount
5. Historical exchange rates for accurate past conversions
6. Cache exchange rates with TTL
7. Handle cryptocurrency support

**Q9: How would you implement financial forecasting?**
**A:**

1. **ML Model**: Train on historical data (income/expense patterns)
2. **Time Series Analysis**: Predict future balance based on trends
3. **Seasonal Adjustments**: Account for recurring patterns (e.g., holiday spending)
4. **Scenario Planning**: "What if I save $500/month?"
5. **Confidence Intervals**: Show prediction range
6. **Anomaly Detection**: Flag unusual transactions
7. Use libraries: TensorFlow.js, Prophet (via backend)

---

## Health & Wellness Flow

### User Flow

```
Health Page → Create Workout Plan → Create Diet Plan → Log Daily Notes → View Progress
```

### Detailed Flow

**1. Create Workout Plan**

- Click "Add Workout Plan"
- Modal with form:
  - Name (e.g., "Morning Cardio")
  - Type (Cardio/Strength/Yoga/etc.)
  - Exercises (array of { name, sets, reps, duration })
  - Schedule (days of week)
  - Notes
- Save → Shows in workout list
- Mark as completed daily

**2. Create Diet Plan**

- Click "Add Diet Plan"
- Modal with form:
  - Name (e.g., "High Protein Breakfast")
  - Meal Type (Breakfast/Lunch/Dinner/Snack)
  - Foods (array of { name, quantity, calories })
  - Target Calories
  - Schedule
- Save → Shows in diet list

**3. Daily Logging**

- View today's planned workouts/meals
- Check off completed items
- Add notes about workout intensity, meal taste, etc.
- Track weight, water intake, calories

**4. View Progress**

- Charts showing:
  - Workout completion rate
  - Calorie intake vs target
  - Weight trend over time
- Calendar view of completed workouts/meals

### Technical Implementation

**Data Structures:**

```typescript
interface WorkoutEntry {
  id: string;
  name: string;
  type: string;
  exercises: {
    name: string;
    sets?: number;
    reps?: number;
    duration?: number;
  }[];
  completed: boolean;
  completedDate?: string;
  notes?: string;
  createdAt: string;
}

interface MealEntry {
  id: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foods: { name: string; quantity: string; calories: number }[];
  totalCalories: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}
```

---

## Interview Questions: Health & Wellness

### Basic Level

**Q1: How do you track workout completion?**
**A:** Each workout has a `completed` boolean and `completedDate` timestamp. User clicks checkbox to mark complete. We store completion in backend, which allows for historical tracking and streak calculation.

**Q2: How do you calculate total calories in a meal?**
**A:** Sum the calories of all foods in the meal:

```typescript
const totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
```

### Intermediate Level

**Q3: How would you implement a workout timer?**
**A:**

1. Display exercise name and duration
2. Countdown timer using setInterval
3. Voice/audio alerts when exercise changes
4. Pause/Resume functionality
5. Skip to next exercise
6. Track actual time spent vs planned
7. Background timer (keep running when tab inactive)

**Q4: Design a meal planning calendar.**
**A:**

1. Calendar view (week/month)
2. Drag-and-drop meals onto days
3. Duplicate meals across days
4. Auto-calculate daily calorie totals
5. Highlight days over/under calorie targets
6. Generate grocery list from planned meals
7. Recipe suggestions based on dietary preferences

**Q5: How would you implement progress photos?**
**A:**

1. Add photo upload on workout completion
2. Store in cloud storage (S3/Cloudinary)
3. Display in grid/timeline view
4. Before/After comparison slider
5. Face detection for privacy blur option
6. Image compression before upload
7. Progress indicators: Weight loss, muscle gain measurements

### Advanced Level

**Q6: Design an AI-powered workout recommendation system.**
**A:**

1. Collect user data: Fitness level, goals, preferences, past workouts
2. ML model trained on workout effectiveness data
3. Personalized recommendations based on:
   - Recent workout history (avoid overtraining)
   - Progress towards goals
   - Time available
   - Equipment available
4. Adaptive difficulty: Adjust based on completion rate
5. Exercise substitutions for injuries
6. A/B testing different workout splits

**Q7: Implement real-time workout tracking with wearables.**
**A:**

1. Integrate with Fitbit/Apple Watch APIs
2. Real-time heart rate monitoring
3. Sync workout data automatically
4. Calorie burn calculation based on heart rate
5. Rest time optimization based on heart rate recovery
6. Workout intensity zones (cardio/fat burn/peak)
7. WebSocket connection for live data streaming

---

## Sleep Tracking Flow

### User Flow

```
Sleep Page → Log Sleep Entry → Set Sleep/Wake Time → Rate Quality → View Sleep Chart → Analytics
```

### Detailed Flow

**1. Log Sleep Entry**

- Click "Log Sleep"
- Form fields:
  - Date (default: last night)
  - Sleep Time (e.g., 11:00 PM)
  - Wake Time (e.g., 7:00 AM)
  - Quality Rating (1-5 stars)
  - Notes (dreams, interruptions, etc.)
- Auto-calculate:
  - Total Hours: Wake Time - Sleep Time
  - Sleep Score: Based on duration + quality
- Submit → Save to backend

**2. View Sleep Chart**

- Line chart showing:
  - Sleep duration trend over weeks
  - Average sleep time
  - Quality trend
- Color coding: Red (<6h), Yellow (6-8h), Green (>8h)
- Annotations for unusual patterns

**3. Analytics**

- **Average Sleep Duration**: Weekly/monthly
- **Best Sleep Quality Days**: Which nights had 5-star sleep
- **Consistency Score**: How regular sleep schedule is
- **Sleep Debt**: Cumulative hours below recommended
- **Recommendations**: "You sleep best when you sleep at 10 PM"

### Technical Implementation

**Data Structure:**

```typescript
interface SleepEntry {
  id: string;
  date: string;
  sleepTime: string; // HH:mm format
  wakeTime: string;
  duration: number; // hours
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: string;
}
```

**Key Calculations:**

```typescript
const calculateDuration = (sleepTime: string, wakeTime: string): number => {
  const sleep = parse(sleepTime, "HH:mm", new Date());
  let wake = parse(wakeTime, "HH:mm", new Date());

  // Handle sleep across midnight
  if (wake < sleep) {
    wake = addDays(wake, 1);
  }

  return differenceInHours(wake, sleep);
};
```

---

## Interview Questions: Sleep Tracking

### Basic Level

**Q1: How do you handle sleep that crosses midnight?**
**A:** When parsing sleep/wake times, if wake time is earlier than sleep time, we assume it's the next day. We add 24 hours to the wake time before calculating duration.

**Q2: What makes a good sleep score?**
**A:** A combination of:

- Duration (7-9 hours optimal)
- Quality rating (user-reported)
- Consistency (same time daily)
- Efficiency (actual sleep / time in bed)

### Intermediate Level

**Q3: How would you implement sleep reminders?**
**A:**

1. User sets desired sleep time (e.g., 10 PM)
2. Calculate reminder time (bedtime - 30 min = 9:30 PM)
3. Use browser Notification API
4. Service worker for background notifications
5. Smart reminders: Adjust based on typical prep time
6. "Wind down" reminders: Stop screen time 1h before bed

**Q4: Design a sleep debt calculator.**
**A:**

1. Recommended sleep = 8 hours (or user-customized)
2. For each day: Debt = max(0, recommended - actual)
3. Cumulative debt = sum of daily debts
4. Recovery recommendations: Extra sleep needed
5. Visualization: Stacked bar chart (debt in red, actual in green)
6. Alert if debt > 10 hours cumulative

### Advanced Level

**Q5: How would you integrate with sleep tracking wearables?**
**A:**

1. OAuth integration with device APIs (Fitbit, Apple Health, etc.)
2. Sync sleep data automatically (no manual entry needed)
3. Get additional metrics: REM/Deep/Light sleep stages
4. Heart rate variability during sleep
5. Movement/restlessness tracking
6. Environmental factors: Room temperature, noise
7. Data normalization: Different devices, different formats

**Q6: Implement sleep quality prediction.**
**A:**

1. Features for ML model:
   - Bedtime (how late)
   - Caffeine intake before sleep
   - Screen time before sleep
   - Exercise during day
   - Stress level (from journal)
   - Room environment
2. Train regression model to predict quality rating
3. Show prediction before sleep: "Sleep score will likely be 3/5"
4. Recommendations to improve: "Avoid caffeine after 2 PM"
5. A/B test recommendations for effectiveness

---

## Journal Flow

### User Flow

```
Journal Page → Create Entry → Rich Text Editing → Tag/Categorize → Search/Filter → View Past Entries
```

### Detailed Flow

**1. Create Journal Entry**

- Click "New Entry" button
- Rich text editor opens:
  - Title (optional)
  - Content (markdown support or WYSIWYG)
  - Mood selector (emoji picker)
  - Tags (auto-suggest from existing)
  - Attachments (images, files)
- Auto-save drafts every 30 seconds
- Publish → Saves to backend

**2. Edit Entry**

- Click on any past entry
- Opens in edit mode
- Shows: Last edited timestamp
- Save changes → Updates backend

**3. Search & Filter**

- Search box: Full-text search in title + content
- Filters:
  - Date range
  - Tags
  - Mood
- Sort: Newest first / Oldest first

**4. View Timeline**

- Chronological list of entries
- Preview: First 3 lines + "Read more"
- Pagination or infinite scroll
- Calendar view: See which days have entries

### Technical Implementation

**Data Structure:**

```typescript
interface JournalEntry {
  id: string;
  title?: string;
  content: string; // Markdown or HTML
  mood?: string; // emoji
  tags: string[];
  attachments?: { url: string; type: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}
```

**Rich Text Editor:**

- Options: Quill, Slate, TipTap, or custom
- Features: Bold, Italic, Lists, Links, Images
- Markdown shortcuts: `#` for headers, `*` for bold
- Auto-save to localStorage (draft recovery)

---

## Interview Questions: Journal

### Basic Level

**Q1: How do you implement auto-save for journal drafts?**
**A:**

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem("journal_draft", content);
  }, 30000); // 30 seconds

  return () => clearTimeout(timer);
}, [content]);
```

**Q2: How do you implement full-text search?**
**A:** On frontend: Filter entries where `title.includes(searchTerm) || content.includes(searchTerm)`. For large datasets, use backend search with database full-text indexes or Elasticsearch.

### Intermediate Level

**Q3: Implement a mood tracking chart from journal entries.**
**A:**

1. Extract mood emoji from each entry
2. Map emoji to numeric value (😢=1, 😐=3, 😄=5)
3. Plot line chart of mood over time
4. Identify mood patterns (mood better on weekends?)
5. Correlate with other data: Exercise, sleep, habits
6. Show average mood per week/month

**Q4: How would you implement version history for journal entries?**
**A:**

1. Store each edit as a new version in backend
2. Field: `versions: { content: string; editedAt: string }[]`
3. Show "Edited X times" badge
4. Version comparison: Diff view (like Git)
5. Restore previous version option
6. Compress old versions (delta encoding)

### Advanced Level

**Q5: Design an AI-powered journal insights system.**
**A:**

1. **Sentiment Analysis**: Analyze emotional tone of entries
2. **Topic Extraction**: Identify recurring themes using NLP
3. **Mood Prediction**: Predict mood based on content
4. **Pattern Recognition**: "You mention work stress often on Mondays"
5. **Prompts**: Suggest writing prompts based on gaps
6. **Gratitude Tracking**: Count grateful mentions
7. **Progress Tracking**: Track goals mentioned over time
8. Use OpenAI API, spaCy, or TensorFlow.js

**Q6: Implement end-to-end encryption for journal entries.**
**A:**

1. Generate encryption key from user password (PBKDF2)
2. Encrypt entry content on client before sending to server
3. Server stores encrypted data (can't read it)
4. Decrypt on client when viewing
5. Key never leaves client
6. Password reset = data loss (can't decrypt without key)
7. Export encrypted backup option
8. Use Web Crypto API for encryption

---

## Pomodoro Timer Flow

### User Flow

```
Pomodoro Page → Configure Settings → Start Work Session → Break → Repeat → View Statistics
```

### Detailed Flow

**1. Configure Timer**

- Default settings:
  - Work: 25 minutes
  - Short Break: 5 minutes
  - Long Break: 15 minutes
  - Long Break Interval: After 4 work sessions
- Customize in settings modal
- Save preferences to localStorage

**2. Start Work Session**

- Click "Start" button
- Timer starts counting down from 25:00
- Browser notification permission requested (if not granted)
- Visual indicators:
  - Progress ring animation
  - Background color changes (red for work, green for break)
  - Tab title shows countdown

**3. During Work Session**

- Pause/Resume button
- Skip to break button
- Stop/Reset button
- Cannot switch tabs? (optional strict mode)
- Play notification sound when session ends

**4. Break Time**

- Automatic transition or manual confirmation
- Timer shows break countdown
- Different background color
- Notification: "Take a break!"
- Return to work automatically or click "Resume"

**5. Long Break**

- After 4th work session
- Longer duration (15 min)
- Special notification
- Reset cycle counter

**6. Statistics**

- Total focus time today/week/month
- Sessions completed
- Average session length
- Productivity chart over time

### Technical Implementation

**Timer Logic:**

```typescript
const [timeLeft, setTimeLeft] = useState(workDuration * 60); // seconds
const [isActive, setIsActive] = useState(false);
const [mode, setMode] = useState<"work" | "break">("work");

useEffect(() => {
  let interval: NodeJS.Timeout;

  if (isActive && timeLeft > 0) {
    interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  } else if (timeLeft === 0) {
    handleSessionComplete();
  }

  return () => clearInterval(interval);
}, [isActive, timeLeft]);
```

**Notifications:**

```typescript
if (Notification.permission === "granted") {
  new Notification("Break Time!", {
    body: "Great work! Take a 5-minute break.",
    icon: "/favicon.ico",
  });
}
```

---

## Interview Questions: Pomodoro Timer

### Basic Level

**Q1: How does the countdown timer work?**
**A:** We use `setInterval` to decrement `timeLeft` state every 1000ms (1 second). When `timeLeft` reaches 0, we clear the interval, play a notification sound, and transition to the next phase
