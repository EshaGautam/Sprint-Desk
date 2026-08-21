import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
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
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <span className="text-lg font-bold tracking-wide">SprintDesk</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 relative">
          <h2 className="text-xl font-bold tracking-wide">{getPageTitle()}</h2>

          <div className="flex items-center gap-4 relative">
            {/* Notification Bell */}
            <button
              onClick={togglePanel}
              className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
              aria-label="Notification bell"
              data-testid="notification-bell"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-slate-900"
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
                className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-4 flex flex-col max-h-[450px]"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
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
                        onClick={() => markAsRead(item.id)}
                        className={`p-3 rounded-xl border ${
                          item.read
                            ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-100 cursor-pointer hover:bg-slate-800/40'
                        } transition-colors flex items-start gap-3`}
                        data-testid={`notification-item-${item.id}`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-semibold leading-tight break-words">{item.title}</h4>
                            {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{item.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500 italic">
                      No notifications
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[10px]">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-slate-500 font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
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
