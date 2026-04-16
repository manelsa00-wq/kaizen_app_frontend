import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiActivity, FiCamera } from 'react-icons/fi';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', icon: <FiHome /> },
    { to: '/materia-prima', label: 'Matéria-Prima', icon: <FiPackage /> },
    { to: '/movimentacoes', label: 'Movimentações', icon: <FiActivity /> },
    { to: '/scanner', label: 'Scanner QR', icon: <FiCamera /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FiPackage size={24} />
        <span>Gestão de Stock</span>
      </div>
      <div className="navbar-links">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
