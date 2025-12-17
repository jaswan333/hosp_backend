import { useState } from 'react';
import './Auth.css';

function Login({ onLogin, onNavigate }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      const result = await onLogin(formData);
      if (!result.success) {
        setErrors({ email: result.message || 'Login failed' });
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏥 ACE Hospital</h1>
          <h2>Welcome Back</h2>
          <p>Login to manage your appointments</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>
          <div className="form-footer">
            <a onClick={() => onNavigate('forgot')} className="forgot-link">Forgot Password?</a>
          </div>
          <button type="submit" className="auth-btn">Login</button>
        </form>
        <div className="auth-switch">
          <p>Don't have an account? <a onClick={() => onNavigate('register')}>Register</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
