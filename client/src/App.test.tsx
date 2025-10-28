import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock the TodoList component to avoid API calls in App tests
vi.mock('./components', () => ({
  TodoList: () => <div data-testid="todo-list">TodoList Component</div>
}));

describe('App', () => {
  it('renders the todo app title', () => {
    render(<App />);
    const titleElement = screen.getByText('Todo App');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the TodoList component', () => {
    render(<App />);
    const todoListElement = screen.getByTestId('todo-list');
    expect(todoListElement).toBeInTheDocument();
  });
});