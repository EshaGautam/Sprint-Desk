export default function FullScreenLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <span className="text-lg font-medium">Loading...</span>
    </div>
  );
}
