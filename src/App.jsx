import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MateriaPrimaList from './pages/MateriaPrimaList';
import MateriaPrimaForm from './pages/MateriaPrimaForm';
import MateriaPrimaDetail from './pages/MateriaPrimaDetail';
import Movimentacoes from './pages/Movimentacoes';
import Scanner from './pages/Scanner';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/materia-prima" element={<MateriaPrimaList />} />
            <Route path="/materia-prima/nova" element={<MateriaPrimaForm />} />
            <Route path="/materia-prima/editar/:id" element={<MateriaPrimaForm />} />
            <Route path="/materia-prima/:id" element={<MateriaPrimaDetail />} />
            <Route path="/movimentacoes" element={<Movimentacoes />} />
            <Route path="/scanner" element={<Scanner />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
