import { useState } from 'react';
import './Auth.css';

const ADMIN_CREDENTIALS = [
  { username: 'surya', password: 'surya@123', name: 'Surya', role: 'Chief Administrator' },
  { username: 'jaswan', password: 'jaswan333', name: 'Jaswan', role: 'System Administrator' }
];

function AdminLogin({ onAdminLogin, onBack }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const admin = ADMIN_CREDENTIALS.find(
      a => a.username === credentials.username && a.password === credentials.password
    );
    
    if (admin) {
      onAdminLogin(admin);
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🛠️ Admin Login</h1>
          <h2>ACE Hospital Admin Panel</h2>
          <p>Enter your admin credentials</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={credentials.username} 
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Enter admin username" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={credentials.password} 
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter admin password" 
              required 
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="auth-btn">Login as Admin</button>
        </form>
        <div className="auth-switch">
          <p><a onClick={onBack}>← Back to Main Site</a></p>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;