import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { App } from './App';

// Mock the components to avoid Context API calls in App tests
vi.mock('./components', () => ({
  TodoList: () => <div data-testid="todo-list">TodoList Component</div>,
  TodoForm: () => <div data-testid="todo-form">TodoForm Component</div>,
  Filter: () => <div data-testid="filter">Filter Component</div>
}));

describe('App', () => {
  it('renders the todo app title', () => {
    render(<App />);
    const titleElement = screen.getByText('Todo App');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the TodoForm, Filter, and TodoList components', () => {
    render(<App />);
    const todoFormElement = screen.getByTestId('todo-form');
    const filterElement = screen.getByTestId('filter');
    const todoListElement = screen.getByTestId('todo-list');
    expect(todoFormElement).toBeInTheDocument();
    expect(filterElement).toBeInTheDocument();
    expect(todoListElement).toBeInTheDocument();
  });
});