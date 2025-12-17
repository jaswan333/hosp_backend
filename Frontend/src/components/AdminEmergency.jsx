import { useState, useEffect } from 'react';
import { emergencyAPI } from '../api';

const AdminEmergency = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(loadEmergencies, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pendingCount = emergencies.filter(e => e.status === 'pending').length;
    setNotifications(pendingCount);
  }, [emergencies]);

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      const result = await emergencyAPI.getAll();
      setEmergencies(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error loading emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await emergencyAPI.update(id, { 
        status: 'accepted',
        assignedDoctor: 'Dr. Emergency Response',
        estimatedArrival: new Date(Date.now() + 15 * 60000) // 15 minutes from now
      });
      await loadEmergencies();
      alert('Emergency accepted! Ambulance dispatched.');
    } catch (error) {
      alert('Error accepting emergency');
    }
  };

  const handleComplete = async (id) => {
    try {
      await emergencyAPI.update(id, { status: 'completed' });
      await loadEmergencies();
      alert('Emergency marked as completed');
    } catch (error) {
      alert('Error completing emergency');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this emergency request?')) {
      try {
        await emergencyAPI.delete(id);
        await loadEmergencies();
        alert('Emergency request deleted');
      } catch (error) {
        alert('Error deleting emergency');
      }
    }
  };

  const handleAddNotes = async (id, notes) => {
    try {
      await emergencyAPI.update(id, { adminNotes: notes });
      await loadEmergencies();
    } catch (error) {
      alert('Error updating notes');
    }
  };

  const filterEmergencies = (status) => {
    return emergencies.filter(e => e.status === status);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getTimeSince = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="admin-emergency">
      <div className="emergency-header">
        <h1>🚨 Emergency Management</h1>
        {notifications > 0 && (
          <div className="notification-badge">
            {notifications} New Emergency{notifications > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="emergency-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          🔴 Pending ({filterEmergencies('pending').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          🟡 Accepted ({filterEmergencies('accepted').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          🟢 Completed ({filterEmergencies('completed').length})
        </button>
      </div>

      {loading && <div className="loading">Loading emergencies...</div>}

      <div className="emergencies-grid">
        {filterEmergencies(activeTab).map(emergency => (
          <div key={emergency._id} className={`emergency-card ${emergency.priority}`}>
            <div className="emergency-card-header">
              <div className="emergency-info">
                <h3>{emergency.emergencyType}</h3>
                <span 
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(emergency.priority) }}
                >
                  {emergency.priority.toUpperCase()}
                </span>
              </div>
              <div className="emergency-time">
                {getTimeSince(emergency.createdAt)}
              </div>
            </div>

            <div className="patient-info">
              <p><strong>Patient:</strong> {emergency.patientName}</p>
              <p><strong>Age:</strong> {emergency.age} | <strong>Gender:</strong> {emergency.gender}</p>
              <p><strong>Phone:</strong> {emergency.phone}</p>
              <p><strong>Email:</strong> {emergency.email}</p>
            </div>

            {emergency.isPregnancy && (
              <div className="pregnancy-info">
                <p><strong>🤰 Pregnancy Emergency</strong></p>
                <p><strong>Weeks:</strong> {emergency.pregnancyWeeks}</p>
                {emergency.pregnancyComplications && (
                  <p><strong>Complications:</strong> {emergency.pregnancyComplications}</p>
                )}
              </div>
            )}

            <div className="symptoms-section">
              <p><strong>Symptoms:</strong></p>
              <p className="symptoms-text">{emergency.symptoms}</p>
            </div>

            <div className="location-section">
              <p><strong>📍 Location:</strong></p>
              <p>{emergency.location?.address}</p>
              {emergency.location?.latitude && (
                <p className="coordinates">
                  Lat: {emergency.location.latitude.toFixed(4)}, 
                  Lng: {emergency.location.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {emergency.assignedDoctor && (
              <div className="assignment-info">
                <p><strong>👨‍⚕️ Assigned:</strong> {emergency.assignedDoctor}</p>
                {emergency.estimatedArrival && (
                  <p><strong>⏰ ETA:</strong> {new Date(emergency.estimatedArrival).toLocaleTimeString()}</p>
                )}
              </div>
            )}

            <div className="notes-section">
              <textarea
                placeholder="Admin notes..."
                value={emergency.adminNotes || ''}
                onChange={(e) => handleAddNotes(emergency._id, e.target.value)}
                rows="2"
              />
            </div>

            <div className="emergency-actions">
              {activeTab === 'pending' && (
                <button 
                  className="btn-accept"
                  onClick={() => handleAccept(emergency._id)}
                >
                  ✅ Accept & Dispatch
                </button>
              )}
              
              {activeTab === 'accepted' && (
                <button 
                  className="btn-complete"
                  onClick={() => handleComplete(emergency._id)}
                >
                  ✅ Mark Complete
                </button>
              )}

              <button 
                className="btn-delete"
                onClick={() => handleDelete(emergency._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filterEmergencies(activeTab).length === 0 && !loading && (
        <div className="no-emergencies">
          No {activeTab} emergencies
        </div>
      )}

      <style jsx>{`
        .admin-emergency {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .emergency-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .notification-badge {
          background: #dc3545;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .emergency-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #e0e0e0;
        }

        .tab-btn {
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: #666;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          color: #4A90E2;
          border-bottom-color: #4A90E2;
          background: rgba(74, 144, 226, 0.1);
        }

        .emergencies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .emergency-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .emergency-card.critical {
          border-left: 5px solid #dc3545;
        }

        .emergency-card.high {
          border-left: 5px solid #fd7e14;
        }

        .emergency-card.medium {
          border-left: 5px solid #ffc107;
        }

        .emergency-card.low {
          border-left: 5px solid #28a745;
        }

        .emergency-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .priority-indicator {
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .emergency-time {
          font-size: 12px;
          color: #666;
        }

        .patient-info, .symptoms-section, .location-section, .assignment-info, .pregnancy-info {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f0f0f0;
        }

        .symptoms-text {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 6px;
          font-style: italic;
        }

        .coordinates {
          font-size: 12px;
          color: #666;
        }

        .pregnancy-info {
          background: #fff3e0;
          padding: 10px;
          border-radius: 6px;
        }

        .notes-section textarea {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 8px;
          resize: vertical;
        }

        .emergency-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .emergency-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-accept {
          background: #28a745;
          color: white;
        }

        .btn-complete {
          background: #17a2b8;
          color: white;
        }

        .btn-delete {
          background: #dc3545;
          color: white;
        }

        .loading, .no-emergencies {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default AdminEmergency;