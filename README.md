# SprintDesk

SprintDesk is a modern Scrum/Kanban project management application built as a React single-page application. It provides a visual board for managing sprint tasks, tracking development velocity, monitoring analytics, and receiving real-time posts notifications.

## Features

- **Authentication**: Secure authentication flow utilizing DummyJSON APIs with local storage session persistence and access token refresh/retry interceptors.
- **Protected Routing**: Navigation guards preventing unauthenticated access to the shell pages and preventing logged-in users from accessing the login screen.
- **Kanban Board**: Drag-and-drop workflow columns (Backlog, In Progress, Review, Done) to manage sprint tasks.
- **Task Management (CRUD)**: Create, view, edit, and delete sprint tasks.
- **Comments**: Threaded task discussions with user mappings.
- **Analytics**: Graphic insights (Sprint Velocity, Task Status, Priority Breakdown, and Completion Trend) derived from active board state.
- **Notifications**: Polling system fetching posts from JSONPlaceholder, displaying unread counters, paginated lists, and auto-dismiss toasts.
- **Theme Switcher**: Shared light and dark layout selector.
- **Accessibility & Responsiveness**: Keyboard reachable controls, modal focus trapping, card keyboard activations, alt image descriptions, and reflow support at 375px.

## Technology Stack

- **Core**: React 18, TypeScript, Vite
- **Router**: React Router Dom v6
- **Server State**: TanStack Query v5
- **Client State**: Zustand v4
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit/core
- **Tests**: Vitest, React Testing Library

## Project Structure

- `src/components`: Reusable layout and design-system elements (Button, Input, Select, Modal, Drawer, Toast, Skeleton, AppShell).
- `src/hooks`: Custom React, TanStack Query, and polling hooks (useAuth, useSprintTasks, useUsers, useComments, useNotificationPolling).
- `src/pages`: Main page components (Login, Dashboard, Board, Analytics).
- `src/services`: API request services (apiClient, notificationService).
- `src/stores`: Zustand global state managers (authStore, boardStore, notificationStore, themeStore).
- `src/types`: TypeScript model interfaces.
- `src/test`: Unit and integration test suites.
- `public/mock-data.json`: Local static source containing mock sprints, users, and tasks.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

No environment variables are required to run this application. All API integrations target static endpoints directly.

## Run Commands

- **Development Server**:
  ```bash
  npm run dev
  ```
- **Production Build**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```
- **Run Tests**:
  ```bash
  npm run test
  ```

## Authentication

The application integrates with the DummyJSON authentication endpoint. Users can log in using any valid DummyJSON account, such as:
- **Username**: `emilys`
- **Password**: `emilyspass`

## External APIs

- **DummyJSON Auth** (`https://dummyjson.com/auth/login`): Verifies credentials and retrieves short-lived JWT access tokens and long-lived refresh tokens.
- **DummyJSON Refresh** (`https://dummyjson.com/auth/refresh`): Refreshes JWT tokens upon expiration.
- **JSONPlaceholder Polling** (`https://jsonplaceholder.typicode.com/posts?_limit=5`): Periodic polling endpoint mapping posts to simulate new notification arrival feeds.
