import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getMateriaPrimaById, createMovimentacao } from '../services/api';
import { FiCamera, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';

export default function Scanner() {
  const [materia, setMateria] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [querReduzir, setQuerReduzir] = useState(false);
  const [message, setMessage] = useState(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    if (scanning && scannerRef.current) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      });

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          scannerInstanceRef.current = null;
          setScanning(false);

          try {
            const data = JSON.parse(decodedText);
            if (data.id) {
              const res = await getMateriaPrimaById(data.id);
              setMateria(res.data);
              setMessage(null);
            } else {
              setMessage({ type: 'error', text: 'QR Code inválido' });
            }
          } catch {
            setMessage({ type: 'error', text: 'QR Code não reconhecido. Certifica-te que é um QR Code de matéria-prima.' });
          }
        },
        (error) => {
          // Ignorar erros de leitura contínua
        }
      );

      scannerInstanceRef.current = scanner;
    }

    return () => {
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.clear();
        } catch {
          // Ignorar erro ao limpar
        }
        scannerInstanceRef.current = null;
      }
    };
  }, [scanning]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!materia || !quantidade) return;

    try {
      const res = await createMovimentacao({
        materia_prima_id: materia.id,
        quer_reduzir: querReduzir,
        quantidade: parseFloat(quantidade)
      });

      setMessage({
        type: 'success',
        text: `Movimentação registada! Stock atual: ${res.data.materia_prima.quantidade}`,
        alertas: res.data.alertas
      });
      setMateria(res.data.materia_prima);
      setQuantidade('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Erro ao registar movimentação'
      });
    }
  }

  function handleReset() {
    setMateria(null);
    setQuantidade('');
    setQuerReduzir(false);
    setMessage(null);
    setScanning(true);
  }

  return (
    <div className="page">
      <h1><FiCamera /> Scanner QR Code</h1>

      {message && (
        <div className={`message message-${message.type}`}>
          <p>{message.text}</p>
          {message.alertas?.map((a, i) => (
            <p key={i} className="alerta-text">{a}</p>
          ))}
        </div>
      )}

      {scanning ? (
        <div className="scanner-container">
          <p>Aponta a câmara para o QR Code da matéria-prima</p>
          <div id="qr-reader" ref={scannerRef}></div>
        </div>
      ) : materia ? (
        <div className="scanner-result">
          <div className="detail-card">
            <h3>{materia.descricao}</h3>
            <div className="detail-row">
              <span>Dimensões:</span>
              <strong>{materia.largura} x {materia.comprimento} x {materia.espessura}</strong>
            </div>
            <div className="detail-row">
              <span>Stock Atual:</span>
              <strong className="text-large">{materia.quantidade}</strong>
            </div>
            <div className="detail-row">
              <span>Estoque Mínimo / Máximo:</span>
              <strong>{materia.estoque_minimo} / {materia.estoque_maximo}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form scanner-form">
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${!querReduzir ? 'active active-success' : ''}`}
                onClick={() => setQuerReduzir(false)}
              >
                <FiPlus /> Entrada
              </button>
              <button
                type="button"
                className={`toggle-btn ${querReduzir ? 'active active-danger' : ''}`}
                onClick={() => setQuerReduzir(true)}
              >
                <FiMinus /> Saída
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="quantidade">Quantidade</label>
              <input
                id="quantidade"
                type="number"
                step="0.01"
                min="0.01"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                required
                placeholder="Insere a quantidade"
                autoFocus
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-large">
                <FiCheck /> Confirmar {querReduzir ? 'Saída' : 'Entrada'}
              </button>
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                Novo Scan
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="empty-state">
          <p>Nenhuma matéria-prima identificada.</p>
          <button onClick={handleReset} className="btn btn-primary">Tentar novamente</button>
        </div>
      )}
    </div>
  );
}
