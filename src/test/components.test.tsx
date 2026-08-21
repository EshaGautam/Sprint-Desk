import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button, Input, Select, Modal, Toast, DataTable, Skeleton } from '../components';

describe('Design System Components', () => {
  describe('Button', () => {
    it('renders text and handles clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const btn = screen.getByText('Click Me');
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables interactions when disabled', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const btn = screen.getByText('Disabled');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('disables interactions and displays loader when isLoading is true', () => {
      render(<Button isLoading>Action</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('associates label with input using htmlFor and id', () => {
      render(<Input label="Username" id="user-input" />);
      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'user-input');
      expect(input).toHaveAttribute('id', 'user-input');
    });

    it('displays error messages under alert role', () => {
      render(<Input error="Field required" id="err-input" />);
      const err = screen.getByRole('alert');
      expect(err).toHaveTextContent('Field required');
    });
  });

  describe('Select', () => {
    it('renders placeholder and options, and fires onChange', () => {
      const handleChange = vi.fn();
      const options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      render(
        <Select
          id="test-select"
          options={options}
          placeholder="Choose Option"
          onChange={handleChange}
          value=""
        />
      );

      expect(screen.getByText('Choose Option')).toBeDisabled();
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal', () => {
    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          Content
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders with title and calls onClose on backdrop click or Escape', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal Title">
          Modal Content
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal Title')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(handleClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('Toast', () => {
    it('renders message and calls dismiss handler', () => {
      const handleDismiss = vi.fn();
      render(
        <Toast
          message="Saved successfully"
          isVisible={true}
          onDismiss={handleDismiss}
          duration={0}
        />
      );
      expect(screen.getByText('Saved successfully')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Dismiss notification'));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('triggers dismiss automatically using timer', () => {
      vi.useFakeTimers();
      const handleDismiss = vi.fn();
      render(
        <Toast
          message="Timeout message"
          isVisible={true}
          onDismiss={handleDismiss}
          duration={3000}
        />
      );

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(handleDismiss).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe('DataTable', () => {
    interface TestRow {
      id: number;
      name: string;
    }

    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name', render: (row: TestRow) => <strong>{row.name}</strong> },
    ];

    it('renders column headers and row cells', () => {
      const data = [{ id: 101, name: 'Alice' }];
      render(<DataTable columns={columns} data={data} />);

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('Alice').tagName).toBe('STRONG');
    });

    it('renders empty message when no rows are passed', () => {
      render(<DataTable columns={columns} data={[]} emptyMessage="No Rows Found" />);
      expect(screen.getByText('No Rows Found')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renders with progressbar role and pulsing classes', () => {
      render(<Skeleton variant="circle" className="w-10 h-10" />);
      const skeleton = screen.getByRole('progressbar');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded-full');
    });
  });
});
