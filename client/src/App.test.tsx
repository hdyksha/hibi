import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the todo app title', () => {
    render(<App />);
    const titleElement = screen.getByText('Todo App');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the setup confirmation message', () => {
    render(<App />);
    const messageElement = screen.getByText(/React \+ TypeScript \+ Vite アプリケーションが正常に動作しています/);
    expect(messageElement).toBeInTheDocument();
  });
});