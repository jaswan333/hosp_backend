import { useState, useEffect } from 'react';
import { appointmentAPI } from '../api';
import './Pages.css';
import './AppointmentStyles.css';

const UnifiedAppointments = ({ currentUser, formData, setFormData, errors, setErrors, handleFormChange, validateForm, availableSlots, availableBeds, services, defaultTab = 'book' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const result = await appointmentAPI.getUserAppointments(currentUser.id);
      setAppointments(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadAppointments();
      const interval = setInterval(loadAppointments, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        
        // Create user record if not authenticated or if different from current user
        let userId = currentUser?.id;
        if (!currentUser?.id || formData.email !== currentUser?.email) {
          try {
            const userResponse = await fetch('http://localhost:3002/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: formData.patientName,
                email: formData.email,
                phone: formData.phone,
                role: 'patient'
              })
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              userId = userData._id;
            }
          } catch (userError) {
            console.log('User creation failed, proceeding with appointment');
          }
        }
        
        const result = await appointmentAPI.create({
          ...formData,
          userId: userId,
          status: 'current',
          consultationFee: 1500
        });
        
        if (result.appointment) {
          await loadAppointments();
          alert('Appointment Booked Successfully!');
          setFormData({ patientName: '', email: '', phone: '', age: '', gender: '', department: '', appointmentDate: '', appointmentTime: '', symptoms: '', bedType: '', slot: '' });
          setActiveTab('current');
        }
      } catch (error) {
        alert('Error booking appointment. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handlePayment = async (id) => {
    try {
      await appointmentAPI.update(id, { paid: true });
      await loadAppointments();
      alert('Payment successful!');
    } catch (error) {
      alert('Error processing payment');
    }
  };

  const completeAppointment = async (id) => {
    try {
      await appointmentAPI.update(id, { status: 'completed' });
      await loadAppointments();
      alert('Appointment marked as completed!');
    } catch (error) {
      alert('Error updating appointment');
    }
  };

  const cancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.delete(id);
        await loadAppointments();
        alert('Appointment cancelled successfully!');
      } catch (error) {
        alert('Error cancelling appointment');
      }
    }
  };

  const currentAppointments = appointments.filter(apt => apt.status === 'current' || !apt.status);
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <div className="unified-appointments">
      <div className="appointment-tabs">
        <button 
          className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`} 
          onClick={() => setActiveTab('book')}
        >
          📅 Book Appointment
        </button>
        <button 
          className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`} 
          onClick={() => setActiveTab('current')}
        >
          📋 Current ({currentAppointments.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} 
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed ({completedAppointments.length})
        </button>
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      {/* Book Appointment Tab */}
      {activeTab === 'book' && (
        <div className="appointment-form-container">
          <h2>Book New Appointment</h2>
          <form onSubmit={handleAppointmentSubmit} className="appointment-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="patientName" value={formData.patientName} onChange={handleFormChange} required />
                {errors.patientName && <span className="error-msg">{errors.patientName}</span>}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} required />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} required />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleFormChange} min="1" max="120" required />
                {errors.age && <span className="error-msg">{errors.age}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleFormChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="error-msg">{errors.gender}</span>}
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select name="department" value={formData.department} onChange={handleFormChange} required>
                  <option value="">Select Department</option>
                  {services.map((s, i) => <option key={i} value={s.title}>{s.title}</option>)}
                </select>
                {errors.department && <span className="error-msg">{errors.department}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Appointment Date *</label>
                <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleFormChange} min={new Date().toISOString().split('T')[0]} required />
                {errors.appointmentDate && <span className="error-msg">{errors.appointmentDate}</span>}
              </div>
              <div className="form-group">
                <label>Appointment Time *</label>
                <input type="time" name="appointmentTime" value={formData.appointmentTime} onChange={handleFormChange} required />
                {errors.appointmentTime && <span className="error-msg">{errors.appointmentTime}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Time Slot *</label>
              <div className="slot-selection">
                <div className={`slot-card ${formData.slot === 'Morning' ? 'selected' : ''}`} onClick={() => setFormData({...formData, slot: 'Morning'})}>
                  <span className="slot-icon">☀️</span>
                  <h4>Morning</h4>
                  <p>8AM - 12PM</p>
                  <span className="slot-available">{availableSlots.morning} slots</span>
                </div>
                <div className={`slot-card ${formData.slot === 'Afternoon' ? 'selected' : ''}`} onClick={() => setFormData({...formData, slot: 'Afternoon'})}>
                  <span className="slot-icon">🌞</span>
                  <h4>Afternoon</h4>
                  <p>12PM - 5PM</p>
                  <span className="slot-available">{availableSlots.afternoon} slots</span>
                </div>
                <div className={`slot-card ${formData.slot === 'Evening' ? 'selected' : ''}`} onClick={() => setFormData({...formData, slot: 'Evening'})}>
                  <span className="slot-icon">🌙</span>
                  <h4>Evening</h4>
                  <p>5PM - 9PM</p>
                  <span className="slot-available">{availableSlots.evening} slots</span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Bed Type *</label>
              <select name="bedType" value={formData.bedType} onChange={handleFormChange} required>
                <option value="">Select Bed Type</option>
                <option value="General">General Ward - {availableBeds.general} beds ($500/day)</option>
                <option value="Private">Private Room - {availableBeds.private} beds ($1500/day)</option>
                <option value="ICU">ICU - {availableBeds.icu} beds ($3000/day)</option>
                <option value="Deluxe">Deluxe Suite - {availableBeds.deluxe} beds ($2000/day)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Symptoms / Reason for Visit *</label>
              <textarea name="symptoms" value={formData.symptoms} onChange={handleFormChange} rows="4" required></textarea>
              {errors.symptoms && <span className="error-msg">{errors.symptoms}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      )}

      {/* Current Appointments Tab */}
      {activeTab === 'current' && (
        <div className="appointments-list">
          <h2>Current Appointments</h2>
          {currentAppointments.length === 0 ? (
            <p className="no-appointments">No current appointments</p>
          ) : (
            currentAppointments.map(apt => {
              const total = (apt.consultationFee || 1500) + (apt.bedCharges || 0) + (apt.medicineCharges || 0) + (apt.labCharges || 0);
              return (
                <div key={apt._id} className="appointment-item">
                  <div className="appointment-header">
                    <h3>{apt.patientName}</h3>
                    <span className={`status-badge ${apt.status}`}>{apt.status || 'current'}</span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Department:</strong> {apt.department}</p>
                    <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}</p>
                    <p><strong>Slot:</strong> {apt.slot} | <strong>Bed:</strong> {apt.bedType}</p>
                    <p><strong>Phone:</strong> {apt.phone}</p>
                    <p><strong>Symptoms:</strong> {apt.symptoms}</p>
                  </div>
                  <div className="billing-section">
                    <h4>Billing Details</h4>
                    <div className="billing-row"><span>Consultation Fee:</span><span>₹{apt.consultationFee || 1500}</span></div>
                    <div className="billing-row"><span>Bed Charges:</span><span>₹{apt.bedCharges || 0}</span></div>
                    <div className="billing-row"><span>Medicine Charges:</span><span>₹{apt.medicineCharges || 0}</span></div>
                    <div className="billing-row"><span>Lab Charges:</span><span>₹{apt.labCharges || 0}</span></div>
                    <div className="billing-total"><span>Total Bill:</span><span>₹{total}</span></div>
                    {apt.paid && <div className="paid-badge">✅ Paid</div>}
                  </div>
                  <div className="appointment-actions">
                    {!apt.paid && <button className="btn-pay" onClick={() => handlePayment(apt._id)}>Pay Now</button>}
                    <button className="btn-complete" onClick={() => completeAppointment(apt._id)}>Mark as Completed</button>
                    <button className="btn-cancel" onClick={() => cancelAppointment(apt._id)}>Cancel</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Completed Appointments Tab */}
      {activeTab === 'completed' && (
        <div className="appointments-list">
          <h2>Completed Appointments</h2>
          {completedAppointments.length === 0 ? (
            <p className="no-appointments">No completed appointments</p>
          ) : (
            completedAppointments.map(apt => (
              <div key={apt._id} className="appointment-item completed">
                <div className="appointment-header">
                  <h3>{apt.patientName}</h3>
                  <span className="status-badge completed">Completed</span>
                </div>
                <div className="appointment-details">
                  <p><strong>Department:</strong> {apt.department}</p>
                  <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}</p>
                  <p><strong>Phone:</strong> {apt.phone}</p>
                  <p><strong>Completed On:</strong> {new Date(apt.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedAppointments;