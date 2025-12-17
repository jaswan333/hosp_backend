import { useState, useEffect } from 'react';
import { emergencyAPI } from '../api';
import './Pages.css';

const InteractiveEmergency = ({ currentUser }) => {
  const [step, setStep] = useState(1);
  const [emergencyType, setEmergencyType] = useState('');
  const [formData, setFormData] = useState({
    patientName: '', phone: '', gender: '',
    symptoms: '', priority: 'high', address: '',
    isPregnancy: false, pregnancyWeeks: '', pregnancyComplications: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [userEmergencies, setUserEmergencies] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const emergencyCategories = [
    { id: 'cardiac', icon: '❤️', title: 'Heart Emergency', desc: 'Chest pain, heart attack, cardiac arrest', color: '#dc3545' },
    { id: 'trauma', icon: '🩹', title: 'Accident/Injury', desc: 'Severe injuries, accidents, fractures', color: '#fd7e14' },
    { id: 'breathing', icon: '🫁', title: 'Breathing Issues', desc: 'Difficulty breathing, asthma attack', color: '#6f42c1' },
    { id: 'pregnancy', icon: '🤰', title: 'Pregnancy Emergency', desc: 'Pregnancy complications, labor', color: '#e83e8c' },
    { id: 'stroke', icon: '🧠', title: 'Stroke/Neurological', desc: 'Stroke symptoms, seizures', color: '#20c997' },
    { id: 'other', icon: '🚨', title: 'Other Emergency', desc: 'Poisoning, burns, severe pain', color: '#6c757d' }
  ];

  const quickSymptoms = {
    cardiac: ['Chest pain', 'Shortness of breath', 'Arm pain', 'Nausea', 'Sweating'],
    trauma: ['Severe bleeding', 'Broken bone', 'Head injury', 'Deep cut', 'Cannot move'],
    breathing: ['Cannot breathe', 'Wheezing', 'Blue lips', 'Choking', 'Severe cough'],
    pregnancy: ['Severe bleeding', 'Severe pain', 'Water broke', 'No fetal movement', 'High BP'],
    stroke: ['Face drooping', 'Arm weakness', 'Speech difficulty', 'Sudden confusion', 'Severe headache'],
    other: ['Severe burn', 'Poisoning', 'Allergic reaction', 'Unconscious', 'Severe pain']
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadUserEmergencies();
      const interval = setInterval(loadUserEmergencies, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const loadUserEmergencies = async () => {
    if (!currentUser?.id) return;
    try {
      const result = await emergencyAPI.getUserEmergencies(currentUser.id);
      setUserEmergencies(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error loading emergencies:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setEmergencyType(category.id);
    setFormData(prev => ({ 
      ...prev, 
      isPregnancy: category.id === 'pregnancy',
      priority: category.id === 'cardiac' || category.id === 'stroke' ? 'critical' : 'high'
    }));
    setStep(2);
  };

  const getCurrentLocation = () => {
    setLocationStatus('🔍 Getting your location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Use reverse geocoding to get address
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(res => res.json())
            .then(data => {
              setFormData(prev => ({
                ...prev,
                address: data.displayName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              }));
              setLocationStatus('✅ Location captured! Emergency services can find you.');
            })
            .catch(() => {
              setFormData(prev => ({
                ...prev,
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              }));
              setLocationStatus('✅ Location coordinates captured!');
            });
        },
        () => setLocationStatus('❌ Please enter your address manually')
      );
    } else {
      setLocationStatus('❌ Please enter your address manually');
    }
  };

  const handleQuickSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms ? `${prev.symptoms}, ${symptom}` : symptom
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const emergencyData = {
        patientName: formData.patientName,
        phone: formData.phone,
        gender: formData.gender,
        symptoms: formData.symptoms,
        priority: formData.priority,
        emergencyType: emergencyCategories.find(c => c.id === emergencyType)?.title || 'Emergency',
        location: { address: formData.address },
        isPregnancy: formData.isPregnancy || false,
        pregnancyWeeks: formData.pregnancyWeeks || '',
        pregnancyComplications: formData.pregnancyComplications || '',
        userId: currentUser?.id || null,
        email: currentUser?.email || 'emergency@hospital.com',
        age: 25
      };
      
      const result = await emergencyAPI.create(emergencyData);
      
      if (result && result.emergency) {
        alert('🚨 Emergency request submitted successfully! Help is on the way!');
        resetForm();
        await loadUserEmergencies();
      } else {
        alert('Failed to submit emergency request.');
      }
      
    } catch (error) {
      console.error('Emergency submission error:', error);
      alert('Error submitting emergency request.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEmergencyType('');
    setFormData({
      patientName: '', phone: '', gender: '',
      symptoms: '', priority: 'high', address: '',
      isPregnancy: false, pregnancyWeeks: '', pregnancyComplications: ''
    });
    setLocationStatus('');
  };

  return (
    <div className="interactive-emergency">
      <div className="emergency-header">
        <h1>🚨 Emergency Services</h1>
        <div className="emergency-actions">
          <a href="tel:911" className="call-911">📞 Call 911</a>
          <button 
            className="history-btn" 
            onClick={() => setShowHistory(!showHistory)}
          >
            📋 My Requests ({userEmergencies.length})
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="emergency-history">
          <div className="history-header">
            <h2>My Emergency Requests</h2>
            <button onClick={() => setShowHistory(false)} className="close-history">✕</button>
          </div>
          <div className="history-list">
            {userEmergencies.map(emergency => (
              <div key={emergency._id} className={`history-item ${emergency.status}`}>
                <div className="history-icon">
                  {emergencyCategories.find(c => c.title === emergency.emergencyType)?.icon || '🚨'}
                </div>
                <div className="history-details">
                  <h4>{emergency.emergencyType}</h4>
                  <p>{emergency.symptoms}</p>
                  <span className="history-time">{new Date(emergency.createdAt).toLocaleString()}</span>
                </div>
                <div className={`status-badge ${emergency.status}`}>
                  {emergency.status === 'pending' && '⏳ Pending'}
                  {emergency.status === 'accepted' && '🚑 En Route'}
                  {emergency.status === 'completed' && '✅ Completed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="emergency-wizard">
          {/* Step 1: Emergency Type Selection */}
          {step === 1 && (
            <div className="step-container">
              <div className="step-header">
                <h2>What type of emergency is this?</h2>
                <p>Select the category that best describes your situation</p>
              </div>
              <div className="emergency-categories">
                {emergencyCategories.map(category => (
                  <div 
                    key={category.id}
                    className="category-card"
                    onClick={() => handleCategorySelect(category)}
                    style={{ borderColor: category.color }}
                  >
                    <div className="category-icon" style={{ color: category.color }}>
                      {category.icon}
                    </div>
                    <h3>{category.title}</h3>
                    <p>{category.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Patient Info */}
          {step === 2 && (
            <div className="step-container">
              <div className="step-header">
                <h2>Patient Information</h2>
                <div className="step-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '40%' }}></div>
                  </div>
                  <span>Step 2 of 4</span>
                </div>
              </div>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Patient Name *"
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  className="form-input"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="form-input"
                >
                  <option value="">Select Gender *</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                
                {emergencyType === 'pregnancy' && (
                  <input
                    type="number"
                    placeholder="Pregnancy Weeks"
                    value={formData.pregnancyWeeks}
                    onChange={(e) => setFormData({...formData, pregnancyWeeks: e.target.value})}
                    className="form-input"
                  />
                )}
              </div>
              <div className="step-actions">
                <button onClick={() => setStep(1)} className="btn-back">← Back</button>
                <button 
                  onClick={() => setStep(3)} 
                  className="btn-next"
                  disabled={!formData.patientName || !formData.phone || !formData.gender}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Symptoms */}
          {step === 3 && (
            <div className="step-container">
              <div className="step-header">
                <h2>Describe the Emergency</h2>
                <div className="step-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '60%' }}></div>
                  </div>
                  <span>Step 3 of 4</span>
                </div>
              </div>
              
              <div className="quick-symptoms">
                <h3>Quick Select (tap to add):</h3>
                <div className="symptom-tags">
                  {quickSymptoms[emergencyType]?.map(symptom => (
                    <button
                      key={symptom}
                      className="symptom-tag"
                      onClick={() => handleQuickSymptom(symptom)}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Describe the emergency situation in detail..."
                value={formData.symptoms}
                onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                className="symptoms-textarea"
                rows="6"
              />

              <div className="priority-selector">
                <h3>Priority Level:</h3>
                <div className="priority-options">
                  {['critical', 'high', 'medium'].map(level => (
                    <label key={level} className={`priority-option ${formData.priority === level ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="priority"
                        value={level}
                        checked={formData.priority === level}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      />
                      <span className={`priority-badge ${level}`}>
                        {level === 'critical' && '🔴 Critical'}
                        {level === 'high' && '🟠 High'}
                        {level === 'medium' && '🟡 Medium'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="step-actions">
                <button onClick={() => setStep(2)} className="btn-back">← Back</button>
                <button 
                  onClick={() => setStep(4)} 
                  className="btn-next"
                  disabled={!formData.symptoms.trim()}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="step-container">
              <div className="step-header">
                <h2>Your Location</h2>
                <div className="step-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '80%' }}></div>
                  </div>
                  <span>Step 4 of 4</span>
                </div>
              </div>

              <div className="location-section">
                <button onClick={getCurrentLocation} className="location-btn">
                  📍 Get My Current Location
                </button>
                {locationStatus && (
                  <div className={`location-status ${locationStatus.includes('✅') ? 'success' : 'error'}`}>
                    {locationStatus}
                  </div>
                )}
              </div>

              <textarea
                placeholder="Enter your address or describe your location..."
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="location-textarea"
                rows="4"
              />

              <div className="step-actions">
                <button onClick={() => setStep(3)} className="btn-back">← Back</button>
                <button 
                  onClick={handleSubmit} 
                  className="btn-submit"
                  disabled={!formData.address.trim() || isSubmitting}
                >
                  {isSubmitting ? '🚨 Sending Emergency Request...' : '🚨 Send Emergency Request'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="step-container success">
              <div className="success-animation">
                <div className="success-icon">✅</div>
                <h2>Emergency Request Sent!</h2>
                <p>Help is on the way. Emergency services have been notified.</p>
              </div>
              
              <div className="success-info">
                <div className="info-card">
                  <h3>🚑 What happens next?</h3>
                  <ul>
                    <li>Emergency dispatcher will review your request</li>
                    <li>Ambulance will be dispatched to your location</li>
                    <li>You'll receive updates on arrival time</li>
                    <li>Keep your phone nearby for contact</li>
                  </ul>
                </div>
              </div>

              <div className="success-actions">
                <button onClick={resetForm} className="btn-new">New Emergency Request</button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .interactive-emergency {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .emergency-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border-radius: 15px;
        }

        .emergency-actions {
          display: flex;
          gap: 15px;
        }

        .call-911 {
          background: #fff;
          color: #ff6b6b;
          padding: 12px 20px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }

        .call-911:hover {
          transform: scale(1.05);
        }

        .history-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid white;
          padding: 10px 18px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 500;
        }

        .step-container {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .step-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .step-progress {
          margin-top: 15px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4facfe, #00f2fe);
          transition: width 0.3s ease;
        }

        .emergency-categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .category-card {
          padding: 25px;
          border: 3px solid #e9ecef;
          border-radius: 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .category-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .form-input {
          padding: 15px;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .form-input:focus {
          border-color: #4facfe;
          outline: none;
        }

        .quick-symptoms {
          margin-bottom: 25px;
        }

        .symptom-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }

        .symptom-tag {
          padding: 8px 16px;
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .symptom-tag:hover {
          background: #4facfe;
          color: white;
          border-color: #4facfe;
        }

        .symptoms-textarea, .location-textarea {
          width: 100%;
          padding: 15px;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          font-size: 16px;
          resize: vertical;
          margin-bottom: 25px;
        }

        .priority-options {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .priority-option {
          cursor: pointer;
        }

        .priority-option input {
          display: none;
        }

        .priority-badge {
          display: block;
          padding: 12px 20px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .priority-badge.critical {
          background: #ffebee;
          color: #c62828;
        }

        .priority-badge.high {
          background: #fff3e0;
          color: #ef6c00;
        }

        .priority-badge.medium {
          background: #fffde7;
          color: #f57f17;
        }

        .priority-option.selected .priority-badge {
          border-color: currentColor;
          transform: scale(1.05);
        }

        .location-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 20px;
          transition: transform 0.2s;
        }

        .location-btn:hover {
          transform: translateY(-2px);
        }

        .location-status {
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .location-status.success {
          background: #d4edda;
          color: #155724;
        }

        .location-status.error {
          background: #f8d7da;
          color: #721c24;
        }

        .step-actions {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 30px;
        }

        .btn-back, .btn-next, .btn-submit {
          padding: 15px 30px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-back {
          background: #6c757d;
          color: white;
        }

        .btn-next {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          color: white;
        }

        .btn-submit {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          flex: 1;
        }

        .btn-next:disabled, .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success {
          text-align: center;
        }

        .success-animation {
          margin-bottom: 30px;
        }

        .success-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 1s ease;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }

        .info-card {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 30px;
          text-align: left;
        }

        .info-card ul {
          list-style: none;
          padding: 0;
        }

        .info-card li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
        }

        .info-card li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #28a745;
          font-weight: bold;
        }

        .success-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .btn-new, .btn-history {
          padding: 15px 25px;
          border: 2px solid #4facfe;
          border-radius: 10px;
          background: white;
          color: #4facfe;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-new:hover, .btn-history:hover {
          background: #4facfe;
          color: white;
        }

        .emergency-history {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .close-history {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .history-item {
          display: flex;
          align-items: center;
          padding: 20px;
          border-radius: 12px;
          background: #f8f9fa;
          border-left: 4px solid #dee2e6;
        }

        .history-item.pending {
          border-left-color: #ffc107;
        }

        .history-item.accepted {
          border-left-color: #17a2b8;
        }

        .history-item.completed {
          border-left-color: #28a745;
        }

        .history-icon {
          font-size: 32px;
          margin-right: 20px;
        }

        .history-details {
          flex: 1;
        }

        .history-details h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .history-details p {
          margin: 0 0 5px 0;
          color: #666;
          font-size: 14px;
        }

        .history-time {
          font-size: 12px;
          color: #999;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.accepted {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-badge.completed {
          background: #d4edda;
          color: #155724;
        }

        @media (max-width: 768px) {
          .emergency-header {
            flex-direction: column;
            gap: 15px;
          }

          .emergency-categories {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .priority-options {
            flex-direction: column;
            align-items: center;
          }

          .step-actions {
            flex-direction: column;
          }

          .success-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveEmergency;