import { useState } from 'react';
import './Auth.css';

function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [errors, setErrors] = useState({});

  const handleSendOtp = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    if (!user) {
      setErrors({ email: 'Email not registered' });
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    alert(`OTP sent to ${email}: ${code}`);
    setStep(2);
    setErrors({});
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      setErrors({ otp: 'Invalid OTP' });
      return;
    }
    setStep(3);
    setErrors({});
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      alert('Password reset successful! Please login.');
      onNavigate('login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏥 ACE Hospital</h1>
          <h2>Reset Password</h2>
          <p>{step === 1 ? 'Enter your email' : step === 2 ? 'Verify OTP' : 'Create new password'}</p>
        </div>
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({}); }} placeholder="Enter your registered email" required />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>
            <button type="submit" className="auth-btn">Send OTP</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label>Enter OTP</label>
              <input type="text" value={otp} onChange={(e) => { setOtp(e.target.value); setErrors({}); }} placeholder="Enter 6-digit OTP" maxLength="6" required />
              {errors.otp && <span className="error-msg">{errors.otp}</span>}
            </div>
            <button type="submit" className="auth-btn">Verify OTP</button>
            <button type="button" onClick={handleSendOtp} className="resend-btn">Resend OTP</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setErrors({}); }} placeholder="Enter new password" required />
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }} placeholder="Confirm new password" required />
              {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
            </div>
            <button type="submit" className="auth-btn">Reset Password</button>
          </form>
        )}
        <div className="auth-switch">
          <p><a onClick={() => onNavigate('login')}>Back to Login</a></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
