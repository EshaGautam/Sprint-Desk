# Demo Recording Script — SprintDesk

This script is a 5–8 minute guide for demonstrating the SprintDesk Kanban Board application's core capabilities, workflow controls, responsive behavior, and technical features.

---

## Recording Checklist & Script

### 1. Project Overview (0:00 - 0:30)
- **Visual**: Start on the login screen.
- **Speech**: Introduce SprintDesk as a modern project management Kanban interface built with React, TypeScript, and Vite. Mention the core architecture uses Zustand for local client state and TanStack Query for server state cache coordination.

### 2. Login & Route Guards (0:30 - 1:15)
- **Action**: Enter invalid credentials to demonstrate validation.
- **Action**: Try navigating directly to `/board` or `/analytics` to show route guard redirection.
- **Action**: Log in with demo account (`emilys` / `emilyspass`).
- **Speech**: Explain that DummyJSON is used as the auth endpoint. Access tokens are kept securely in-memory, while refresh tokens are saved in local storage for session persistence.

### 3. Dashboard Page & AppShell (1:15 - 1:45)
- **Visual**: Display `/dashboard` view.
- **Speech**: Show the shared sidebar layout. Point out that pages are lazy-loaded via React.lazy and Suspense to minimize initial bundle size and optimize page load speed.

### 4. Kanban Board & Drag-and-Drop (1:45 - 2:45)
- **Visual**: Navigate to the Kanban Board.
- **Action**: Drag a task card to reorder it in the same column, then drag it to move it across columns.
- **Speech**: Explain that columns represent Backlog, In Progress, Review, and Done. Explain that drag-and-drop is powered by `@dnd-kit/core`. Point out that the component updates are optimized using `React.memo` and stable selectors to prevent cascading renders.

### 5. Task Details & Edit Drawer (2:45 - 3:30)
- **Action**: Click a task card to open the Details Drawer. Change the description or title, and click Save.
- **Speech**: Explain that details are rendered inside a sliding Drawer. Demonstrating the focus trap—Tab key focus cycles between form elements and the close button without escaping to the background document.

### 6. Comments Thread (3:30 - 4:00)
- **Action**: Add a new comment inside the Drawer discussion section.
- **Speech**: Show that comments are updated on the client in Zustand, while server comments stay cached in React Query.

### 7. Task Creation & Deletion (4:00 - 4:30)
- **Action**: Click "+ Add Task" to open the creation modal. Create a new task.
- **Action**: Open the drawer for the new task, click "Delete", and click Confirm.
- **Speech**: Demonstrate that adding and deleting tasks updates the column task counters instantly.

### 8. Analytics View (4:30 - 5:15)
- **Visual**: Navigate to the Analytics page.
- **Speech**: Point out the four charts: Sprint Velocity (sprint done aggregates), Task Status breakdown, Priority Breakdown, and Completion Trend. Explain that charts are created using Recharts and derived from the board state using `useMemo` hooks.

### 9. Notification Polling & Toasts (5:15 - 6:00)
- **Visual**: Trigger a notification toast by waiting for the 10-second polling fetch from JSONPlaceholder.
- **Action**: Open the Bell dropdown. Show pagination controls (page X of Y) and read-state indicators. Click "Mark all read".
- **Speech**: Explain that polling uses window focus listeners, pausing requests when the browser tab is hidden and resuming when visible.

### 10. Light/Dark Theme Switching (6:00 - 6:30)
- **Action**: Click the theme toggle icon in the header.
- **Speech**: Show theme transitions across the sidebar, board, forms, modal, charts grid strokes, and notification dropdown. The theme is saved in local storage under `theme-store`.

### 11. Viewport Responsiveness (6:30 - 7:00)
- **Action**: Resize the browser window to mobile width (375px).
- **Speech**: Show that the sidebar collapses or adapts, cards stack, and the four Recharts containers resize dynamically without creating horizontal page scrolling.

### 12. Testing & Quality Gate Summary (7:00 - End)
- **Speech**: Conclude by showing that the application contains 72 passing tests, compiles cleanly on production builds, contains zero console errors, and achieves a Lighthouse score of 98 for Performance and 100 for Accessibility.
