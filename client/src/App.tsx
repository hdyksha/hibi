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
    <div 
      className="min-h-screen" 
      style={{ 
        background: 'linear-gradient(to bottom right, var(--color-background), var(--color-background-secondary))' 
      }}
    >
      {/* Responsive Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-xl shadow-sm" 
        style={{ 
          backgroundColor: 'var(--color-card)', 
          borderBottom: '1px solid var(--color-border)' 
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Responsive sizing */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" 
                style={{ 
                  background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-primary-hover))' 
                }}
              >
                <span className="text-white font-bold text-xs sm:text-sm">H</span>
              </div>
              <h1 
                className="text-xl sm:text-2xl font-bold" 
                style={{ color: 'var(--color-text)' }}
              >
                Hibi
              </h1>
            </div>
            
            {/* Center Navigation and Right Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Navigation - Mobile optimized */}
              <nav 
                className="flex space-x-0.5 sm:space-x-1 rounded-lg p-0.5 sm:p-1" 
                style={{ backgroundColor: 'var(--color-background-secondary)' }}
              >
                <button
                  className="px-3 sm:px-5 py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 min-h-[44px]"
                  style={
                    currentView === 'todos'
                      ? {
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text)',
                          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                        }
                      : {
                          color: 'var(--color-text-secondary)',
                        }
                  }
                  onClick={() => handleViewChange('todos')}
                >
                  Tasks
                </button>
                <button
                  className="px-3 sm:px-5 py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 min-h-[44px]"
                  style={
                    currentView === 'archive'
                      ? {
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text)',
                          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                        }
                      : {
                          color: 'var(--color-text-secondary)',
                        }
                  }
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