import './App.css';
import { TodoList } from './components';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo App</h1>
      </header>
      <main className="App-main">
        <TodoList />
      </main>
    </div>
  );
}

export default App;