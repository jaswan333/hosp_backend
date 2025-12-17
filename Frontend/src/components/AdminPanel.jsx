import React, { useState } from 'react';
import InteractiveAdminEmergency from './InteractiveAdminEmergency';
import AdminPharmacy from './AdminPharmacy';
import AdminOrders from './AdminOrders';
import './AdminPanel.css';

function AdminPanel({ 
  adminPage, 
  navigateAdmin, 
  setIsAdminMode, 
  currentAdmin,
  users, 
  deleteUser, 
  services, 
  deleteService, 
  addService, 
  doctors, 
  setDoctors,
  appointments,
  updateDoctorStatus
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', experience: '', image: '' });
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  
  // Analytics calculations
  const totalSales = appointments.reduce((sum, apt) => sum + ((apt.consultationFee || 1500) + (apt.bedCharges || 0) + (apt.medicineCharges || 0) + (apt.labCharges || 0)), 0);
  const monthlyData = appointments.reduce((acc, apt) => {
    const month = new Date(apt.appointmentDate || apt.date).getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const departmentStats = services.map(service => ({
    name: service.title,
    appointments: appointments.filter(apt => apt.department === service.title).length
  })).sort((a, b) => b.appointments - a.appointments);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const addNewService = () => {
    const title = prompt('Service Title:');
    const icon = prompt('Service Icon (emoji):');
    const desc = prompt('Service Description:');
    if (title && icon && desc) {
      addService({ title, icon, desc, features: ['Feature 1', 'Feature 2'] });
    }
  };
  
  const getUserStats = (userId) => {
    const user = users.find(u => u.id === userId);
    const userAppointments = appointments.filter(apt => 
      apt.userId === userId || 
      apt.userId === user?.id ||
      (user && (apt.patientName === user.name || apt.email === user.email))
    );
    return {
      totalVisits: userAppointments.length,
      completedAppointments: userAppointments.filter(apt => apt.status === 'completed').length,
      totalSpent: userAppointments.reduce((sum, apt) => sum + ((apt.consultationFee || 1500) + (apt.bedCharges || 0) + (apt.medicineCharges || 0) + (apt.labCharges || 0)), 0)
    };
  };
  
  const getServiceStats = (serviceTitle) => {
    const serviceAppointments = appointments.filter(apt => apt.department === serviceTitle);
    const serviceDoctors = doctors.filter(doc => doc.specialty.toLowerCase().includes(serviceTitle.toLowerCase().split(' ')[0]));
    return {
      appointments: serviceAppointments.length,
      doctors: serviceDoctors.length,
      revenue: serviceAppointments.reduce((sum, apt) => sum + ((apt.consultationFee || 1500) + (apt.bedCharges || 0) + (apt.medicineCharges || 0) + (apt.labCharges || 0)), 0)
    };
  };
  
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };
  
  const handleAddDoctor = () => {
    if (newDoctor.name && newDoctor.specialty) {
      const doctorData = {
        id: Date.now(),
        ...newDoctor,
        status: 'Available',
        attendance: '95%',
        location: 'General Ward',
        lastSeen: new Date()
      };
      setDoctors([...doctors, doctorData]);
      setNewDoctor({ name: '', specialty: '', experience: '', image: '' });
      setShowAddDoctor(false);
    }
  };

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleDeleteDoctor = (doctorId) => {
    if (window.confirm('Are you sure you want to remove this doctor?')) {
      setDoctors(doctors.filter(doc => doc.id !== doctorId));
    }
  };

  const markAttendance = (doctorId, status) => {
    const message = status === 'present' ? 'marked as present' : 'marked as absent';
    alert(`Doctor ${message} for today`);
    setSelectedDoctor(null);
  };

  return (
    <div className="admin-panel">
      <div className="admin-main-container">
        <div className="admin-sidebar">
        <div className="admin-header">
          <h2>🛠️ Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <a onClick={() => setIsAdminMode(false)} className="back-btn">← Back to Main</a>
          <a onClick={() => navigateAdmin('dashboard')} className={adminPage === 'dashboard' ? 'active' : ''}>📊 Dashboard</a>
          <a onClick={() => navigateAdmin('users')} className={adminPage === 'users' ? 'active' : ''}>👥 Users</a>
          <a onClick={() => navigateAdmin('services')} className={adminPage === 'services' ? 'active' : ''}>🏥 Services</a>
          <a onClick={() => navigateAdmin('doctors')} className={adminPage === 'doctors' ? 'active' : ''}>👨⚕️ Doctors</a>
          <a onClick={() => navigateAdmin('emergency')} className={adminPage === 'emergency' ? 'active' : ''}>🚨 Emergency</a>
          <a onClick={() => navigateAdmin('pharmacy')} className={adminPage === 'pharmacy' ? 'active' : ''}>💊 Pharmacy & Orders</a>
        </nav>
        </div>

        <div className="admin-content">
        {adminPage === 'dashboard' && (
          <div className="dashboard">
            <h1>Hospital Dashboard</h1>
            <div className="dashboard-stats">
              <div className="stat-box">
                <h3>{users.length}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-box">
                <h3>{appointments.length}</h3>
                <p>Appointments</p>
              </div>
              <div className="stat-box">
                <h3>{services.length}</h3>
                <p>Services</p>
              </div>
              <div className="stat-box">
                <h3>₹{totalSales.toLocaleString()}</h3>
                <p>Total Sales</p>
              </div>
            </div>
            
            <div className="system-overview">
              <h2>System Overview</h2>
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>📊 Performance</h3>
                  <p>System running at 98% efficiency</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '98%'}}></div>
                  </div>
                </div>
                <div className="overview-card">
                  <h3>🔒 Security</h3>
                  <p>All systems secure and monitored</p>
                  <div className="security-status">
                    <span className="status-indicator secure"></span>
                    <span>Secure</span>
                  </div>
                </div>
                <div className="overview-card">
                  <h3>💾 Storage</h3>
                  <p>Database usage: 65% of capacity</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '65%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="recent-activities">
              <h2>Recent Activities</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-icon">👤</span>
                  <div className="activity-details">
                    <p><strong>New User Registration</strong></p>
                    <p>5 new users registered today</p>
                  </div>
                  <span className="activity-time">2 hours ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">📅</span>
                  <div className="activity-details">
                    <p><strong>Appointments Scheduled</strong></p>
                    <p>12 new appointments booked</p>
                  </div>
                  <span className="activity-time">4 hours ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-icon">💰</span>
                  <div className="activity-details">
                    <p><strong>Revenue Update</strong></p>
                    <p>₹{(totalSales * 0.1).toLocaleString()} earned today</p>
                  </div>
                  <span className="activity-time">6 hours ago</span>
                </div>
              </div>
            </div>
            
            <div className="charts-section">
              <div className="chart-container">
                <h3>Total Sales</h3>
                <div className="donut-chart">
                  <div className="donut-center">
                    <span className="donut-value">₹{totalSales.toLocaleString()}</span>
                    <span className="donut-label">Total Revenue</span>
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <h3>Monthly Appointments</h3>
                <div className="bar-chart">
                  {months.map((month, index) => (
                    <div key={month} className="bar-item">
                      <div className="bar" style={{height: `${Math.max((monthlyData[index] || 0) * 10, 5)}px`}}></div>
                      <span className="bar-label">{month}</span>
                      <span className="bar-value">{monthlyData[index] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="chart-container">
                <h3>Top Departments</h3>
                <div className="department-chart">
                  {departmentStats.slice(0, 5).map((dept) => (
                    <div key={dept.name} className="dept-item">
                      <span className="dept-name">{dept.name}</span>
                      <div className="dept-bar">
                        <div className="dept-fill" style={{width: `${Math.max((dept.appointments / Math.max(...departmentStats.map(d => d.appointments), 1)) * 100, 5)}%`}}></div>
                      </div>
                      <span className="dept-value">{dept.appointments}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="admin-footer">
              <div className="footer-content">
                <div className="footer-section">
                  <h4>Quick Links</h4>
                  <a onClick={() => navigateAdmin('users')}>User Management</a>
                  <a onClick={() => navigateAdmin('services')}>Services</a>
                  <a onClick={() => navigateAdmin('doctors')}>Doctors</a>
                </div>
                <div className="footer-section">
                  <h4>Admin Tools</h4>
                  <a href="#">Reports</a>
                  <a href="#">Settings</a>
                  <a href="#">Backup</a>
                </div>
                <div className="footer-section">
                  <h4>Support</h4>
                  <a href="#">Help Center</a>
                  <a href="#">Contact IT</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {adminPage === 'users' && (
          <div className="users-management">
            <div className="users-header">
              <h1>👥 User Management</h1>
              <div className="users-stats">
                <div className="stat-item">
                  <span className="stat-number">{users.length}</span>
                  <span className="stat-label">Total Users</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{users.filter(u => appointments.some(a => a.userId === u.id)).length}</span>
                  <span className="stat-label">Active Users</span>
                </div>
              </div>
            </div>
            
            <div className="users-grid">
              {users.map(user => {
                const stats = getUserStats(user.id);
                return (
                  <div key={user.id} className="user-card">
                    <div className="user-avatar">
                      <span className="avatar-icon">👤</span>
                      <div className="user-status active"></div>
                    </div>
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p className="user-email">{user.email}</p>
                      <p className="user-phone">{user.phone || 'No phone'}</p>
                      <div className="user-stats">
                        <div className="stat">
                          <span className="stat-value">{stats.totalVisits}</span>
                          <span className="stat-text">Visits</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">₹{stats.totalSpent.toLocaleString()}</span>
                          <span className="stat-text">Spent</span>
                        </div>
                      </div>
                    </div>
                    <div className="user-actions">
                      <button className="view-btn" onClick={() => handleViewUser(user)}>👁️ View</button>
                      <button className="delete-btn" onClick={() => deleteUser(user.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {showUserModal && selectedUser && (
              <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                <div className="user-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>👤 {selectedUser.name}</h3>
                    <button onClick={() => setShowUserModal(false)} className="close-btn">×</button>
                  </div>
                  <div className="modal-body">
                    <div className="user-profile">
                      <div className="profile-item">
                        <span className="label">📧 Email:</span>
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="profile-item">
                        <span className="label">📱 Phone:</span>
                        <span>{selectedUser.phone || 'Not provided'}</span>
                      </div>
                      <div className="profile-item">
                        <span className="label">📅 Joined:</span>
                        <span>{selectedUser.joinDate || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="appointments-history">
                      <h4>📋 Appointment History</h4>
                      <div className="appointments-list">
                          {appointments.filter(apt => 
                          apt.userId === selectedUser.id || 
                          apt.userId === selectedUser._id ||
                          apt.patientName === selectedUser.name ||
                          apt.email === selectedUser.email
                        ).length === 0 ? (
                          <p className="no-appointments">No appointments found</p>
                        ) : (
                          appointments.filter(apt => 
                            apt.userId === selectedUser.id || 
                            apt.userId === selectedUser._id ||
                            apt.patientName === selectedUser.name ||
                            apt.email === selectedUser.email
                          ).map(apt => (
                            <div key={apt.id || apt._id} className="appointment-card">
                              <div className="apt-info">
                                <span className="dept">{apt.department}</span>
                                <span className="date">{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                              </div>
                              <span className={`apt-status ${apt.status || 'scheduled'}`}>
                                {apt.status || 'scheduled'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {adminPage === 'services' && (
          <div className="services-management">
            <h1>Services Management</h1>
            <button className="add-btn" onClick={addNewService}>+ Add Service</button>
            <div className="services-grid">
              {services.map(service => {
                const stats = getServiceStats(service.title);
                return (
                  <div key={service.id} className="admin-service-card">
                    <span className="service-icon">{service.icon}</span>
                    <h3>{service.title}</h3>
                    <p>{service.desc.substring(0, 50)}...</p>
                    <div className="service-stats">
                      <span>👨‍⚕️ {stats.doctors} Doctors</span>
                      <span>📅 {stats.appointments} Appointments</span>
                      <span>💰 ₹{stats.revenue.toLocaleString()}</span>
                    </div>
                    <button className="delete-btn" onClick={() => deleteService(service.id)}>Remove</button>
                  </div>
                );
              })}
            </div>
            
            <div className="admin-footer">
              <div className="footer-content">
                <div className="footer-section">
                  <h4>Service Actions</h4>
                  <a href="#">Import Services</a>
                  <a href="#">Service Reports</a>
                </div>
                <div className="footer-section">
                  <h4>Analytics</h4>
                  <a href="#">Performance Metrics</a>
                  <a href="#">Revenue Analysis</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {adminPage === 'emergency' && (
          <InteractiveAdminEmergency />
        )}

        {adminPage === 'pharmacy' && (
          <AdminPharmacy />
        )}

        {adminPage === 'doctors' && (
          <div className="doctors-management">
            <div className="doctors-header">
              <h1>👨‍⚕️ Doctors Management</h1>
              <div className="doctors-stats">
                <div className="stat-item">
                  <span className="stat-number">{doctors.length}</span>
                  <span className="stat-label">Total Doctors</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{doctors.filter(d => d.status === 'Available').length}</span>
                  <span className="stat-label">Available</span>
                </div>
              </div>
            </div>
            
            <div className="section-header">
              <h2>Medical Staff</h2>
              <button className="add-btn" onClick={() => setShowAddDoctor(true)}>+ Add Doctor</button>
            </div>
            
            {showAddDoctor && (
              <div className="add-form">
                <h3>Add New Doctor</h3>
                <div className="form-grid">
                  <input type="text" placeholder="Doctor Name" value={newDoctor.name} onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})} />
                  <input type="text" placeholder="Specialty" value={newDoctor.specialty} onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})} />
                  <input type="text" placeholder="Experience" value={newDoctor.experience} onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})} />
                  <input type="url" placeholder="Image URL" value={newDoctor.image} onChange={(e) => setNewDoctor({...newDoctor, image: e.target.value})} />
                </div>
                <div className="form-actions">
                  <button onClick={handleAddDoctor} className="save-btn">Add Doctor</button>
                  <button onClick={() => setShowAddDoctor(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            )}
            
            <div className="doctors-grid">
              {doctors.map(doctor => {
                const doctorAppointments = appointments.filter(apt => apt.department && apt.department.toLowerCase().includes(doctor.specialty.toLowerCase().split(' ')[0])).length;
                return (
                  <div key={doctor.id} className="doctor-card enhanced">
                    <div className="doctor-image">
                      <img src={doctor.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80'} alt={doctor.name} />
                      <div className={`status-indicator ${doctor.status.toLowerCase().replace(' ', '-')}`}></div>
                    </div>
                    <div className="doctor-info">
                      <h3>{doctor.name}</h3>
                      <p className="specialty">{doctor.specialty}</p>
                      <p className="experience">{doctor.experience}</p>
                      <div className="doctor-metrics">
                        <div className="metric">
                          <span className="metric-value">{doctorAppointments}</span>
                          <span className="metric-label">Appointments</span>
                        </div>
                        <div className="metric">
                          <span className="metric-value">{doctor.attendance}</span>
                          <span className="metric-label">Attendance</span>
                        </div>
                      </div>
                      <div className="doctor-status">
                        <span className={`status-badge ${doctor.status.toLowerCase().replace(' ', '-')}`}>
                          {doctor.status === 'Available' ? '🟢' : doctor.status === 'In Surgery' ? '🔴' : '🟡'} {doctor.status}
                        </span>
                      </div>
                    </div>
                    <div className="doctor-actions">
                      <button className="view-btn" onClick={() => handleViewDoctor(doctor)}>👁️ View</button>
                      <select value={doctor.status} onChange={(e) => updateDoctorStatus && updateDoctorStatus(doctor.id, e.target.value)} className="status-select">
                        <option value="Available">Available</option>
                        <option value="In Surgery">In Surgery</option>
                        <option value="With Patient">With Patient</option>
                        <option value="On Break">On Break</option>
                        <option value="Off Duty">Off Duty</option>
                      </select>
                      <button className="delete-btn" onClick={() => handleDeleteDoctor(doctor.id)}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedDoctor && (
              <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
                <div className="doctor-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>👨‍⚕️ {selectedDoctor.name}</h3>
                    <button onClick={() => setSelectedDoctor(null)} className="close-btn">×</button>
                  </div>
                  <div className="modal-body">
                    <div className="doctor-profile">
                      <img src={selectedDoctor.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80'} alt={selectedDoctor.name} className="profile-img" />
                      <div className="profile-details">
                        <div className="detail-item">
                          <span className="label">🏥 Specialty:</span>
                          <span>{selectedDoctor.specialty}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">📅 Experience:</span>
                          <span>{selectedDoctor.experience}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">📍 Location:</span>
                          <span>{selectedDoctor.location}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">📊 Attendance:</span>
                          <span>{selectedDoctor.attendance}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">🕐 Last Seen:</span>
                          <span>{new Date(selectedDoctor.lastSeen).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="attendance-controls">
                      <h4>📋 Attendance Management</h4>
                      <div className="attendance-buttons">
                        <button className="present-btn" onClick={() => markAttendance(selectedDoctor.id, 'present')}>✅ Mark Present</button>
                        <button className="absent-btn" onClick={() => markAttendance(selectedDoctor.id, 'absent')}>❌ Mark Absent</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ACE Hospital Admin</h3>
            <p>Advanced Care Excellence</p>
            <p>Hospital Management System</p>
            <p>{users.length} Users | {appointments.length} Appointments</p>
          </div>
          <div className="footer-section">
            <h3>Admin Navigation</h3>
            <a onClick={() => navigateAdmin('dashboard')}>📊 Dashboard</a>
            <a onClick={() => navigateAdmin('users')}>👥 Users</a>
            <a onClick={() => navigateAdmin('services')}>🏥 Services</a>
            <a onClick={() => navigateAdmin('doctors')}>👨⚕️ Doctors</a>
            <a onClick={() => navigateAdmin('emergency')}>🚨 Emergency</a>
            <a onClick={() => navigateAdmin('pharmacy')}>💊 Pharmacy</a>
          </div>
          <div className="footer-section">
            <h3>Quick Actions</h3>
            <a onClick={() => setIsAdminMode(false)}>🏠 Main Site</a>
            <a href="#">📈 Analytics</a>
            <a href="#">⚙️ Settings</a>
            <a href="#">💾 Backup</a>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>📞 Admin: (555) 123-ADMIN</p>
            <p>✉️ admin@acehospital.com</p>
            <p>🏥 ACE Hospital Management</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 ACE Hospital Admin Panel. All rights reserved. | Done by Jaswan</p>
        </div>
      </footer>
    </div>
  );
}

export default AdminPanel;