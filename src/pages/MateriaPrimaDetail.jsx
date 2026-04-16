import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMateriaPrimaById, getQRCode } from '../services/api';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';

export default function MateriaPrimaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materia, setMateria] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [matRes, qrRes] = await Promise.all([
          getMateriaPrimaById(id),
          getQRCode(id)
        ]);
        setMateria(matRes.data);
        setQrCode(qrRes.data.qrcode);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="loading">A carregar...</div>;
  if (!materia) return <div className="page"><p>Matéria-prima não encontrada.</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{materia.descricao}</h1>
        <div className="header-actions">
          <Link to={`/materia-prima/editar/${id}`} className="btn btn-edit">
            <FiEdit2 /> Editar
          </Link>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <FiArrowLeft /> Voltar
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Dimensões</h3>
          <div className="detail-row">
            <span>Largura:</span><strong>{materia.largura}</strong>
          </div>
          <div className="detail-row">
            <span>Comprimento:</span><strong>{materia.comprimento}</strong>
          </div>
          <div className="detail-row">
            <span>Espessura:</span><strong>{materia.espessura}</strong>
          </div>
        </div>

        <div className="detail-card">
          <h3>Stock</h3>
          <div className="detail-row">
            <span>Quantidade:</span><strong className="text-large">{materia.quantidade}</strong>
          </div>
          <div className="detail-row">
            <span>Estoque Mínimo:</span><strong>{materia.estoque_minimo}</strong>
          </div>
          <div className="detail-row">
            <span>Estoque Máximo:</span><strong>{materia.estoque_maximo}</strong>
          </div>
        </div>

        {qrCode && (
          <div className="detail-card qr-card">
            <h3>QR Code</h3>
            <img src={qrCode} alt="QR Code" className="qr-image" />
          </div>
        )}
      </div>

      {materia.movimentacoes && materia.movimentacoes.length > 0 && (
        <div className="section">
          <h2>Histórico de Movimentações</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {materia.movimentacoes.map(mov => (
                  <tr key={mov.id}>
                    <td>{new Date(mov.data).toLocaleString('pt-PT')}</td>
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
        </div>
      )}
    </div>
  );
}
