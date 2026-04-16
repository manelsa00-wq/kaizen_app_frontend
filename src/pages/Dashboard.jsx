import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMateriaPrima, getMovimentacoes } from '../services/api';
import { FiPackage, FiAlertTriangle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function Dashboard() {
  const [materias, setMaterias] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [matRes, movRes] = await Promise.all([
          getMateriaPrima(),
          getMovimentacoes()
        ]);
        setMaterias(matRes.data);
        setMovimentacoes(movRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading">A carregar...</div>;

  const alertasEstoqueMinimo = materias.filter(m =>
    parseFloat(m.estoque_minimo) > 0 && parseFloat(m.quantidade) <= parseFloat(m.estoque_minimo)
  );

  const ultimasMovimentacoes = movimentacoes.slice(0, 10);

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <FiPackage size={32} />
          <div>
            <span className="stat-number">{materias.length}</span>
            <span className="stat-label">Matérias-Primas</span>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingUp size={32} />
          <div>
            <span className="stat-number">
              {movimentacoes.filter(m => !m.quer_reduzir).length}
            </span>
            <span className="stat-label">Entradas</span>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingDown size={32} />
          <div>
            <span className="stat-number">
              {movimentacoes.filter(m => m.quer_reduzir).length}
            </span>
            <span className="stat-label">Saídas</span>
          </div>
        </div>
        <div className={`stat-card ${alertasEstoqueMinimo.length > 0 ? 'alert' : ''}`}>
          <FiAlertTriangle size={32} />
          <div>
            <span className="stat-number">{alertasEstoqueMinimo.length}</span>
            <span className="stat-label">Alertas Stock Mín.</span>
          </div>
        </div>
      </div>

      {alertasEstoqueMinimo.length > 0 && (
        <div className="alert-section">
          <h2><FiAlertTriangle /> Alertas de Stock Mínimo</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Quantidade Atual</th>
                  <th>Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {alertasEstoqueMinimo.map(m => (
                  <tr key={m.id}>
                    <td>
                      <Link to={`/materia-prima/${m.id}`}>{m.descricao}</Link>
                    </td>
                    <td className="text-danger">{m.quantidade}</td>
                    <td>{m.estoque_minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Últimas Movimentações</h2>
        {ultimasMovimentacoes.length === 0 ? (
          <p className="empty-text">Sem movimentações registadas.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Matéria-Prima</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {ultimasMovimentacoes.map(mov => (
                  <tr key={mov.id}>
                    <td>{new Date(mov.data).toLocaleString('pt-PT')}</td>
                    <td>{mov.materiaPrima?.descricao || '-'}</td>
                    <td>
                      <span className={`badge ${mov.quer_reduzir ? 'badge-danger' : 'badge-success'}`}>
                        {mov.quer_reduzir ? 'Saída' : 'Entrada'}
                      </span>
                    </td>
                    <td>{mov.quantidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
