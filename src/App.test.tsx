import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders start session button', () => {
  render(<App />);
  const button = screen.getByText(/start session/i);
  expect(button).toBeInTheDocument();
});
