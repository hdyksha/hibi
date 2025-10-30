import React from 'react';
import './App.css';
import { TodoList, TodoForm, Filter } from './components';
import { TodoProvider } from './contexts';
import { useTodoContext } from './contexts';

function AppContent() {
  const { filter, availableTags, setFilter } = useTodoContext();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo App</h1>
      </header>
      <main className="App-main">
        <TodoForm />
        <Filter
          filter={filter}
          availableTags={availableTags}
          onFilterChange={setFilter}
        />
        <TodoList />
      </main>
    </div>
  );
}

function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
}

export default App;