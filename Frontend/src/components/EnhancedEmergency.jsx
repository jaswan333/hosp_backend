import { useState, useEffect } from 'react';
import { emergencyAPI } from '../api';
import './Pages.css';

const EnhancedEmergency = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('emergency');
  const [formData, setFormData] = useState({
    patientName: '', email: '', phone: '', age: '', gender: '', emergencyType: '',
    symptoms: '', priority: 'medium', location: { address: '' }, isPregnancy: false,
    pregnancyWeeks: '', pregnancyComplications: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [userEmergencies, setUserEmergencies] = useState([]);

  const emergencyTypes = [
    'Heart Attack', 'Stroke', 'Severe Injury', 'Breathing Problems',
    'Severe Bleeding', 'Poisoning', 'Burns', 'Allergic Reaction',
    'Seizure', 'Unconsciousness', 'Chest Pain', 'Other'
  ];

  const pregnancyEmergencies = [
    'Severe Bleeding', 'Severe Abdominal Pain', 'High Blood Pressure',
    'Severe Headache', 'Vision Problems', 'Reduced Fetal Movement',
    'Water Breaking', 'Contractions', 'Other Pregnancy Emergency'
  ];

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'address') {
      setFormData(prev => ({ ...prev, location: { ...prev.location, address: value } }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getCurrentLocation = () => {
    setLocationStatus('Getting location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, latitude, longitude }
          }));
          setLocationStatus('✅ Location captured successfully!');
        },
        () => {
          setLocationStatus('❌ Location access denied. Please enter address manually.');
        }
      );
    } else {
      setLocationStatus('❌ Geolocation not supported. Please enter address manually.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.age || formData.age < 1) newErrors.age = 'Valid age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.emergencyType) newErrors.emergencyType = 'Emergency type is required';
    if (!formData.symptoms.trim()) newErrors.symptoms = 'Symptoms are required';
    if (!formData.location.address.trim()) newErrors.address = 'Location is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const result = await emergencyAPI.create({
          ...formData,
          userId: currentUser?.id
        });
        
        if (result.emergency) {
          alert('🚨 Emergency request submitted successfully! Help is on the way!');
          setFormData({
            patientName: '', email: '', phone: '', age: '', gender: '', emergencyType: '',
            symptoms: '', priority: 'medium', location: { address: '' }, isPregnancy: false,
            pregnancyWeeks: '', pregnancyComplications: ''
          });
          setLocationStatus('');
          await loadUserEmergencies();
        } else {
          alert('Failed to submit emergency request. Please try again.');
        }
      } catch (error) {
        alert('Error submitting emergency request. Please call emergency services directly.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="emergency-container">
      <div className="emergency-header">
        <h1>🚨 Emergency Services</h1>
        <p className="emergency-hotline">Emergency Hotline: <strong>(555) 911-HELP</strong></p>
        <div className="emergency-warning">
          ⚠️ <strong>Life-threatening emergency?</strong> Call emergency services immediately!
        </div>
      </div>

      <div className="emergency-tabs">
        <button 
          className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`} 
          onClick={() => setActiveTab('emergency')}
        >
          🚨 Emergency Request
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pregnancy' ? 'active' : ''}`} 
          onClick={() => setActiveTab('pregnancy')}
        >
          🤰 Pregnancy Emergency
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
          onClick={() => setActiveTab('history')}
        >
          📋 My Requests ({userEmergencies.length})
        </button>
      </div>

      {(activeTab === 'emergency' || activeTab === 'pregnancy') && (
        <form onSubmit={handleSubmit} className="emergency-form">
          <div className="form-section">
            <h2>Patient Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
                {errors.patientName && <span className="error-msg">{errors.patientName}</span>}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                />
                {errors.age && <span className="error-msg">{errors.age}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error-msg">{errors.gender}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>{activeTab === 'pregnancy' ? 'Pregnancy Emergency Details' : 'Emergency Details'}</h2>
            
            {activeTab === 'pregnancy' && (
              <>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isPregnancy"
                      checked={formData.isPregnancy}
                      onChange={handleChange}
                    />
                    This is a pregnancy-related emergency
                  </label>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Pregnancy Weeks</label>
                    <input
                      type="number"
                      name="pregnancyWeeks"
                      value={formData.pregnancyWeeks}
                      onChange={handleChange}
                      min="1"
                      max="42"
                      placeholder="How many weeks pregnant?"
                    />
                  </div>
                  <div className="form-group">
                    <label>Complications</label>
                    <input
                      type="text"
                      name="pregnancyComplications"
                      value={formData.pregnancyComplications}
                      onChange={handleChange}
                      placeholder="Any known complications?"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="form-group">
              <label>Emergency Type *</label>
              <select name="emergencyType" value={formData.emergencyType} onChange={handleChange} required>
                <option value="">Select Emergency Type</option>
                {(activeTab === 'pregnancy' ? pregnancyEmergencies : emergencyTypes).map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
              {errors.emergencyType && <span className="error-msg">{errors.emergencyType}</span>}
            </div>

            <div className="form-group">
              <label>Priority Level</label>
              <div className="priority-selection">
                {['low', 'medium', 'high', 'critical'].map(level => (
                  <label key={level} className="priority-option">
                    <input
                      type="radio"
                      name="priority"
                      value={level}
                      checked={formData.priority === level}
                      onChange={handleChange}
                    />
                    <span className={`priority-badge ${level}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Symptoms / Description *</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the emergency situation in detail..."
                required
              ></textarea>
              {errors.symptoms && <span className="error-msg">{errors.symptoms}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>Location Information</h2>
            <div className="location-section">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="location-btn"
              >
                📍 Get Current Location
              </button>
              {locationStatus && (
                <div className="location-status">{locationStatus}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.location.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter your current address or location details..."
                required
              ></textarea>
              {errors.address && <span className="error-msg">{errors.address}</span>}
            </div>
          </div>

          <div className="emergency-actions">
            <button
              type="submit"
              className="emergency-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '🚨 Submitting Emergency Request...' : '🚨 Submit Emergency Request'}
            </button>
            
            <div className="emergency-contact">
              <p>For immediate life-threatening emergencies:</p>
              <a href="tel:911" className="emergency-call-btn">📞 Call 911 Now</a>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'history' && (
        <div className="emergency-history">
          <h2>My Emergency Requests</h2>
          {userEmergencies.length === 0 ? (
            <p className="no-emergencies">No emergency requests found</p>
          ) : (
            <div className="emergencies-list">
              {userEmergencies.map(emergency => (
                <div key={emergency._id} className="emergency-item">
                  <div className="emergency-header">
                    <h3>{emergency.emergencyType}</h3>
                    <span className={`status-badge ${emergency.status}`}>{emergency.status}</span>
                    <span className={`priority-badge ${emergency.priority}`}>{emergency.priority}</span>
                  </div>
                  <div className="emergency-details">
                    <p><strong>Patient:</strong> {emergency.patientName}</p>
                    <p><strong>Symptoms:</strong> {emergency.symptoms}</p>
                    <p><strong>Location:</strong> {emergency.location?.address}</p>
                    <p><strong>Requested:</strong> {new Date(emergency.createdAt).toLocaleString()}</p>
                    {emergency.assignedDoctor && <p><strong>Assigned Doctor:</strong> {emergency.assignedDoctor}</p>}
                    {emergency.estimatedArrival && <p><strong>ETA:</strong> {new Date(emergency.estimatedArrival).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedEmergency;