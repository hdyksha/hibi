import React, { useState } from 'react';
import { TodoList, TodoForm, Filter, Archive } from './components';
import { TodoProvider } from './contexts';
import { useTodoContext } from './contexts';

type ViewMode = 'todos' | 'archive';

function AppContent() {
  const { filter, availableTags, setFilter } = useTodoContext();
  const [currentView, setCurrentView] = useState<ViewMode>('todos');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      {/* Sophisticated Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Hibi
              </h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-1 bg-slate-100 rounded-lg p-1">
              <button
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                  currentView === 'todos'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                }`}
                onClick={() => setCurrentView('todos')}
              >
                Tasks
              </button>
              <button
                className={`px-5 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                  currentView === 'archive'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                }`}
                onClick={() => setCurrentView('archive')}
              >
                Archive
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentView === 'todos' ? (
          <div className="space-y-3">
            {/* Form Section */}
            <div>
              <TodoForm />
            </div>
            
            {/* Filter and Todo List */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Filter Sidebar */}
              <div className="lg:col-span-1">
                <Filter
                  filter={filter}
                  availableTags={availableTags}
                  onFilterChange={setFilter}
                />
              </div>
              
              {/* Todo List */}
              <div className="lg:col-span-3">
                <TodoList />
              </div>
            </div>
          </div>
        ) : (
          <Archive />
        )}
      </main>
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
};