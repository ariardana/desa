
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

describe('Sidebar', () => {
  it('renders the main navigation links', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Pengumuman')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Dokumen')).toBeInTheDocument();
    expect(screen.getByText('Galeri')).toBeInTheDocument();
    expect(screen.getByText('Kontak')).toBeInTheDocument();
  });

  it('does not render the admin navigation for normal users', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
