import React, { useState } from 'react';
import { TodoList, TodoForm, Filter, Archive, ErrorBoundary, NetworkStatusIndicator } from './components';
import { TodoProvider } from './contexts';
import { useTodoContext } from './contexts';

type ViewMode = 'todos' | 'archive';

function AppContent() {
  const { filter, availableTags, setFilter } = useTodoContext();
  const [currentView, setCurrentView] = useState<ViewMode>('todos');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      {/* Responsive Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Responsive sizing */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">H</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                Hibi
              </h1>
            </div>
            
            {/* Navigation - Mobile optimized */}
            <nav className="flex space-x-0.5 sm:space-x-1 bg-slate-100 rounded-lg p-0.5 sm:p-1">
              <button
                className={`px-3 sm:px-5 py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 min-h-[44px] ${
                  currentView === 'todos'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/60 active:bg-white/80'
                }`}
                onClick={() => setCurrentView('todos')}
              >
                Tasks
              </button>
              <button
                className={`px-3 sm:px-5 py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 min-h-[44px] ${
                  currentView === 'archive'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/60 active:bg-white/80'
                }`}
                onClick={() => setCurrentView('archive')}
              >
                Archive
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Network Status Indicator */}
      <NetworkStatusIndicator className="mx-3 sm:mx-4 md:mx-6 lg:mx-8 mb-3 sm:mb-4" />

      {/* Main Content - Mobile-first responsive */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        {currentView === 'todos' ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Form Section */}
            <div>
              <TodoForm />
            </div>
            
            {/* Filter and Todo List - Responsive layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Filter Sidebar - Mobile: full width, Desktop: sidebar */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <Filter
                  filter={filter}
                  availableTags={availableTags}
                  onFilterChange={setFilter}
                />
              </div>
              
              {/* Todo List - Mobile: full width, Desktop: main content */}
              <div className="lg:col-span-3 order-1 lg:order-2">
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
    <ErrorBoundary>
      <TodoProvider>
        <AppContent />
      </TodoProvider>
    </ErrorBoundary>
  );
};