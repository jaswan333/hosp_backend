import { useState } from 'react';
import './Auth.css';
import { authAPI } from '../api';

function Register({ onNavigate }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (formData.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!/^[0-9]{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) newErrors.phone = 'Valid 10-digit phone required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      try {
        const result = await authAPI.register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        if (result.user) {
          alert('Registration successful! Please login.');
          onNavigate('login');
        } else {
          setErrors({ email: result.message || 'Registration failed' });
        }
      } catch (error) {
        setErrors({ email: 'Network error. Please try again.' });
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
          <h2>Create Account</h2>
          <p>Join us for better healthcare</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
            {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
          </div>
          <button type="submit" className="auth-btn">Register</button>
        </form>
        <div className="auth-switch">
          <p>Already have an account? <a onClick={() => onNavigate('login')}>Login</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
