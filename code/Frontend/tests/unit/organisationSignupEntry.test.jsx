import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import SignUpPage from '../../src/pages/SignUp/SignUpPage';
import LandingPage from '../../src/pages/Landing/LandingPage';

afterEach(cleanup);

function renderSignup(entry) {
  return render(<MemoryRouter initialEntries={[entry]}><SignUpPage /></MemoryRouter>);
}

describe('current organisation signup entry', () => {
  it('opens organisation details from the landing-page call to action', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('link', { name: /Get your organisation started/i }));
    expect(screen.getByRole('heading', { name: 'Basic information' })).toBeInTheDocument();
    expect(screen.getByText('Organisation name')).toBeInTheDocument();
    expect(screen.queryByText('First name')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('keeps the normal and unknown-type entry at account selection', () => {
    const normal = renderSignup('/signup');
    expect(screen.getByRole('heading', { name: 'Choose your account type' })).toBeInTheDocument();
    normal.unmount();
    renderSignup('/signup?type=unknown');
    expect(screen.getByRole('heading', { name: 'Choose your account type' })).toBeInTheDocument();
  });

  it('lets an organisation visitor go back and choose an individual account', () => {
    renderSignup('/signup?type=org');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByText('Individual'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('First name')).toBeInTheDocument();
    expect(screen.queryByText('Organisation name')).not.toBeInTheDocument();
  });
});
