import { useState, useEffect } from 'react';
import { getMovimentacoes, getMateriaPrima } from '../services/api';
import { FiFilter, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    materia_prima_id: '',
    data_inicio: '',
    data_fim: ''
  });

  async function fetchData(filterParams) {
    setLoading(true);
    try {
      const params = {};
      if (filterParams?.materia_prima_id) params.materia_prima_id = filterParams.materia_prima_id;
      if (filterParams?.data_inicio) params.data_inicio = filterParams.data_inicio;
      if (filterParams?.data_fim) params.data_fim = filterParams.data_fim;

      const [movRes, matRes] = await Promise.all([
        getMovimentacoes(params),
        getMateriaPrima()
      ]);
      setMovimentacoes(movRes.data);
      setMaterias(matRes.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  function handleFilter(e) {
    e.preventDefault();
    fetchData(filters);
  }

  function handleClearFilters() {
    setFilters({ materia_prima_id: '', data_inicio: '', data_fim: '' });
    fetchData({});
  }

  const totalEntradas = movimentacoes
    .filter(m => !m.quer_reduzir)
    .reduce((sum, m) => sum + parseFloat(m.quantidade), 0);
  const totalSaidas = movimentacoes
    .filter(m => m.quer_reduzir)
    .reduce((sum, m) => sum + parseFloat(m.quantidade), 0);

  return (
    <div className="page">
      <h1>Movimentações de Stock</h1>

      <form onSubmit={handleFilter} className="filter-bar">
        <div className="filter-group">
          <label>Matéria-Prima</label>
          <select
            value={filters.materia_prima_id}
            onChange={e => setFilters({ ...filters, materia_prima_id: e.target.value })}
          >
            <option value="">Todas</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>{m.descricao}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Data Início</label>
          <input
            type="date"
            value={filters.data_inicio}
            onChange={e => setFilters({ ...filters, data_inicio: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Data Fim</label>
          <input
            type="date"
            value={filters.data_fim}
            onChange={e => setFilters({ ...filters, data_fim: e.target.value })}
          />
        </div>
        <div className="filter-actions">
          <button type="submit" className="btn btn-primary"><FiFilter /> Filtrar</button>
          <button type="button" onClick={handleClearFilters} className="btn btn-secondary">Limpar</button>
        </div>
      </form>

      <div className="stats-grid stats-small">
        <div className="stat-card">
          <FiTrendingUp />
          <div>
            <span className="stat-number">{totalEntradas.toFixed(2)}</span>
            <span className="stat-label">Total Entradas</span>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingDown />
          <div>
            <span className="stat-number">{totalSaidas.toFixed(2)}</span>
            <span className="stat-label">Total Saídas</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">A carregar...</div>
      ) : movimentacoes.length === 0 ? (
        <p className="empty-text">Sem movimentações para os filtros selecionados.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Matéria-Prima</th>
                <th>Tipo</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map(mov => (
                <tr key={mov.id}>
                  <td>{mov.id}</td>
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
  );
}
