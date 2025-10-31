import React, { useState } from 'react';
import './App.css';
import { TodoList, TodoForm, Filter, Archive } from './components';
import { TodoProvider } from './contexts';
import { useTodoContext } from './contexts';

type ViewMode = 'todos' | 'archive';

function AppContent() {
  const { filter, availableTags, setFilter } = useTodoContext();
  const [currentView, setCurrentView] = useState<ViewMode>('todos');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo App</h1>
        <nav className="App-nav">
          <button
            className={`nav-button ${currentView === 'todos' ? 'active' : ''}`}
            onClick={() => setCurrentView('todos')}
          >
            タスク一覧
          </button>
          <button
            className={`nav-button ${currentView === 'archive' ? 'active' : ''}`}
            onClick={() => setCurrentView('archive')}
          >
            アーカイブ
          </button>
        </nav>
      </header>
      <main className="App-main">
        {currentView === 'todos' ? (
          <>
            <TodoForm />
            <Filter
              filter={filter}
              availableTags={availableTags}
              onFilterChange={setFilter}
            />
            <TodoList />
          </>
        ) : (
          <Archive />
        )}
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