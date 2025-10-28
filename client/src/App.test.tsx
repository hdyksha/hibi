import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

// Mock the components to avoid Context API calls in App tests
vi.mock('./components', () => ({
  TodoList: () => <div data-testid="todo-list">TodoList Component</div>,
  TodoForm: () => <div data-testid="todo-form">TodoForm Component</div>
}));

describe('App', () => {
  it('renders the todo app title', () => {
    render(<App />);
    const titleElement = screen.getByText('Todo App');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the TodoForm and TodoList components', () => {
    render(<App />);
    const todoFormElement = screen.getByTestId('todo-form');
    const todoListElement = screen.getByTestId('todo-list');
    expect(todoFormElement).toBeInTheDocument();
    expect(todoListElement).toBeInTheDocument();
  });
});