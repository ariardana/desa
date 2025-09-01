
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, logout: vi.fn() }),
}));

vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

describe('Header', () => {
  it('renders the header with the brand name', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('Sistem Informasi Desa')).toBeInTheDocument();
  });
});
