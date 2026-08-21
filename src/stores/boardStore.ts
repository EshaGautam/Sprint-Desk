import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus, Comment } from '../types';

export const BOARD_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

interface BoardState {
  tasks: Task[];
  comments: Comment[];
  hasInitialized: boolean;
  initializeBoard: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  moveTask: (taskId: number, targetStatus: TaskStatus, newOrder: number) => void;
  editTask: (taskId: number, updatedFields: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (taskId: number) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  resetBoard: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: [],
      comments: [],
      hasInitialized: false,

      initializeBoard: (initialTasks) => {
        if (!get().hasInitialized) {
          set({
            tasks: initialTasks.slice(0, 30),
            hasInitialized: true,
          });
        }
      },

      addTask: (taskInput) => {
        const tasks = get().tasks;
        const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
        const now = new Date().toISOString();

        const targetColCount = tasks.filter((t) => t.status === taskInput.status).length;

        const newTask: Task = {
          ...taskInput,
          id: newId,
          order: targetColCount + 1,
          createdAt: now,
          updatedAt: now,
        };

        set({ tasks: [...tasks, newTask] });
      },

      moveTask: (taskId, targetStatus, newOrder) => {
        const tasks = get().tasks;
        const taskToMove = tasks.find((t) => t.id === taskId);
        if (!taskToMove) return;

        const oldStatus = taskToMove.status;

        const targetColumnTasks = tasks
          .filter((t) => t.status === targetStatus && t.id !== taskId)
          .sort((a, b) => a.order - b.order);

        targetColumnTasks.splice(newOrder, 0, {
          ...taskToMove,
          status: targetStatus,
          updatedAt: new Date().toISOString(),
        });

        const updatedTargetTasks = targetColumnTasks.map((t, idx) => ({
          ...t,
          order: idx + 1,
        }));

        let updatedSourceTasks: Task[] = [];
        if (oldStatus !== targetStatus) {
          const sourceColumnTasks = tasks
            .filter((t) => t.status === oldStatus && t.id !== taskId)
            .sort((a, b) => a.order - b.order);

          updatedSourceTasks = sourceColumnTasks.map((t, idx) => ({
            ...t,
            order: idx + 1,
          }));
        }

        const updatedTasks = tasks.map((t) => {
          const updatedTarget = updatedTargetTasks.find((ut) => ut.id === t.id);
          if (updatedTarget) return updatedTarget;

          if (oldStatus !== targetStatus) {
            const updatedSource = updatedSourceTasks.find((us) => us.id === t.id);
            if (updatedSource) return updatedSource;
          }

          return t;
        });

        set({ tasks: updatedTasks });
      },

      editTask: (taskId, updatedFields) => {
        const tasks = get().tasks;
        const updatedTasks = tasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              ...updatedFields,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        });
        set({ tasks: updatedTasks });
      },

      deleteTask: (taskId) => {
        const tasks = get().tasks;
        const taskToDelete = tasks.find((t) => t.id === taskId);
        if (!taskToDelete) return;

        const columnTasks = tasks
          .filter((t) => t.status === taskToDelete.status && t.id !== taskId)
          .sort((a, b) => a.order - b.order);

        const reIndexedTasks = columnTasks.map((t, idx) => ({
          ...t,
          order: idx + 1,
        }));

        const updatedTasks = tasks
          .filter((t) => t.id !== taskId)
          .map((t) => {
            const updated = reIndexedTasks.find((rit) => rit.id === t.id);
            return updated ? updated : t;
          });

        set({ tasks: updatedTasks });
      },

      addComment: (commentInput) => {
        const comments = get().comments;
        const newId = comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1;
        const now = new Date().toISOString();

        const newComment: Comment = {
          ...commentInput,
          id: newId,
          createdAt: now,
        };

        set({ comments: [...comments, newComment] });
      },

      resetBoard: () => {
        set({
          tasks: [],
          comments: [],
          hasInitialized: false,
        });
      },
    }),
    {
      name: 'board-store',
      partialize: (state) => ({
        tasks: state.tasks,
        comments: state.comments,
        hasInitialized: state.hasInitialized,
      }),
    }
  )
);
