import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { describe, it, expect } from 'vitest';

describe('Routing Integration', () => {
  it('renders loading fallback and redirects to /dashboard', async () => {
    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Welcome to the SprintDesk dashboard placeholder.')).toBeInTheDocument();
    });
  });
});
