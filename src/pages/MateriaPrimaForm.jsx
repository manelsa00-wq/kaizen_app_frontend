import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMateriaPrima, getMateriaPrimaById, updateMateriaPrima } from '../services/api';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

export default function MateriaPrimaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    descricao: '',
    largura: '',
    comprimento: '',
    espessura: '',
    quantidade: '0',
    estoque_minimo: '0',
    estoque_maximo: '0'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      getMateriaPrimaById(id)
        .then(res => {
          const m = res.data;
          setForm({
            descricao: m.descricao,
            largura: m.largura,
            comprimento: m.comprimento,
            espessura: m.espessura,
            quantidade: m.quantidade,
            estoque_minimo: m.estoque_minimo,
            estoque_maximo: m.estoque_maximo
          });
        })
        .catch(() => {
          setError('Matéria-prima não encontrada');
        });
    }
  }, [id, isEditing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await updateMateriaPrima(id, form);
      } else {
        await createMateriaPrima(form);
      }
      navigate('/materia-prima');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEditing ? 'Editar' : 'Nova'} Matéria-Prima</h1>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          <FiArrowLeft /> Voltar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="descricao">Descrição *</label>
          <input
            id="descricao"
            name="descricao"
            type="text"
            value={form.descricao}
            onChange={handleChange}
            required
            placeholder="Ex: Chapa de Aço"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="largura">Largura *</label>
            <input
              id="largura"
              name="largura"
              type="number"
              step="0.01"
              value={form.largura}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label htmlFor="comprimento">Comprimento *</label>
            <input
              id="comprimento"
              name="comprimento"
              type="number"
              step="0.01"
              value={form.comprimento}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label htmlFor="espessura">Espessura *</label>
            <input
              id="espessura"
              name="espessura"
              type="number"
              step="0.01"
              value={form.espessura}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantidade">Quantidade Inicial</label>
            <input
              id="quantidade"
              name="quantidade"
              type="number"
              step="0.01"
              value={form.quantidade}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="estoque_minimo">Estoque Mínimo</label>
            <input
              id="estoque_minimo"
              name="estoque_minimo"
              type="number"
              step="0.01"
              value={form.estoque_minimo}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="estoque_maximo">Estoque Máximo</label>
            <input
              id="estoque_maximo"
              name="estoque_maximo"
              type="number"
              step="0.01"
              value={form.estoque_maximo}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          <FiSave /> {loading ? 'A guardar...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
