import React, { useState } from 'react';
import { TodoList, TodoForm, Filter, Archive, ErrorBoundary, NetworkStatusIndicator, FileSelector, ThemeSelector } from './components';
import { TodoProvider, NetworkProvider, ThemeProvider } from './contexts';
import { useTodoContext } from './contexts';

type ViewMode = 'todos' | 'archive';

function AppContent() {
  const { filter, availableTags, setFilter, refreshTodos, archive } = useTodoContext();
  const [currentView, setCurrentView] = useState<ViewMode>('todos');

  const handleFileSwitch = () => {
    // Refresh data based on current view
    if (currentView === 'todos') {
      refreshTodos();
    } else {
      archive.refreshArchive();
    }
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    // Refresh data when switching to a view to ensure it shows current file
    if (view === 'todos') {
      refreshTodos();
    } else {
      archive.refreshArchive();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary theme-transition">
      {/* Responsive Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card border-b border-border shadow-sm theme-transition">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Responsive sizing */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">H</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-text">
                Hibi
              </h1>
            </div>
            
            {/* Center Navigation and Right Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Navigation - Mobile optimized */}
              <nav className="flex space-x-0.5 sm:space-x-1 bg-background-secondary rounded-lg p-0.5 sm:p-1 theme-transition">
                <button
                  className={`px-3 sm:px-5 py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 min-h-[44px] theme-transition ${
                    currentView === 'todos'
                      ? 'bg-background text-text shadow-sm'
                      : 'text-text-secondary hover:text-text hover:bg-background/60'
                  }`}
                  onClick={() => handleViewChange('todos')}
                >
                  Tasks
                </button>
                <button
                  className={`px-3 sm:px-5 py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 min-h-[44px] theme-transition ${
                    currentView === 'archive'
                      ? 'bg-background text-text shadow-sm'
                      : 'text-text-secondary hover:text-text hover:bg-background/60'
                  }`}
                  onClick={() => handleViewChange('archive')}
                >
                  Archive
                </button>
              </nav>

              {/* File Selector */}
              <FileSelector onFileSwitch={handleFileSwitch} />
              
              {/* Theme Selector */}
              <ThemeSelector />
            </div>
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
      <ThemeProvider>
        <NetworkProvider>
          <TodoProvider>
            <AppContent />
          </TodoProvider>
        </NetworkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};