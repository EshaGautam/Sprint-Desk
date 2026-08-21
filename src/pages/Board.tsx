import { useEffect, useState, memo } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { useSprintTasks } from '../hooks/useSprintTasks';
import { useUsers } from '../hooks/useUsers';
import { useComments } from '../hooks/useComments';
import { useBoardStore, BOARD_COLUMNS } from '../stores/boardStore';
import { useAuthStore } from '../stores/authStore';
import { Button, Input, Select, Modal, Drawer } from '../components';
import type { Task, TaskStatus, TaskPriority, User } from '../types';

interface TaskCardProps {
  task: Task;
  users?: User[];
  onSelectTask: (id: number) => void;
}

const TaskCard = memo(function TaskCard({ task, users, onSelectTask }: TaskCardProps) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: task.id,
  });

  const setCombinedRef = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.4 : undefined,
        cursor: 'grab',
        zIndex: isDragging ? 50 : undefined,
      }
    : {
        cursor: 'grab',
      };

  const priorityColors: Record<TaskPriority, string> = {
    high: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    low: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400',
  };

  const assignee = users?.find((u) => u.id === task.assigneeId);

  const handleClick = () => {
    onSelectTask(task.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectTask(task.id);
    }
  };

  return (
    <div
      ref={setCombinedRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`bg-white border ${
        isDragging
          ? 'border-emerald-600 shadow-sm'
          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700/60'
      } dark:bg-zinc-900 rounded-lg p-4 space-y-3 transition-colors cursor-pointer select-none`}
      data-testid={`task-card-${task.id}`}
    >
      <h4 className="text-zinc-900 dark:text-zinc-100 font-medium text-sm leading-snug break-words">
        {task.title}
      </h4>

      <div className="flex flex-wrap gap-2 items-center justify-between text-xs pt-1">
        <span
          className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
            priorityColors[task.priority]
          }`}
        >
          <span>{task.priority === 'high' ? '▲' : task.priority === 'medium' ? '◆' : '▼'}</span>
          <span>{task.priority}</span>
        </span>

        {task.dueDate && (
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">
            Due {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      {assignee && (
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-250 dark:border-zinc-800/40">
          <img
            src={assignee.avatar}
            alt={assignee.name}
            className="w-5 h-5 rounded-full object-cover bg-zinc-200 dark:bg-zinc-800"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
            {assignee.name}
          </span>
        </div>
      )}
    </div>
  );
});

interface ColumnProps {
  col: { id: TaskStatus; label: string };
  tasks: Task[];
  users?: User[];
  onSelectTask: (id: number) => void;
}

const Column = memo(function Column({ col, tasks, users, onSelectTask }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: col.id,
  });

  const columnTasks = tasks
    .filter((t) => t.status === col.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-zinc-50/50 rounded-lg p-4 border border-zinc-200 dark:bg-zinc-900/20 dark:border-zinc-800/80 max-h-[80vh] overflow-hidden transition-colors"
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-205 dark:border-zinc-800/40">
        <h3 className="font-bold text-zinc-700 dark:text-zinc-200 text-xs uppercase tracking-wider">{col.label}</h3>
        <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-zinc-650 dark:text-zinc-405">
          {columnTasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {columnTasks.length > 0 ? (
          columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} users={users} onSelectTask={onSelectTask} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-600 text-xs">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
});

export default function Board() {
  const { data: serverTasks, isLoading: isLoadingTasks, isError: isErrorTasks } = useSprintTasks();
  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useUsers();
  const { data: serverComments, isLoading: isLoadingComments } = useComments();

  const tasks = useBoardStore((state) => state.tasks);
  const comments = useBoardStore((state) => state.comments);
  const initializeBoard = useBoardStore((state) => state.initializeBoard);
  const addTask = useBoardStore((state) => state.addTask);
  const moveTask = useBoardStore((state) => state.moveTask);
  const editTask = useBoardStore((state) => state.editTask);
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const addComment = useBoardStore((state) => state.addComment);

  const currentUsername = useAuthStore((state) => state.username);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('backlog');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editAssigneeId, setEditAssigneeId] = useState<number>(0);
  const [editDueDate, setEditDueDate] = useState('');

  const [newCommentMessage, setNewCommentMessage] = useState('');

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>('backlog');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newAssigneeId, setNewAssigneeId] = useState<number>(0);
  const [newDueDate, setNewDueDate] = useState('');

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  useEffect(() => {
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditDescription(selectedTask.description);
      setEditStatus(selectedTask.status);
      setEditPriority(selectedTask.priority);
      setEditAssigneeId(selectedTask.assigneeId);
      setEditDueDate(selectedTask.dueDate || '');
    }
  }, [selectedTaskId, selectedTask]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    if (serverTasks) {
      initializeBoard(serverTasks);
    }
  }, [serverTasks, initializeBoard]);

  if (isLoadingTasks || isLoadingUsers || isLoadingComments) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BOARD_COLUMNS.map((col) => (
          <div key={col.id} className="bg-slate-100/40 rounded-xl p-4 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-slate-500 dark:text-slate-300 text-sm">{col.label}</span>
              <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-3">
              <div className="h-24 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
              <div className="h-24 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    if (typeof overId === 'string' && BOARD_COLUMNS.some((col) => col.id === overId)) {
      const targetStatus = overId as TaskStatus;
      const targetColumnTasks = tasks.filter((t) => t.status === targetStatus && t.id !== activeId);
      moveTask(activeId, targetStatus, targetColumnTasks.length);
    } else if (typeof overId === 'number') {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;

      const targetStatus = overTask.status;
      const targetColumnTasks = tasks
        .filter((t) => t.status === targetStatus)
        .sort((a, b) => a.order - b.order);

      const newOrderIndex = targetColumnTasks.findIndex((t) => t.id === overId);
      if (newOrderIndex !== -1) {
        moveTask(activeId, targetStatus, newOrderIndex);
      }
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !editTitle.trim()) return;

    editTask(selectedTaskId, {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      priority: editPriority,
      assigneeId: editAssigneeId,
      dueDate: editDueDate,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !newCommentMessage.trim()) return;

    const currentUser = users?.find((u) => u.name.toLowerCase().includes(currentUsername?.toLowerCase() || ''));
    const authorId = currentUser ? currentUser.id : 1;

    addComment({
      taskId: selectedTaskId,
      message: newCommentMessage,
      authorId,
    });
    setNewCommentMessage('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      description: newDescription,
      status: newStatus,
      priority: newPriority,
      assigneeId: newAssigneeId || (users && users.length > 0 ? users[0].id : 1),
      dueDate: newDueDate,
      completedAt: null,
      sprintId: 1,
    });

    setNewTitle('');
    setNewDescription('');
    setNewStatus('backlog');
    setNewPriority('medium');
    setNewAssigneeId(0);
    setNewDueDate('');
    setIsAddTaskOpen(false);
  };

  const handleDeleteTask = () => {
    if (!selectedTaskId) return;
    deleteTask(selectedTaskId);
    setIsDeleteConfirmOpen(false);
    setSelectedTaskId(null);
  };

  const assigneeOptions = users?.map((u) => ({ value: u.id, label: u.name })) || [];
  const statusOptions = BOARD_COLUMNS.map((col) => ({ value: col.id, label: col.label }));
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const taskServerComments = serverComments?.filter((c) => c.taskId === selectedTaskId) || [];
  const taskClientComments = comments.filter((c) => c.taskId === selectedTaskId);
  const taskComments = [...taskServerComments, ...taskClientComments];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/80 rounded-lg p-4 transition-colors duration-200">
        <div>
          <h1 className="text-base font-bold text-zinc-850 dark:text-zinc-200 tracking-wide uppercase">Kanban Board</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Manage, assign, and organize sprint tasks.</p>
        </div>
        <Button onClick={() => setIsAddTaskOpen(true)} className="px-4 py-2 text-xs font-semibold">
          + Add Task
        </Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BOARD_COLUMNS.map((col) => (
            <Column key={col.id} col={col} tasks={tasks} users={users} onSelectTask={setSelectedTaskId} />
          ))}
        </div>
      </DndContext>

      <Drawer isOpen={selectedTaskId !== null} onClose={() => setSelectedTaskId(null)} title="Task Details">
        {selectedTask ? (
          <div className="space-y-6">
            <form onSubmit={handleSaveTask} className="space-y-4">
              <Input
                label="Task Title"
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
              <Input
                label="Description"
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <Select
                label="Column"
                id="edit-status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                options={statusOptions}
              />
              <Select
                label="Priority"
                id="edit-priority"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                options={priorityOptions}
              />
              <Select
                label="Assignee"
                id="edit-assignee"
                value={editAssigneeId}
                onChange={(e) => setEditAssigneeId(Number(e.target.value))}
                options={assigneeOptions}
              />
              <Input
                label="Due Date"
                id="edit-duedate"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
              <Button type="submit" className="w-full mt-2">
                Save Changes
              </Button>
            </form>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Comments ({taskComments.length})</h3>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {taskComments.length > 0 ? (
                  <>
                    {taskServerComments.map((comment) => {
                      const commentAuthor = users?.find((u) => u.id === comment.authorId);
                      return (
                        <div key={`server-${comment.id}`} className="bg-zinc-50/50 border border-zinc-205 dark:bg-zinc-950/40 dark:border-zinc-800/60 rounded-lg p-3 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                            <span>{commentAuthor ? commentAuthor.name : 'Unknown User'}</span>
                            <span>
                              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 break-words">{comment.message}</p>
                        </div>
                      );
                    })}
                    {taskClientComments.map((comment) => {
                      const commentAuthor = users?.find((u) => u.id === comment.authorId);
                      return (
                        <div key={`client-${comment.id}`} className="bg-zinc-50/50 border border-zinc-205 dark:bg-zinc-950/40 dark:border-zinc-800/60 rounded-lg p-3 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                            <span>{commentAuthor ? commentAuthor.name : 'Unknown User'}</span>
                            <span>
                              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 break-words">{comment.message}</p>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No comments posted yet.</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  id="new-comment"
                  aria-label="Write a comment"
                  value={newCommentMessage}
                  onChange={(e) => setNewCommentMessage(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1"
                />
                <Button type="submit" className="px-3 self-end h-[42px] text-xs font-semibold">
                  Post
                </Button>
              </form>
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
              <Button onClick={() => setIsDeleteConfirmOpen(true)} variant="danger" className="w-full">
                Delete Task
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} title="Create New Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            label="Task Title"
            id="new-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            placeholder="Enter task title"
          />
          <Input
            label="Description"
            id="new-description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Enter description"
          />
          <Select
            label="Column"
            id="new-status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
            options={statusOptions}
          />
          <Select
            label="Priority"
            id="new-priority"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
            options={priorityOptions}
          />
          <Select
            label="Assignee"
            id="new-assignee"
            value={newAssigneeId}
            onChange={(e) => setNewAssigneeId(Number(e.target.value))}
            options={assigneeOptions}
          />
          <Input
            label="Due Date"
            id="new-duedate"
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Task Deletion">
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Are you sure you want to delete the task <strong className="text-slate-900 dark:text-slate-100">"{selectedTask?.title}"</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteTask}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
