import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Board from '../pages/Board';
import { useSprintTasks } from '../hooks/useSprintTasks';
import { useUsers } from '../hooks/useUsers';
import { useComments } from '../hooks/useComments';
import { useBoardStore } from '../stores/boardStore';
import type { Task, Comment } from '../types';

vi.mock('../hooks/useSprintTasks');
vi.mock('../hooks/useUsers');
vi.mock('../hooks/useComments');

const mockTasks: Task[] = [
  { id: 1, title: 'Task One', status: 'backlog', order: 1, priority: 'high', assigneeId: 101, dueDate: '2026-08-31', sprintId: 1, description: 'Backlog Task Desc', createdAt: '', updatedAt: '', completedAt: null },
  { id: 2, title: 'Task Two', status: 'in-progress', order: 1, priority: 'medium', assigneeId: 102, dueDate: '2026-09-15', sprintId: 1, description: 'IP Task Desc', createdAt: '', updatedAt: '', completedAt: null },
];

const mockUsers = [
  { id: 101, name: 'Alice Smith', email: 'alice@example.com', avatar: 'alice.jpg' },
  { id: 102, name: 'Bob Jones', email: 'bob@example.com', avatar: 'bob.jpg' },
];

const mockComments: Comment[] = [
  { id: 1, taskId: 1, authorId: 101, message: 'First backlog comment', createdAt: '2026-08-21T09:00:00Z' },
];

describe('Kanban Board CRUD Operations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useBoardStore.getState().resetBoard();

    vi.mocked(useSprintTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useComments).mockReturnValue({
      data: mockComments,
      isLoading: false,
      isError: false,
    } as any);
  });

  it('clicking a task card opens the drawer showing details and comments', async () => {
    render(<Board />);

    const card = screen.getByText('Task One');
    fireEvent.click(card);

    expect(screen.getByRole('dialog', { name: 'Task Details' })).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title')).toHaveValue('Task One');
    expect(screen.getByLabelText('Description')).toHaveValue('Backlog Task Desc');

    expect(screen.getByText('First backlog comment')).toBeInTheDocument();
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
  });

  it('editing task details and saving updates the store and board card immediately', async () => {
    render(<Board />);

    fireEvent.click(screen.getByText('Task One'));

    const titleInput = screen.getByLabelText('Task Title');
    fireEvent.change(titleInput, { target: { value: 'Task One Edited' } });

    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.change(prioritySelect, { target: { value: 'low' } });

    const saveBtn = screen.getByText('Save Changes');
    fireEvent.click(saveBtn);

    expect(screen.getByText('Task One Edited')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();

    const storeTask = useBoardStore.getState().tasks.find((t) => t.id === 1);
    expect(storeTask?.title).toBe('Task One Edited');
    expect(storeTask?.priority).toBe('low');
  });

  it('adding a comment shows it immediately in the comments thread', async () => {
    render(<Board />);

    fireEvent.click(screen.getByText('Task One'));

    const commentInput = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(commentInput, { target: { value: 'Adding a test comment!' } });

    const postBtn = screen.getByText('Post');
    fireEvent.click(postBtn);

    expect(screen.getByText('Adding a test comment!')).toBeInTheDocument();

    const storeComments = useBoardStore.getState().comments;
    expect(storeComments).toHaveLength(1);
    expect(storeComments[0].message).toBe('Adding a test comment!');
  });

  it('adding a task adds it to the board column and updates count dynamically', async () => {
    render(<Board />);

    const backlogCol = screen.getByText('Backlog').closest('div');
    expect(backlogCol).toHaveTextContent('1');

    fireEvent.click(screen.getByText('+ Add Task'));

    fireEvent.change(screen.getByLabelText('Task Title'), { target: { value: 'Brand New Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Adding new backlog item' } });
    fireEvent.change(screen.getByLabelText('Column'), { target: { value: 'backlog' } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } });

    fireEvent.click(screen.getByText('Create Task'));

    expect(screen.getByText('Brand New Task')).toBeInTheDocument();

    expect(backlogCol).toHaveTextContent('2');

    const storeTasks = useBoardStore.getState().tasks;
    expect(storeTasks).toHaveLength(3);
    const added = storeTasks.find((t) => t.title === 'Brand New Task');
    expect(added).toBeDefined();
    expect(added?.order).toBe(2);
  });

  it('deleting a task requires confirmation, keeps it on cancel, and removes it on confirm', async () => {
    render(<Board />);

    const backlogCol = screen.getByText('Backlog').closest('div');
    expect(backlogCol).toHaveTextContent('1');

    fireEvent.click(screen.getByText('Task One'));

    fireEvent.click(screen.getByText('Delete Task'));

    expect(screen.getByRole('dialog', { name: 'Confirm Task Deletion' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByRole('dialog', { name: 'Confirm Task Deletion' })).not.toBeInTheDocument();
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(backlogCol).toHaveTextContent('1');

    fireEvent.click(screen.getByText('Delete Task'));

    fireEvent.click(screen.getByText('Confirm Delete'));

    expect(screen.queryByRole('dialog', { name: 'Confirm Task Deletion' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Task Details' })).not.toBeInTheDocument();
    expect(screen.queryByText('Task One')).not.toBeInTheDocument();
    expect(backlogCol).toHaveTextContent('0');

    expect(useBoardStore.getState().tasks.find((t) => t.id === 1)).toBeUndefined();
  });
});
