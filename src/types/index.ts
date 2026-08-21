export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface Sprint {
  id: number;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: string; // YYYY-MM-DD
  sprintId: number;
  order: number;
  createdAt: string; // ISO DateTime
  completedAt: string | null; // ISO DateTime or null
  updatedAt: string; // ISO DateTime
}

export interface Comment {
  id: number;
  taskId: number;
  authorId: number;
  message: string;
  createdAt: string; // ISO DateTime
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string; // e.g. "task", "review"
  read: boolean;
  createdAt: string; // ISO DateTime
}

export interface MockData {
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
}
