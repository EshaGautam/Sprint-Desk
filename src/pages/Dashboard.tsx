import { useAuthStore } from '../stores/authStore';

export default function Dashboard() {
  const username = useAuthStore((state) => state.username);
  const displayName = username ? username.charAt(0).toUpperCase() + username.slice(1) : 'User';

  return (
    <div className="max-w-2xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-xl p-8 transition-colors duration-200">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-wide mb-4">
        Good morning, {displayName}
      </h1>
      <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-4">
        <p>Welcome back to SprintDesk.</p>
        <p>
          Manage your sprint work from the board<br />
          and review progress in analytics.
        </p>
      </div>
    </div>
  );
}
