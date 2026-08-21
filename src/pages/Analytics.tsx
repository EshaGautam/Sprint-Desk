import { useEffect, useMemo } from 'react';
import { useSprintTasks } from '../hooks/useSprintTasks';
import { useBoardStore } from '../stores/boardStore';
import { useThemeStore } from '../stores/themeStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export default function Analytics() {
  const { data: serverTasks, isLoading, isError } = useSprintTasks();
  const { tasks, initializeBoard, hasInitialized } = useBoardStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (serverTasks && !hasInitialized) {
      initializeBoard(serverTasks);
    }
  }, [serverTasks, initializeBoard, hasInitialized]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-slate-200 dark:bg-slate-900/60 rounded-xl animate-pulse w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[350px] bg-slate-200 dark:bg-slate-900/60 rounded-2xl animate-pulse" />
          <div className="h-[350px] bg-slate-200 dark:bg-slate-900/60 rounded-2xl animate-pulse" />
          <div className="h-[350px] bg-slate-200 dark:bg-slate-900/60 rounded-2xl animate-pulse" />
          <div className="h-[350px] bg-slate-200 dark:bg-slate-900/60 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800/60 text-red-200 rounded-xl text-sm" role="alert">
        Failed to load analytics data. Please try again.
      </div>
    );
  }

  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipLabel = isDark ? '#f1f5f9' : '#0f172a';

  const velocityData = useMemo(() => {
    const velocityMap: Record<number, number> = {};
    tasks.forEach((t) => {
      if (t.status === 'done' && t.sprintId) {
        velocityMap[t.sprintId] = (velocityMap[t.sprintId] || 0) + 1;
      }
    });

    return Object.keys(velocityMap)
      .map((sId) => ({
        name: `Sprint ${sId}`,
        completed: velocityMap[Number(sId)],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const statusData = useMemo(() => {
    const statusCounts = {
      backlog: 0,
      'in-progress': 0,
      review: 0,
      done: 0,
    };
    tasks.forEach((t) => {
      if (t.status in statusCounts) {
        statusCounts[t.status as keyof typeof statusCounts]++;
      }
    });

    return [
      { name: 'Backlog', value: statusCounts.backlog, color: '#71717a' },
      { name: 'In Progress', value: statusCounts['in-progress'], color: '#d97706' },
      { name: 'Review', value: statusCounts.review, color: '#0d9488' },
      { name: 'Done', value: statusCounts.done, color: '#059669' },
    ].filter((d) => d.value > 0);
  }, [tasks]);

  const priorityData = useMemo(() => {
    const columnsOrder = ['backlog', 'in-progress', 'review', 'done'] as const;
    return columnsOrder.map((colId) => {
      const colTasks = tasks.filter((t) => t.status === colId);
      return {
        name: colId === 'in-progress' ? 'In Progress' : colId.charAt(0).toUpperCase() + colId.slice(1),
        low: colTasks.filter((t) => t.priority === 'low').length,
        medium: colTasks.filter((t) => t.priority === 'medium').length,
        high: colTasks.filter((t) => t.priority === 'high').length,
      };
    });
  }, [tasks]);

  const trendData = useMemo(() => {
    const completedTasks = tasks
      .filter((t) => t.status === 'done' && t.completedAt)
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

    const trendMap: Record<string, number> = {};
    completedTasks.forEach((t) => {
      if (t.completedAt) {
        const dateKey = new Date(t.completedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        trendMap[dateKey] = (trendMap[dateKey] || 0) + 1;
      }
    });

    let cumulative = 0;
    return Object.keys(trendMap).map((date) => {
      cumulative += trendMap[date];
      return {
        date,
        completed: cumulative,
      };
    });
  }, [tasks]);

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-lg p-4 transition-colors duration-200">
        <h1 className="text-base font-bold text-zinc-850 dark:text-zinc-200 tracking-wide uppercase">Analytics</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Real-time metrics and progress insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-lg p-5 flex flex-col h-[350px] transition-colors duration-200">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4 tracking-wider uppercase">Sprint Velocity</h2>
          <div className="flex-1 min-h-0 w-full">
            {velocityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                  <YAxis stroke={axisStroke} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px' }}
                    labelStyle={{ color: tooltipLabel, fontWeight: '600' }}
                  />
                  <Bar dataKey="completed" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                No completed tasks found for Sprint Velocity.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-lg p-5 flex flex-col h-[350px] transition-colors duration-200">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4 tracking-wider uppercase">Task Status</h2>
          <div className="flex-1 min-h-0 w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                No tasks available for Status breakdown.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-lg p-5 flex flex-col h-[350px] transition-colors duration-200">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4 tracking-wider uppercase">Priority Breakdown</h2>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px' }}
                  labelStyle={{ color: tooltipLabel, fontWeight: '600' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="low" name="Low" stackId="a" fill="#a1a1aa" />
                <Bar dataKey="medium" name="Medium" stackId="a" fill="#d97706" />
                <Bar dataKey="high" name="High" stackId="a" fill="#e11d48" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-lg p-5 flex flex-col h-[350px] transition-colors duration-200">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-4 tracking-wider uppercase">Completion Trend</h2>
          <div className="flex-1 min-h-0 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="date" stroke={axisStroke} fontSize={11} tickLine={false} />
                  <YAxis stroke={axisStroke} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '6px' }}
                    labelStyle={{ color: tooltipLabel, fontWeight: '600' }}
                  />
                  <Line type="monotone" dataKey="completed" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                No completion date data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
