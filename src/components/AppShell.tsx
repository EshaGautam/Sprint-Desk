import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useThemeStore } from '../stores/themeStore';
import { useNotificationPolling } from '../hooks/useNotificationPolling';
import Toast from './Toast/Toast';

export default function AppShell() {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  // Run the polling hook
  useNotificationPolling();

  const {
    notifications,
    isPanelOpen,
    toastMessage,
    setPanelOpen,
    setToastMessage,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const { theme, toggleTheme } = useThemeStore();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleLogout = () => {
    logout();
  };

  const togglePanel = () => {
    setPanelOpen(!isPanelOpen);
    setCurrentPage(1);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/board':
        return 'Kanban Board';
      case '/analytics':
        return 'Analytics';
      default:
        return 'SprintDesk';
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/board', label: 'Kanban Board' },
    { to: '/analytics', label: 'Analytics' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-100 border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col transition-colors duration-200">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <span className="text-lg font-bold tracking-wide">SprintDesk</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 relative transition-colors duration-200">
          <h2 className="text-xl font-bold tracking-wide">{getPageTitle()}</h2>

          <div className="flex items-center gap-2 relative">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-xl"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                // Sun Icon (switching to light)
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                // Moon Icon (switching to dark)
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={togglePanel}
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-xl"
              aria-label="Notification bell"
              data-testid="notification-bell"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-white dark:border-slate-900"
                  data-testid="notification-badge"
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel overlay dropdown */}
            {isPanelOpen && (
              <div
                role="dialog"
                aria-label="Notification Panel"
                className="absolute right-0 top-12 w-80 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-4 flex flex-col max-h-[450px] text-slate-900 dark:text-slate-100 transition-colors duration-200"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800/60">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {paginatedNotifications.length > 0 ? (
                    paginatedNotifications.map((item) => (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => markAsRead(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            markAsRead(item.id);
                          }
                        }}
                        className={`p-3 rounded-xl border ${
                          item.read
                            ? 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-950/40 dark:border-slate-900 dark:text-slate-500'
                            : 'bg-slate-100/60 border-slate-200 text-slate-800 hover:bg-slate-200/40 dark:bg-slate-900/60 dark:border-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800/40'
                        } transition-colors flex items-start gap-3 cursor-pointer`}
                        data-testid={`notification-item-${item.id}`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-semibold leading-tight break-words">{item.title}</h4>
                            {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">{item.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      No notifications
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/60 text-[10px]">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-slate-400 font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          <Outlet />
        </main>
      </div>

      {/* Global new notifications Toast */}
      <Toast
        message={toastMessage || ''}
        isVisible={toastMessage !== null}
        onDismiss={() => setToastMessage(null)}
        type="info"
      />
    </div>
  );
}
