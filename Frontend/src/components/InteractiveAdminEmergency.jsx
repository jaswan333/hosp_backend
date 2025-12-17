import { useState, useEffect } from 'react';
import { emergencyAPI } from '../api';

const InteractiveAdminEmergency = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(loadEmergencies, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pending = emergencies.filter(e => e.status === 'pending').length;
    setNotifications(pending);
  }, [emergencies]);

  const loadEmergencies = async () => {
    try {
      console.log('Loading emergencies from admin...');
      const result = await emergencyAPI.getAll();
      console.log('Admin emergency result:', result);
      setEmergencies(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error loading emergencies:', error);
    }
  };

  const handleAccept = async (id) => {
    try {
      await emergencyAPI.update(id, { 
        status: 'accepted',
        assignedDoctor: 'Dr. Emergency Team',
        estimatedArrival: new Date(Date.now() + 15 * 60000)
      });
      await loadEmergencies();
    } catch (error) {
      alert('Error accepting emergency');
    }
  };

  const handleComplete = async (id) => {
    try {
      await emergencyAPI.update(id, { status: 'completed' });
      await loadEmergencies();
    } catch (error) {
      alert('Error completing emergency');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this emergency request?')) {
      try {
        await emergencyAPI.delete(id);
        await loadEmergencies();
      } catch (error) {
        alert('Error deleting emergency');
      }
    }
  };

  const filteredEmergencies = emergencies.filter(e => 
    filter === 'all' || e.status === filter
  );

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14', 
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[priority] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      accepted: '🚑',
      completed: '✅'
    };
    return icons[status] || '❓';
  };

  return (
    <div className="admin-emergency">
      <div className="emergency-header">
        <h1>🚨 Emergency Control Center</h1>
        {notifications > 0 && (
          <div className="notification-pulse">
            {notifications} New Emergency{notifications > 1 ? 's' : ''}!
          </div>
        )}
      </div>

      <div className="filter-tabs">
        {['all', 'pending', 'accepted', 'completed'].map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? '🔍 All' : 
             status === 'pending' ? '🔴 Pending' :
             status === 'accepted' ? '🟡 Active' : '🟢 Completed'}
            ({emergencies.filter(e => status === 'all' || e.status === status).length})
          </button>
        ))}
      </div>

      <div className="debug-info" style={{background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px'}}>
        <p><strong>Debug Info:</strong></p>
        <p>Total Emergencies: {emergencies.length}</p>
        <p>Filtered Emergencies: {filteredEmergencies.length}</p>
        <p>Current Filter: {filter}</p>
        <p>API URL: http://localhost:3002/api/emergencies</p>
      </div>

      <div className="emergencies-grid">
        {filteredEmergencies.map(emergency => (
          <div key={emergency._id} className={`emergency-card ${emergency.priority}`}>
            <div className="card-header">
              <div className="emergency-type">
                <span className="type-icon">🚨</span>
                <div>
                  <h3>{emergency.emergencyType}</h3>
                  <span className="patient-name">{emergency.patientName}</span>
                </div>
              </div>
              <div className="priority-badge" style={{ backgroundColor: getPriorityColor(emergency.priority) }}>
                {emergency.priority.toUpperCase()}
              </div>
            </div>

            <div className="patient-details">
              <div className="detail-row">
                <span>📞 {emergency.phone}</span>
                <span>👤 {emergency.gender}</span>
              </div>
              <div className="detail-row">
                <span>⏰ {new Date(emergency.createdAt).toLocaleTimeString()}</span>
                <span>📅 {new Date(emergency.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {emergency.isPregnancy && (
              <div className="pregnancy-alert">
                🤰 Pregnancy Emergency - {emergency.pregnancyWeeks} weeks
              </div>
            )}

            <div className="symptoms-box">
              <strong>Symptoms:</strong>
              <p>{emergency.symptoms}</p>
            </div>

            <div className="location-box">
              <strong>📍 Location:</strong>
              <p>{emergency.location?.address}</p>
            </div>

            <div className="status-section">
              <div className="current-status">
                {getStatusIcon(emergency.status)} {emergency.status.toUpperCase()}
              </div>
              {emergency.assignedDoctor && (
                <div className="assignment">👨‍⚕️ {emergency.assignedDoctor}</div>
              )}
              {emergency.estimatedArrival && (
                <div className="eta">🕐 ETA: {new Date(emergency.estimatedArrival).toLocaleTimeString()}</div>
              )}
            </div>

            <div className="action-buttons">
              {emergency.status === 'pending' && (
                <button 
                  className="btn-accept"
                  onClick={() => handleAccept(emergency._id)}
                >
                  ✅ Accept & Dispatch
                </button>
              )}
              
              {emergency.status === 'accepted' && (
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

      {filteredEmergencies.length === 0 && (
        <div className="no-emergencies">
          <div className="empty-icon">📭</div>
          <h3>No {filter === 'all' ? '' : filter} emergencies</h3>
          <p>All clear! No emergency requests at the moment.</p>
        </div>
      )}

      <style jsx>{`
        .admin-emergency {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .emergency-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 25px;
          box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
        }

        .notification-pulse {
          background: rgba(255,255,255,0.9);
          color: #dc3545;
          padding: 12px 20px;
          border-radius: 25px;
          font-weight: 700;
          animation: pulse 2s infinite;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 12px 20px;
          border: none;
          background: white;
          color: #6c757d;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,123,255,0.3);
        }

        .emergencies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .emergency-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border-left: 5px solid #dee2e6;
        }

        .emergency-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .emergency-card.critical {
          border-left-color: #dc3545;
          background: linear-gradient(135deg, #fff, #fff5f5);
        }

        .emergency-card.high {
          border-left-color: #fd7e14;
          background: linear-gradient(135deg, #fff, #fff8f0);
        }

        .emergency-card.medium {
          border-left-color: #ffc107;
          background: linear-gradient(135deg, #fff, #fffdf0);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .emergency-type {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .type-icon {
          font-size: 24px;
        }

        .emergency-type h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }

        .patient-name {
          color: #666;
          font-size: 14px;
        }

        .priority-badge {
          color: white;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .patient-details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #555;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .pregnancy-alert {
          background: linear-gradient(135deg, #e83e8c, #d91a72);
          color: white;
          padding: 10px 15px;
          border-radius: 10px;
          margin-bottom: 15px;
          font-weight: 600;
          text-align: center;
        }

        .symptoms-box, .location-box {
          background: #f1f3f4;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          border-left: 3px solid #007bff;
        }

        .symptoms-box strong, .location-box strong {
          color: #333;
          display: block;
          margin-bottom: 5px;
        }

        .symptoms-box p, .location-box p {
          margin: 0;
          color: #555;
          font-size: 14px;
          line-height: 1.4;
        }

        .status-section {
          background: #e9ecef;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .current-status {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .assignment, .eta {
          font-size: 13px;
          color: #666;
          margin-bottom: 3px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .action-buttons button {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          flex: 1;
          min-width: 120px;
        }

        .btn-accept {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }

        .btn-accept:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(40,167,69,0.3);
        }

        .btn-complete {
          background: linear-gradient(135deg, #17a2b8, #138496);
          color: white;
        }

        .btn-complete:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(23,162,184,0.3);
        }

        .btn-delete {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
        }

        .btn-delete:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(220,53,69,0.3);
        }

        .no-emergencies {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .no-emergencies h3 {
          color: #333;
          margin-bottom: 10px;
        }

        .no-emergencies p {
          color: #666;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .emergency-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .emergencies-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            justify-content: center;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .detail-row {
            flex-direction: column;
            gap: 5px;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveAdminEmergency;