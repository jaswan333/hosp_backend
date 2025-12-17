import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Emergency from './components/Emergency';
import InteractiveEmergency from './components/InteractiveEmergency';
import Pharmacy from './components/Pharmacy';
import SimplePharmacy from './components/SimplePharmacy';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import UnifiedAppointments from './components/UnifiedAppointments';
import NotFound from './components/NotFound';
import { authAPI, appointmentAPI, userAPI } from './api';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'Guest', email: 'guest@acehospital.com' });
  const [authPage, setAuthPage] = useState('login');
  const [showAuth, setShowAuth] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [adminPage, setAdminPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. John Smith', specialty: 'Chief Cardiologist', experience: '25+ years', status: 'Available', attendance: '95%', location: 'ICU Ward', lastSeen: new Date() },
    { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Head of Neurology', experience: '20+ years', status: 'Available', attendance: '98%', location: 'Neurology Wing', lastSeen: new Date() },
    { id: 3, name: 'Dr. Michael Chen', specialty: 'Orthopedic Surgeon', experience: '15+ years', status: 'In Surgery', attendance: '92%', location: 'OR-3', lastSeen: new Date() },
    { id: 4, name: 'Dr. Emily Davis', specialty: 'Pediatrician', experience: '12+ years', status: 'Available', attendance: '97%', location: 'Pediatric Ward', lastSeen: new Date() },
    { id: 5, name: 'Dr. Emergency Wilson', specialty: 'Emergency Medicine', experience: '18+ years', status: 'Available', attendance: '99%', location: 'Emergency Dept', lastSeen: new Date() },
    { id: 6, name: 'Dr. Maternity Brown', specialty: 'Obstetrics', experience: '22+ years', status: 'Available', attendance: '96%', location: 'Maternity Ward', lastSeen: new Date() }
  ]);
  const [activeTab, setActiveTab] = useState('current');
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [formData, setFormData] = useState({
    patientName: '', email: '', phone: '', age: '', gender: '', department: '',
    appointmentDate: '', appointmentTime: '', symptoms: '', bedType: '', slot: ''
  });
  const [errors, setErrors] = useState({});
  const [availableSlots] = useState({ morning: 15, afternoon: 12, evening: 8 });
  const [availableBeds] = useState({ general: 45, private: 12, icu: 8, deluxe: 5 });
  const [cart, setCart] = useState([]);
  const [offers] = useState([
    '🎉 Get 20% OFF on all health checkup packages this week!',
    '💊 Free home delivery on pharmacy orders above $50',
    '🏥 Book appointment today and get FREE consultation',
    '⚡ Emergency services available 24/7 - Call (555) 911-HELP'
  ]);

  const loadAppointments = async () => {
    try {
      const result = await appointmentAPI.getAll();
      if (Array.isArray(result)) {
        const formattedAppointments = result.map(apt => ({ ...apt, id: apt._id }));
        setAppointments(formattedAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and get user data from backend
      const validateUser = async () => {
        try {
          const response = await fetch('http://localhost:3002/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const user = await response.json();
            setIsAuthenticated(true);
            setCurrentUser(user);
            setProfile({ name: user.name, email: user.email, phone: user.phone || '', address: '' });
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          localStorage.removeItem('authToken');
        }
      };
      validateUser();
    }
    
    // Load users from backend
    const loadUsers = async () => {
      try {
        const result = await userAPI.getAll();
        if (Array.isArray(result)) {
          const formattedUsers = result.map(user => ({ ...user, id: user._id }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setUsers([]);
      }
    };
    
    loadAppointments();
    loadUsers();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      loadAppointments();
      loadUsers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const result = await authAPI.login(credentials);
      if (result.user && result.token) {
        const user = result.user;
        setIsAuthenticated(true);
        setCurrentUser(user);
        setShowAuth(false);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setCurrentUser({ name: 'Guest', email: 'guest@acehospital.com' });
    navigate('/');
  };

  const showLoginPage = () => {
    setShowAuth(true);
    setAuthPage('login');
  };

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const getCurrentPageTitle = () => {
    const path = location.pathname;
    switch(path) {
      case '/': return 'Welcome to ACE Hospital';
      case '/services': return 'Our Services';
      case '/emergency': return 'Emergency Services';
      case '/pharmacy': return 'Pharmacy';
      case '/appointments': return 'Appointments';

      case '/contact': return 'Contact & Profile';
      case '/about': return 'About ACE Hospital';
      default: return 'ACE Hospital';
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.patientName.trim().length < 3) newErrors.patientName = 'Name must be at least 3 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!/^[0-9]{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) newErrors.phone = 'Please enter a valid 10-digit phone number';
    if (formData.age < 1 || formData.age > 120) newErrors.age = 'Please enter a valid age';
    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!formData.department) newErrors.department = 'Please select a department';
    const selectedDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!formData.appointmentDate || selectedDate < today) newErrors.appointmentDate = 'Please select a valid future date';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Please select appointment time';
    if (formData.symptoms.trim().length < 10) newErrors.symptoms = 'Please provide detailed symptoms (min 10 characters)';
    return newErrors;
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      try {
        const result = await appointmentAPI.create({
          ...formData,
          userId: currentUser?.id,
          status: 'current',
          consultationFee: 1500
        });
        if (result.appointment) {
          // Store appointment with current user info for better tracking
          const appointmentWithUser = {
            ...result.appointment,
            userId: currentUser?.id,
            patientName: formData.patientName,
            email: formData.email
          };
          await loadAppointments();
          alert('Appointment Booked Successfully!');
          setFormData({ patientName: '', email: '', phone: '', age: '', gender: '', department: '', appointmentDate: '', appointmentTime: '', symptoms: '', bedType: '', slot: '', isPregnancy: false, pregnancyWeeks: '', pregnancyType: '' });
          setActiveTab('current');
        }
      } catch (error) {
        alert('Error booking appointment. Please try again.');
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3002/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        alert('Profile saved successfully!');
      } else {
        alert('Error saving profile');
      }
    } catch (error) {
      alert('Error saving profile');
    }
  };

  const [services, setServices] = useState([
    { id: 1, icon: '🫀', title: 'Cardiology', desc: 'Comprehensive heart care with advanced diagnostic and treatment options. Our cardiology department offers ECG, Echo, Angiography, and cardiac surgery.', features: ['24/7 Emergency Cardiac Care', 'Advanced Cardiac Imaging', 'Interventional Cardiology', 'Cardiac Rehabilitation'] },
    { id: 2, icon: '🧠', title: 'Neurology', desc: 'Expert neurological care for brain, spine, and nervous system disorders with cutting-edge technology and experienced neurologists.', features: ['Stroke Management', 'Epilepsy Treatment', 'Neurosurgery', 'Neuro Rehabilitation'] },
    { id: 3, icon: '🦴', title: 'Orthopedics', desc: 'Specialized bone and joint care including surgery, rehabilitation, and sports medicine for all age groups.', features: ['Joint Replacement Surgery', 'Sports Injury Treatment', 'Arthroscopy', 'Physiotherapy'] },
    { id: 4, icon: '👶', title: 'Pediatrics', desc: 'Dedicated healthcare for children from infancy through adolescence with compassionate and specialized care.', features: ['Newborn Care', 'Vaccination Programs', 'Child Development Monitoring', 'Pediatric Emergency Care'] },
    { id: 5, icon: '🚨', title: 'Emergency Care', desc: '24/7 emergency services with rapid response team and state-of-the-art trauma care facilities.', features: ['Trauma Care Unit', 'Ambulance Services', 'Critical Care', 'Emergency Surgery'] },
    { id: 6, icon: '🔬', title: 'Laboratory Services', desc: 'Advanced diagnostic testing with accurate results and quick turnaround times using latest technology.', features: ['Blood Tests', 'Radiology & Imaging', 'Pathology', 'Microbiology'] },
    { id: 7, icon: '🤰', title: 'Maternity Care', desc: 'Complete maternity services with experienced obstetricians and modern delivery facilities.', features: ['Prenatal Care', 'Normal & C-Section Delivery', 'Postnatal Care', 'NICU Facilities'] },
    { id: 8, icon: '👁️', title: 'Ophthalmology', desc: 'Comprehensive eye care services including surgery, laser treatments, and vision correction.', features: ['Cataract Surgery', 'LASIK Treatment', 'Retina Care', 'Glaucoma Management'] }
  ]);

  const deleteUser = async (id) => {
    try {
      await userAPI.delete(id);
      // Reload users from database after deletion
      const result = await userAPI.getAll();
      if (Array.isArray(result)) {
        const formattedUsers = result.map(user => ({ ...user, id: user._id }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };
  const deleteService = (id) => setServices(services.filter(service => service.id !== id));
  const addService = (newService) => setServices([...services, { ...newService, id: Date.now() }]);
  const navigateAdmin = (page) => setAdminPage(page);

  const updateDoctorStatus = (doctorId, newStatus) => {
    setDoctors(prev => prev.map(doc => 
      doc.id === doctorId 
        ? { ...doc, status: newStatus, lastSeen: new Date() }
        : doc
    ));
  };

  // Real-time doctor status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDoctors(prev => prev.map(doc => ({
        ...doc,
        lastSeen: new Date()
      })));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleAdminLogin = (admin) => {
    setCurrentAdmin(admin);
    setIsAdminMode(true);
    setShowAdminLogin(false);
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    setIsAdminMode(false);
    setShowAdminLogin(false);
  };

  const handleEmergencyBooking = async (emergencyData) => {
    try {
      const result = await appointmentAPI.create(emergencyData);
      if (result.appointment) {
        await loadAppointments();
        return { success: true };
      }
    } catch (error) {
      console.error('Emergency booking error:', error);
      return { success: false };
    }
  };

  if (showAuth) {
    if (authPage === 'login') return <Login onLogin={handleLogin} onNavigate={setAuthPage} />;
    if (authPage === 'register') return <Register onNavigate={setAuthPage} />;
    if (authPage === 'forgot') return <ForgotPassword onNavigate={setAuthPage} />;
  }

  if (showAdminLogin) {
    return <AdminLogin 
      onAdminLogin={handleAdminLogin} 
      onBack={() => setShowAdminLogin(false)} 
    />;
  }

  if (isAdminMode && currentAdmin) {
    return <AdminPanel 
      adminPage={adminPage}
      navigateAdmin={navigateAdmin}
      setIsAdminMode={handleAdminLogout}
      currentAdmin={currentAdmin}
      users={users}
      deleteUser={deleteUser}
      services={services}
      deleteService={deleteService}
      addService={addService}
      doctors={doctors}
      setDoctors={setDoctors}
      appointments={appointments}
      updateDoctorStatus={updateDoctorStatus}
    />;
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="hospital-logo">
              <div className="classic-logo">
                <div className="logo-cross">+</div>
                <div className="logo-text">
                  <h2>ACE</h2>
                  <span className="logo-subtitle">HOSPITAL</span>
                </div>
              </div>
            </div>
          </div>
          <span className="close-btn" onClick={() => setSidebarOpen(false)}>&times;</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <p className="user-name">{isAuthenticated ? currentUser?.name : 'Guest'}</p>
          <p className="user-email">{isAuthenticated ? currentUser?.email : 'guest@acehospital.com'}</p>
        </div>
        <nav className="sidebar-nav">
          <a onClick={() => navigateTo('/')} className={location.pathname === '/' ? 'active' : ''}>🏠 Home</a>
          <a onClick={() => navigateTo('/services')} className={location.pathname === '/services' ? 'active' : ''}>🏥 Services</a>
          <a onClick={() => navigateTo('/emergency')} className={location.pathname === '/emergency' ? 'active' : ''}>🚨 Emergency</a>
          <a onClick={() => navigateTo('/pharmacy')} className={location.pathname === '/pharmacy' ? 'active' : ''}>💊 Pharmacy</a>
          <a onClick={() => navigateTo('/appointments')} className={location.pathname === '/appointments' ? 'active' : ''}>📅 Appointments</a>
          <a onClick={() => navigateTo('/contact')} className={location.pathname === '/contact' ? 'active' : ''}>📞 Contact & Profile</a>
          <a onClick={() => navigateTo('/about')} className={location.pathname === '/about' ? 'active' : ''}>ℹ️ About Us</a>
          <a onClick={() => setShowAdminLogin(true)} className="admin-btn">🛠️ Admin Panel</a>
          {isAuthenticated ? (
            <a onClick={handleLogout} className="logout-btn">🚪 Logout</a>
          ) : (
            <a onClick={showLoginPage} className="login-btn">🔑 Login</a>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="header-logo">
            <div className="header-classic-logo">
              <div className="header-logo-cross">+</div>
              <span className="header-logo-text">ACE HOSPITAL</span>
            </div>
          </div>
          <h1>{getCurrentPageTitle()}</h1>
        </header>

        <div className="content">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={
              <>
                <section className="hero-section">
                  <div className="hero-content">
                    <h2>Your Health, Our Priority</h2>
                    <p>Providing Excellence in Healthcare Services</p>
                    <a onClick={() => navigateTo('/appointments')} className="cta-btn">Book Appointment Now</a>
                  </div>
                </section>
              <section className="stats-section">
                <div className="stat-card"><h3>500+</h3><p>Expert Doctors</p></div>
                <div className="stat-card"><h3>50,000+</h3><p>Happy Patients</p></div>
                <div className="stat-card"><h3>24/7</h3><p>Emergency Care</p></div>
                <div className="stat-card"><h3>15+</h3><p>Departments</p></div>
              </section>
              <section className="why-choose-ace">
                <h2>Why Choose ACE Hospital?</h2>
                <p className="ace-tagline">"Advanced Care Excellence - Where Compassion Meets Innovation"</p>
                <div className="why-choose-grid">
                  <div className="why-card">
                    <span className="why-icon">🏆</span>
                    <h3>Award-Winning Care</h3>
                    <p>Recognized nationally for excellence in patient care and medical innovation with multiple healthcare awards.</p>
                  </div>
                  <div className="why-card">
                    <span className="why-icon">👨‍⚕️</span>
                    <h3>Expert Medical Team</h3>
                    <p>500+ highly qualified doctors and specialists with international training and decades of experience.</p>
                  </div>
                  <div className="why-card">
                    <span className="why-icon">🏥</span>
                    <h3>State-of-the-Art Facilities</h3>
                    <p>Modern infrastructure with latest medical technology, advanced diagnostic equipment, and comfortable patient rooms.</p>
                  </div>
                  <div className="why-card">
                    <span className="why-icon">⏰</span>
                    <h3>24/7 Emergency Services</h3>
                    <p>Round-the-clock emergency care with rapid response team, fully equipped ambulances, and trauma center.</p>
                  </div>
                  <div className="why-card">
                    <span className="why-icon">💰</span>
                    <h3>Affordable Healthcare</h3>
                    <p>Quality medical care at competitive prices with flexible payment options and insurance acceptance.</p>
                  </div>
                  <div className="why-card">
                    <span className="why-icon">❤️</span>
                    <h3>Patient-Centered Approach</h3>
                    <p>Personalized care plans, compassionate staff, and commitment to patient satisfaction and comfort.</p>
                  </div>
                </div>
              </section>
              <section className="quick-services">
                <h2>Our Services</h2>
                <div className="services-grid">
                  {services.slice(0, 4).map((s, i) => (
                    <div key={i} className="service-box" onClick={() => navigateTo('/services')}>
                      <span className="icon">{s.icon}</span>
                      <h3>{s.title}</h3>
                      <p>{s.desc.substring(0, 30)}...</p>
                    </div>
                  ))}
                </div>
                <a onClick={() => navigateTo('/services')} className="view-all-btn">View All Services →</a>
              </section>
              <section className="quick-access">
                <h2>Quick Access</h2>
                <div className="quick-access-grid">
                  <div className="access-card" onClick={() => navigateTo('/emergency')}>
                    <span className="access-icon">🚨</span>
                    <h3>Emergency</h3>
                    <p>24/7 Emergency Care</p>
                  </div>
                  <div className="access-card" onClick={() => navigateTo('/pharmacy')}>
                    <span className="access-icon">💊</span>
                    <h3>Pharmacy</h3>
                    <p>Order Medicines</p>
                  </div>
                  <div className="access-card" onClick={() => navigateTo('/appointments')}>
                    <span className="access-icon">📅</span>
                    <h3>Book Appointment</h3>
                    <p>Schedule Your Visit</p>
                  </div>
                  <div className="access-card" onClick={() => navigateTo('/contact')}>
                    <span className="access-icon">📞</span>
                    <h3>Contact Us</h3>
                    <p>Get in Touch</p>
                  </div>
                </div>
              </section>
              <section className="testimonials">
                <h2>What Our Patients Say</h2>
                <div className="testimonials-grid">
                  <div className="testimonial-card">
                    <p>"Excellent care and professional staff. The doctors are very knowledgeable and caring."</p>
                    <h4>- Sarah M.</h4>
                  </div>
                  <div className="testimonial-card">
                    <p>"Best hospital in the area. Clean facilities and modern equipment. Highly recommended!"</p>
                    <h4>- John D.</h4>
                  </div>
                  <div className="testimonial-card">
                    <p>"The emergency department saved my life. Quick response and excellent treatment."</p>
                    <h4>- Emily R.</h4>
                  </div>
                </div>
              </section>
              </>
            } />

            {/* Services Page */}
            <Route path="/services" element={
              <>
                <div className="services-header">
                  <h1>Our Medical Services</h1>
                  <p>Comprehensive healthcare solutions with state-of-the-art facilities</p>
                </div>
                <section className="services-detail">
                  {services.map((s, i) => (
                    <div key={i} className="service-card-detail enhanced">
                      <div className="service-header-section">
                        <div className="service-icon-large">{s.icon}</div>
                        <h2>{s.title}</h2>
                      </div>
                      <p className="service-description">{s.desc}</p>
                      <div className="service-features">
                        <h3>Key Features:</h3>
                        <ul>{s.features.map((f, idx) => <li key={idx}>✓ {f}</li>)}</ul>
                      </div>
                      <button className="book-service-btn" onClick={() => navigateTo('/appointments')}>Book Appointment</button>
                    </div>
                  ))}
                </section>
              </>
            } />

            {/* Emergency Page */}
            <Route path="/emergency" element={<InteractiveEmergency currentUser={currentUser} />} />

            {/* Pharmacy Page */}
            <Route path="/pharmacy" element={<SimplePharmacy />} />

            {/* Appointments Page */}
            <Route path="/appointments" element={
              <UnifiedAppointments 
                currentUser={currentUser}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                handleFormChange={handleFormChange}
                validateForm={validateForm}
                availableSlots={availableSlots}
                availableBeds={availableBeds}
                services={services}
              />
            } />





            {/* Contact Page */}
            <Route path="/contact" element={
              <div className="contact-profile-container">
                <section className="contact-section">
                  <h2>Contact Information</h2>
                  <div className="contact-cards">
                    <div className="contact-card"><span className="contact-icon">📍</span><h3>Address</h3><p>123 Healthcare Avenue<br/>Medical District<br/>City, State 12345</p></div>
                    <div className="contact-card"><span className="contact-icon">📞</span><h3>Phone</h3><p>Emergency: (555) 911-HELP<br/>Appointments: (555) 123-4567<br/>General: (555) 987-6543</p></div>
                    <div className="contact-card"><span className="contact-icon">✉️</span><h3>Email</h3><p>info@acehospital.com<br/>appointments@acehospital.com<br/>emergency@acehospital.com</p></div>
                    <div className="contact-card"><span className="contact-icon">🕒</span><h3>Hours</h3><p>Emergency: 24/7<br/>Outpatient: 8AM - 8PM<br/>Visiting: 10AM - 8PM</p></div>
                  </div>
                  <div className="map-container">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841!2d-73.9875!3d40.7589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzMyLjAiTiA3M8KwNTknMTUuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                      width="100%" 
                      height="350" 
                      style={{border:0, borderRadius: '15px'}} 
                      allowFullScreen="" 
                      loading="lazy"
                    ></iframe>
                  </div>
                </section>
                <section className="profile-section">
                  <h2>User Profile</h2>
                  <div className="profile-info">
                    <p><strong>Current User:</strong> {currentUser?.name}</p>
                    <p><strong>Email:</strong> {currentUser?.email}</p>
                  </div>
                  <form onSubmit={handleProfileSubmit} className="profile-form">
                    <div className="form-group"><label>Full Name</label><input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="Enter your name" required /></div>
                    <div className="form-group"><label>Email</label><input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} placeholder="Enter your email" required /></div>
                    <div className="form-group"><label>Phone</label><input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="Enter your phone" required /></div>
                    <div className="form-group"><label>Address</label><textarea value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} rows="3" placeholder="Enter your address"></textarea></div>
                    <button type="submit" className="submit-btn">Save Profile</button>
                  </form>
                </section>
              </div>
            } />

            {/* About Page */}
            <Route path="/about" element={
              <>
                <section className="about-intro">
                  <h2>Welcome to ACE Hospital</h2>
                  <p>For over 25 years, ACE Hospital has been at the forefront of healthcare excellence, providing comprehensive medical services to our community. We combine cutting-edge technology with compassionate care to ensure the best possible outcomes for our patients.</p>
                </section>
              <section className="about-services">
                <h2>Our Comprehensive Services</h2>
                <div className="about-grid">
                  <div className="about-card"><h3>🫀 Cardiology Department</h3><p>State-of-the-art cardiac care with advanced diagnostics, interventional procedures, and 24/7 emergency services for heart conditions.</p></div>
                  <div className="about-card"><h3>🧠 Neurology & Neurosurgery</h3><p>Expert care for brain and nervous system disorders with advanced imaging and surgical capabilities.</p></div>
                  <div className="about-card"><h3>🦴 Orthopedic Services</h3><p>Complete bone and joint care including joint replacement, sports medicine, and rehabilitation services.</p></div>
                  <div className="about-card"><h3>👶 Pediatric Care</h3><p>Specialized healthcare for children with dedicated pediatricians and child-friendly facilities.</p></div>
                  <div className="about-card"><h3>🚨 Emergency Services</h3><p>Round-the-clock emergency care with trauma center, ambulance services, and critical care units.</p></div>
                  <div className="about-card"><h3>🔬 Diagnostic Services</h3><p>Advanced laboratory and imaging services including MRI, CT scan, X-ray, and comprehensive pathology.</p></div>
                </div>
              </section>
              <section className="doctors-section">
                <h2>Our Expert Doctors</h2>
                <div className="doctors-grid">
                  <div className="doctor-card">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80" alt="Dr. John Smith" className="doctor-img" />
                    <div className="doctor-badge">⭐ 4.9</div>
                    <h3>Dr. John Smith</h3><p className="specialty">Chief Cardiologist</p><p>25+ years experience in cardiac care and interventional cardiology.</p>
                    <div className="doctor-stats">
                      <span>👥 2,500+ patients</span>
                      <span>🏆 15 awards</span>
                    </div>
                  </div>
                  <div className="doctor-card">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" alt="Dr. Sarah Johnson" className="doctor-img" />
                    <div className="doctor-badge">⭐ 4.8</div>
                    <h3>Dr. Sarah Johnson</h3><p className="specialty">Head of Neurology</p><p>Expert in stroke management and neurological disorders.</p>
                    <div className="doctor-stats">
                      <span>👥 1,800+ patients</span>
                      <span>🏆 12 awards</span>
                    </div>
                  </div>
                  <div className="doctor-card">
                    <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80" alt="Dr. Michael Chen" className="doctor-img" />
                    <div className="doctor-badge">⭐ 4.7</div>
                    <h3>Dr. Michael Chen</h3><p className="specialty">Orthopedic Surgeon</p><p>Specialist in joint replacement and sports injuries.</p>
                    <div className="doctor-stats">
                      <span>👥 2,200+ patients</span>
                      <span>🏆 10 awards</span>
                    </div>
                  </div>
                  <div className="doctor-card">
                    <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80" alt="Dr. Emily Davis" className="doctor-img" />
                    <div className="doctor-badge">⭐ 4.9</div>
                    <h3>Dr. Emily Davis</h3><p className="specialty">Pediatrician</p><p>Dedicated to child healthcare and development.</p>
                    <div className="doctor-stats">
                      <span>👥 3,000+ patients</span>
                      <span>🏆 8 awards</span>
                    </div>
                  </div>
                </div>
              </section>
              <section className="facilities-section">
                <h2>World-Class Facilities</h2>
                <div className="facilities-grid">
                  <div className="facility-card">
                    <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80" alt="Modern Infrastructure" className="facility-img" />
                    <h3>Modern Infrastructure</h3><p>500+ bed capacity with fully equipped ICU, NICU, and operation theaters</p>
                  </div>
                  <div className="facility-card">
                    <img src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&q=80" alt="Ambulance Services" className="facility-img" />
                    <h3>Ambulance Services</h3><p>24/7 emergency ambulance services with advanced life support systems</p>
                  </div>
                  <div className="facility-card">
                    <img src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80" alt="In-House Pharmacy" className="facility-img" />
                    <h3>In-House Pharmacy</h3><p>Fully stocked pharmacy with all essential and specialized medications</p>
                  </div>
                  <div className="facility-card">
                    <img src="https://images.unsplash.com/photo-1505935428862-770b6f24f629?w=600&q=80" alt="Cafeteria" className="facility-img" />
                    <h3>Cafeteria & Food Services</h3><p>Nutritious meals prepared by expert dietitians for patients and visitors</p>
                  </div>
                </div>
              </section>
              <section className="appointment-info">
                <h2>Appointment System</h2>
                <p>Our advanced appointment system allows you to:</p>
                <ul className="appointment-features">
                  <li>✅ Book appointments online 24/7</li>
                  <li>✅ Choose your preferred doctor and time slot</li>
                  <li>✅ Receive instant confirmation via email</li>
                  <li>✅ Track your appointment history</li>
                  <li>✅ Reschedule or cancel appointments easily</li>
                  <li>✅ Get reminders before your appointment</li>
                </ul>
                <a onClick={() => navigateTo('/appointments')} className="cta-btn">Book Appointment Now</a>
              </section>
              </>
            } />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ACE Hospital</h3>
              <p>Advanced Care Excellence</p>
              <p>Your Health, Our Priority</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <a onClick={() => navigateTo('/')}>🏠 Home</a>
              <a onClick={() => navigateTo('/services')}>🏥 Services</a>
              <a onClick={() => navigateTo('/emergency')}>🚨 Emergency</a>
              <a onClick={() => navigateTo('/pharmacy')}>💊 Pharmacy</a>
              <a onClick={() => navigateTo('/appointments')}>📅 Appointments</a>
              <a onClick={() => navigateTo('/contact')}>📞 Contact</a>
              <a onClick={() => navigateTo('/about')}>ℹ️ About Us</a>
            </div>
            <div className="footer-section">
              <h3>Contact Info</h3>
              <p>📍 123 Healthcare Avenue, Medical District</p>
              <p>📞 Emergency: (555) 911-HELP</p>
              <p>📞 Appointments: (555) 123-4567</p>
              <p>✉️ info@acehospital.com</p>
            </div>
            <div className="footer-section">
              <h3>Services</h3>
              <p>🫀 Cardiology</p>
              <p>🧠 Neurology</p>
              <p>🦴 Orthopedics</p>
              <p>👶 Pediatrics</p>
              <p>🚨 24/7 Emergency</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ACE Hospital. All rights reserved. | Done by Jaswan</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

