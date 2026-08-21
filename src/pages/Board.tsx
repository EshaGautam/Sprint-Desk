import { useEffect, useState } from 'react';
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
  onClick: () => void;
}

function TaskCard({ task, users, onClick }: TaskCardProps) {
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
    high: 'bg-red-500/10 text-red-600 border-red-500/25 dark:text-red-400 dark:border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400 dark:border-amber-500/20',
    low: 'bg-slate-500/10 text-slate-600 border-slate-500/25 dark:text-slate-400 dark:border-slate-500/20',
  };

  const assignee = users?.find((u) => u.id === task.assigneeId);

  return (
    <div
      ref={setCombinedRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`bg-white border ${
        isDragging
          ? 'border-indigo-500 shadow-xl'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800/60 dark:hover:border-slate-700/60'
      } dark:bg-slate-900 rounded-xl p-4 space-y-3 transition-colors cursor-pointer select-none`}
      data-testid={`task-card-${task.id}`}
    >
      <h4 className="text-slate-900 dark:text-slate-100 font-medium text-sm leading-snug break-words">
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
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Due {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      {assignee && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/40">
          <img
            src={assignee.avatar}
            alt={assignee.name}
            className="w-5 h-5 rounded-full object-cover bg-slate-200 dark:bg-slate-800"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {assignee.name}
          </span>
        </div>
      )}
    </div>
  );
}

interface ColumnProps {
  col: { id: TaskStatus; label: string };
  tasks: Task[];
  users?: User[];
  onSelectTask: (id: number) => void;
}

function Column({ col, tasks, users, onSelectTask }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: col.id,
  });

  const columnTasks = tasks
    .filter((t) => t.status === col.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-slate-100/40 rounded-xl p-4 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 max-h-[80vh] overflow-hidden transition-colors"
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800/40">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-wide">{col.label}</h3>
        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {columnTasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {columnTasks.length > 0 ? (
          columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} users={users} onClick={() => onSelectTask(task.id)} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-600 text-xs">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

export default function Board() {
  const { data: serverTasks, isLoading: isLoadingTasks, isError: isErrorTasks } = useSprintTasks();
  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useUsers();
  const { data: serverComments, isLoading: isLoadingComments } = useComments();

  const { tasks, comments, initializeBoard, addTask, moveTask, editTask, deleteTask, addComment } = useBoardStore();
  const currentUsername = useAuthStore((state) => state.username);

  // Selected task state for details drawer
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Form states for editing
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('backlog');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editAssigneeId, setEditAssigneeId] = useState<number>(0);
  const [editDueDate, setEditDueDate] = useState('');

  // Comment input state
  const [newCommentMessage, setNewCommentMessage] = useState('');

  // Add Task Modal state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>('backlog');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newAssigneeId, setNewAssigneeId] = useState<number>(0);
  const [newDueDate, setNewDueDate] = useState('');

  // Delete Confirm Modal state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Populate edit fields when task selection changes
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
      {/* Top Header Control bar */}
      <div className="flex justify-between items-center bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800/85 rounded-2xl p-4 transition-colors duration-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">Kanban Board</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage, assign, and organize sprint tasks.</p>
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

      {/* Task Details Side Drawer */}
      <Drawer isOpen={selectedTaskId !== null} onClose={() => setSelectedTaskId(null)} title="Task Details">
        {selectedTask ? (
          <div className="space-y-6">
            {/* Edit Fields Form */}
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

            {/* Comments Area */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Comments ({taskComments.length})</h3>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {taskComments.length > 0 ? (
                  <>
                    {taskServerComments.map((comment) => {
                      const commentAuthor = users?.find((u) => u.id === comment.authorId);
                      return (
                        <div key={`server-${comment.id}`} className="bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/60 rounded-xl p-3 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
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
                          <p className="text-xs text-slate-700 dark:text-slate-300 break-words">{comment.message}</p>
                        </div>
                      );
                    })}
                    {taskClientComments.map((comment) => {
                      const commentAuthor = users?.find((u) => u.id === comment.authorId);
                      return (
                        <div key={`client-${comment.id}`} className="bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/60 rounded-xl p-3 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
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
                          <p className="text-xs text-slate-700 dark:text-slate-300 break-words">{comment.message}</p>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No comments posted yet.</p>
                )}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  id="new-comment"
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

            {/* Delete Block */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <Button onClick={() => setIsDeleteConfirmOpen(true)} variant="danger" className="w-full">
                Delete Task
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Create Task Modal */}
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

      {/* Delete Confirmation Modal */}
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
