import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMateriaPrima, deleteMateriaPrima, getQRCode, createMovimentacao } from '../services/api';
import { FiPlus, FiMinus, FiEdit2, FiTrash2, FiMaximize2, FiPackage } from 'react-icons/fi';

export default function MateriaPrimaList() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [stockQtd, setStockQtd] = useState('');
  const [stockReduzir, setStockReduzir] = useState(false);
  const [stockMsg, setStockMsg] = useState(null);

  async function fetchData() {
    try {
      const res = await getMateriaPrima();
      setMaterias(res.data);
    } catch (error) {
      console.error('Erro ao carregar matérias-primas:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleDelete(id, descricao) {
    if (!window.confirm(`Tens a certeza que queres eliminar "${descricao}"?`)) return;
    try {
      await deleteMateriaPrima(id);
      fetchData();
    } catch (error) {
      alert('Erro ao eliminar: ' + (error.response?.data?.error || error.message));
    }
  }

  async function handleShowQR(id) {
    try {
      const res = await getQRCode(id);
      setQrModal(res.data);
    } catch (error) {
      alert('Erro ao gerar QR Code: ' + error.message);
    }
  }

  function openStockModal(materia) {
    setStockModal(materia);
    setStockQtd('');
    setStockReduzir(false);
    setStockMsg(null);
  }

  async function handleStockSubmit(e) {
    e.preventDefault();
    if (!stockModal || !stockQtd) return;
    try {
      const res = await createMovimentacao({
        materia_prima_id: stockModal.id,
        quer_reduzir: stockReduzir,
        quantidade: parseFloat(stockQtd)
      });
      setStockMsg({
        type: 'success',
        text: `Stock atualizado! Quantidade atual: ${res.data.materia_prima.quantidade}`,
        alertas: res.data.alertas
      });
      setStockQtd('');
      fetchData();
    } catch (err) {
      setStockMsg({
        type: 'error',
        text: err.response?.data?.error || 'Erro ao registar movimentação'
      });
    }
  }

  function getStockStatus(materia) {
    const qty = parseFloat(materia.quantidade);
    const min = parseFloat(materia.estoque_minimo);
    const max = parseFloat(materia.estoque_maximo);
    if (min > 0 && qty <= min) return 'stock-low';
    if (max > 0 && qty >= max) return 'stock-high';
    return 'stock-ok';
  }

  if (loading) return <div className="loading">A carregar...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Matéria-Prima</h1>
        <Link to="/materia-prima/nova" className="btn btn-primary">
          <FiPlus /> Nova
        </Link>
      </div>

      {materias.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma matéria-prima registada.</p>
          <Link to="/materia-prima/nova" className="btn btn-primary">
            <FiPlus /> Adicionar primeira
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Descrição</th>
                <th>Largura</th>
                <th>Comprimento</th>
                <th>Espessura</th>
                <th>Quantidade</th>
                <th>Est. Mín.</th>
                <th>Est. Máx.</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {materias.map(m => (
                <tr key={m.id} className={getStockStatus(m)}>
                  <td>{m.id}</td>
                  <td>
                    <Link to={`/materia-prima/${m.id}`}>{m.descricao}</Link>
                  </td>
                  <td>{m.largura}</td>
                  <td>{m.comprimento}</td>
                  <td>{m.espessura}</td>
                  <td><strong>{m.quantidade}</strong></td>
                  <td>{m.estoque_minimo}</td>
                  <td>{m.estoque_maximo}</td>
                  <td className="actions">
                    <button onClick={() => openStockModal(m)} className="btn btn-sm btn-stock" title="Movimentar Stock">
                      <FiPackage />
                    </button>
                    <button onClick={() => handleShowQR(m.id)} className="btn btn-sm" title="QR Code">
                      <FiMaximize2 />
                    </button>
                    <Link to={`/materia-prima/editar/${m.id}`} className="btn btn-sm btn-edit" title="Editar">
                      <FiEdit2 />
                    </Link>
                    <button onClick={() => handleDelete(m.id, m.descricao)} className="btn btn-sm btn-danger" title="Eliminar">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(null)}>
          <div className="modal modal-stock" onClick={e => e.stopPropagation()}>
            <h2>Movimentar Stock</h2>
            <p className="modal-subtitle">{stockModal.descricao}</p>
            <p className="modal-stock-info">Stock atual: <strong>{stockModal.quantidade}</strong></p>

            {stockMsg && (
              <div className={`message message-${stockMsg.type}`}>
                <p>{stockMsg.text}</p>
                {stockMsg.alertas?.map((a, i) => (
                  <p key={i} className="alerta-text">{a}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleStockSubmit}>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${!stockReduzir ? 'active active-success' : ''}`}
                  onClick={() => setStockReduzir(false)}
                >
                  <FiPlus /> Entrada
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${stockReduzir ? 'active active-danger' : ''}`}
                  onClick={() => setStockReduzir(true)}
                >
                  <FiMinus /> Saída
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="stock-qtd">Quantidade</label>
                <input
                  id="stock-qtd"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={stockQtd}
                  onChange={e => setStockQtd(e.target.value)}
                  required
                  placeholder="Insere a quantidade"
                  autoFocus
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Confirmar
                </button>
                <button type="button" onClick={() => setStockModal(null)} className="btn btn-secondary">
                  Fechar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>QR Code - {qrModal.materia.descricao}</h2>
            <img src={qrModal.qrcode} alt="QR Code" className="qr-image" />
            <p className="qr-info">
              {qrModal.materia.largura} x {qrModal.materia.comprimento} x {qrModal.materia.espessura}
            </p>
            <button onClick={() => setQrModal(null)} className="btn btn-secondary">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
