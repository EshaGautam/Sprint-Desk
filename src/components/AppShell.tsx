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

  useNotificationPolling();

  const notifications = useNotificationStore((state) => state.notifications);
  const isPanelOpen = useNotificationStore((state) => state.isPanelOpen);
  const toastMessage = useNotificationStore((state) => state.toastMessage);
  const setPanelOpen = useNotificationStore((state) => state.setPanelOpen);
  const setToastMessage = useNotificationStore((state) => state.setToastMessage);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

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
    <div className="flex h-screen bg-stone-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      <aside className="w-64 bg-zinc-50 border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 flex flex-col transition-colors duration-200">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/80">
          <span className="text-sm font-bold tracking-wider text-zinc-800 dark:text-zinc-200 uppercase">SprintDesk</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative block px-4 py-2.5 rounded-lg transition-colors text-xs font-semibold uppercase tracking-wider ${
                  isActive
                    ? 'bg-zinc-200/50 text-zinc-900 dark:bg-zinc-800/50 dark:text-white border-l-2 border-emerald-600'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 border-l-2 border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-zinc-200 transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 relative transition-colors duration-200">
          <h2 className="text-base font-bold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase">{getPageTitle()}</h2>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={togglePanel}
              className="relative p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg"
              aria-label="Notification bell"
              data-testid="notification-bell"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 h-3.5 min-w-[14px] px-1 rounded-full bg-emerald-600 text-[9px] font-bold text-white flex items-center justify-center border border-white dark:border-zinc-900"
                  data-testid="notification-badge"
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {isPanelOpen && (
              <div
                role="dialog"
                aria-label="Notification Panel"
                className="absolute right-0 top-12 w-80 bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-xl shadow-xl z-50 p-4 space-y-4 flex flex-col max-h-[450px] text-zinc-900 dark:text-zinc-100 transition-colors duration-200"
              >
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-850">
                  <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
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
                        className={`p-3 rounded-lg border text-left ${
                          item.read
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-950/20 dark:border-zinc-900 dark:text-zinc-500'
                            : 'bg-zinc-100/40 border-zinc-250 text-zinc-800 hover:bg-zinc-200/20 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-800/40'
                        } transition-colors flex items-start gap-3 cursor-pointer`}
                        data-testid={`notification-item-${item.id}`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-semibold leading-tight break-words">{item.title}</h4>
                            {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2">{item.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-zinc-400 italic">
                      No notifications
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800/80 text-[10px]">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-750 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-zinc-400 font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-750 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-stone-50 dark:bg-zinc-950 transition-colors duration-200">
          <Outlet />
        </main>
      </div>

      <Toast
        message={toastMessage || ''}
        isVisible={toastMessage !== null}
        onDismiss={() => setToastMessage(null)}
        type="info"
      />
    </div>
  );
}
