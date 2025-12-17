import React, { useState, useEffect } from 'react';
import './Pages.css';

function Emergency({ onEmergencyBooking }) {
  const [emergencyForm, setEmergencyForm] = useState({
    patientName: '', phone: '', emergencyType: '', symptoms: '', priority: 'high',
    location: { latitude: null, longitude: null, address: '' }
  });
  const [locationStatus, setLocationStatus] = useState('Getting location...');
  const [availableDoctors, setAvailableDoctors] = useState([
    { id: 1, name: 'Dr. Emergency Smith', specialty: 'Emergency Medicine', status: 'Available' },
    { id: 2, name: 'Dr. Trauma Johnson', specialty: 'Trauma Surgery', status: 'Available' },
    { id: 3, name: 'Dr. Critical Care', specialty: 'Critical Care', status: 'Busy' }
  ]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setEmergencyForm(prev => ({
            ...prev,
            location: { ...prev.location, latitude, longitude }
          }));
          setLocationStatus(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => setLocationStatus('Location access denied')
      );
    }
  }, []);

  const handleEmergencySubmit = (e) => {
    e.preventDefault();
    const emergencyData = {
      ...emergencyForm,
      isEmergency: true,
      department: 'Emergency Care',
      appointmentDate: new Date(),
      appointmentTime: new Date().toLocaleTimeString(),
      bedType: 'Emergency',
      slot: 'Emergency',
      age: 0,
      gender: 'Not specified',
      email: 'emergency@hospital.com'
    };
    onEmergencyBooking && onEmergencyBooking(emergencyData);
    alert('Emergency request submitted! Ambulance dispatched.');
  };

  const emergencyServices = [
    { icon: '🚑', title: 'Ambulance Service', desc: '24/7 emergency ambulance with GPS tracking', phone: '(555) 911-HELP' },
    { icon: '❤️', title: 'Cardiac Emergency', desc: 'Immediate cardiac care and intervention', available: 'Always Available' },
    { icon: '🧠', title: 'Stroke Unit', desc: 'Rapid stroke assessment and treatment', response: '< 15 mins' },
    { icon: '🩹', title: 'Trauma Care', desc: 'Advanced trauma and accident management', beds: '20 Available' },
    { icon: '🔥', title: 'Burn Unit', desc: 'Specialized burn treatment facility', beds: '8 Available' },
    { icon: '🤰', title: 'Maternity Emergency', desc: 'Emergency obstetric care', beds: '12 Available' }
  ];

  return (
    <div className="page-container">
      <div className="emergency-banner">
        <h1>🚨 Emergency Services</h1>
        <p>24/7 Emergency Care - Always Here When You Need Us</p>
        <div className="location-status">{locationStatus}</div>
      </div>
      
      <div className="emergency-booking">
        <h2>🚑 Emergency Booking</h2>
        <form onSubmit={handleEmergencySubmit} className="emergency-form">
          <input
            type="text"
            placeholder="Patient Name"
            value={emergencyForm.patientName}
            onChange={(e) => setEmergencyForm({...emergencyForm, patientName: e.target.value})}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={emergencyForm.phone}
            onChange={(e) => setEmergencyForm({...emergencyForm, phone: e.target.value})}
            required
          />
          <select
            value={emergencyForm.emergencyType}
            onChange={(e) => setEmergencyForm({...emergencyForm, emergencyType: e.target.value})}
            required
          >
            <option value="">Select Emergency Type</option>
            <option value="cardiac">Cardiac Emergency</option>
            <option value="trauma">Trauma/Accident</option>
            <option value="stroke">Stroke</option>
            <option value="breathing">Breathing Difficulty</option>
            <option value="pregnancy">Pregnancy Emergency</option>
            <option value="other">Other Emergency</option>
          </select>
          <select
            value={emergencyForm.priority}
            onChange={(e) => setEmergencyForm({...emergencyForm, priority: e.target.value})}
          >
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
          </select>
          <textarea
            placeholder="Describe the emergency situation"
            value={emergencyForm.symptoms}
            onChange={(e) => setEmergencyForm({...emergencyForm, symptoms: e.target.value})}
            required
          />
          <button type="submit" className="emergency-submit-btn">🚨 Request Emergency Help</button>
        </form>
      </div>

      <div className="available-doctors">
        <h2>👨‍⚕️ Available Emergency Doctors</h2>
        <div className="doctors-list">
          {availableDoctors.map(doctor => (
            <div key={doctor.id} className={`doctor-status ${doctor.status.toLowerCase()}`}>
              <span>{doctor.name} - {doctor.specialty}</span>
              <span className={`status-badge ${doctor.status.toLowerCase()}`}>{doctor.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="emergency-grid">
        {emergencyServices.map((service, i) => (
          <div key={i} className="emergency-card">
            <div className="emergency-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
            {service.phone && <div className="emergency-info">📞 {service.phone}</div>}
            {service.available && <div className="emergency-info">✅ {service.available}</div>}
            {service.response && <div className="emergency-info">⏱️ Response: {service.response}</div>}
            {service.beds && <div className="emergency-info">🛏️ {service.beds}</div>}
          </div>
        ))}
      </div>

      <div className="emergency-instructions">
        <h2>When to Visit Emergency</h2>
        <div className="instruction-grid">
          <div className="instruction-item">
            <h3>🚨 Immediate Emergency</h3>
            <ul>
              <li>Chest pain or pressure</li>
              <li>Difficulty breathing</li>
              <li>Severe bleeding</li>
              <li>Loss of consciousness</li>
              <li>Severe burns</li>
            </ul>
          </div>
          <div className="instruction-item">
            <h3>⚠️ Urgent Care</h3>
            <ul>
              <li>High fever (&gt;103°F)</li>
              <li>Severe pain</li>
              <li>Deep cuts</li>
              <li>Broken bones</li>
              <li>Severe allergic reactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Emergency;