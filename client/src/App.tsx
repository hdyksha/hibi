import './App.css';
import { TodoList, TodoForm } from './components';
import { TodoProvider } from './contexts';

function App() {
  return (
    <TodoProvider>
      <div className="App">
        <header className="App-header">
          <h1>Todo App</h1>
        </header>
        <main className="App-main">
          <TodoForm />
          <TodoList />
        </main>
      </div>
    </TodoProvider>
  );
}

export default App;