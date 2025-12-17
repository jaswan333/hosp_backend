import { useNavigate } from 'react-router-dom';
import './Pages.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-icon">🏥</div>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <button className="cta-btn" onClick={() => navigate('/')}>
            Go to Home
          </button>
          <button className="cta-btn secondary" onClick={() => navigate('/appointments')}>
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;