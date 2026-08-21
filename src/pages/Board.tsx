import { useEffect } from 'react';
import { useSprintTasks } from '../hooks/useSprintTasks';
import { useUsers } from '../hooks/useUsers';
import { useBoardStore, BOARD_COLUMNS } from '../stores/boardStore';
import type { TaskPriority } from '../types';

export default function Board() {
  const { data: serverTasks, isLoading: isLoadingTasks, isError: isErrorTasks } = useSprintTasks();
  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useUsers();

  const { tasks, initializeBoard } = useBoardStore();

  useEffect(() => {
    if (serverTasks) {
      initializeBoard(serverTasks);
    }
  }, [serverTasks, initializeBoard]);

  if (isLoadingTasks || isLoadingUsers) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BOARD_COLUMNS.map((col) => (
          <div key={col.id} className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-slate-300 text-sm">{col.label}</span>
              <div className="w-5 h-5 rounded bg-slate-800 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-24 bg-slate-800/60 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-800/60 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isErrorTasks || isErrorUsers) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800/60 text-red-200 rounded-xl text-sm" role="alert">
        Failed to load Kanban board. Please try again.
      </div>
    );
  }

  const priorityColors: Record<TaskPriority, string> = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {BOARD_COLUMNS.map((col) => {
        const columnTasks = tasks
          .filter((t) => t.status === col.id)
          .sort((a, b) => a.order - b.order);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 max-h-[80vh] overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/40">
              <h3 className="font-semibold text-slate-200 text-sm tracking-wide">{col.label}</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-semibold text-slate-400">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => {
                  const assignee = users?.find((u) => u.id === task.assigneeId);

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-3 hover:border-slate-700/60 transition-colors"
                      data-testid={`task-card-${task.id}`}
                    >
                      <h4 className="text-slate-100 font-medium text-sm leading-snug break-words">
                        {task.title}
                      </h4>

                      <div className="flex flex-wrap gap-2 items-center justify-between text-xs pt-1">
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider ${
                            priorityColors[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>

                        {task.dueDate && (
                          <span className="text-slate-500 font-medium">
                            Due {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      {assignee && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-5 h-5 rounded-full object-cover bg-slate-800"
                          />
                          <span className="text-xs text-slate-400 font-medium truncate">
                            {assignee.name}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
