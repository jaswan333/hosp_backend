import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api';

const AdminPharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('active');
  const [activeTab, setActiveTab] = useState('medicines');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchMedicines();
    fetchOrders();
    const interval = setInterval(() => {
      fetchMedicines();
      fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const lowStock = medicines.filter(medicine => medicine.stock < 10);
    setLowStockAlert(lowStock);
  }, [medicines]);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.update(orderId, { status });
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to remove this order from admin view?')) {
      // Remove from local admin view (backend DELETE endpoint not available)
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      alert('Order removed from admin view!');
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/api/medicines');
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingMedicine 
        ? `http://localhost:3002/api/medicines/${editingMedicine._id}`
        : 'http://localhost:3002/api/medicines';
      
      const method = editingMedicine ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        }),
      });

      if (response.ok) {
        fetchMedicines();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const updateStock = async (id, newStock) => {
    try {
      const response = await fetch(`http://localhost:3002/api/medicines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (response.ok) {
        fetchMedicines();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const response = await fetch(`http://localhost:3002/api/medicines/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchMedicines();
        }
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      price: medicine.price.toString(),
      stock: medicine.stock.toString(),
      description: medicine.description,
      image: medicine.image || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      image: ''
    });
    setEditingMedicine(null);
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading medicines...</div>;
  }

  return (
    <div className="admin-pharmacy">
      <div className="admin-header">
        <h1>💊 Pharmacy & Orders Management</h1>
        <div className="header-stats">
          <span>📦 {orders.length} Orders</span>
          <span>💊 {medicines.length} Medicines</span>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'medicines' ? 'active' : ''}`}
          onClick={() => setActiveTab('medicines')}
        >
          💊 Medicines
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
      </div>

      {activeTab === 'medicines' && (
        <>
          {lowStockAlert.length > 0 && (
            <div className="alert-section">
              <h3>⚠️ Low Stock Alerts ({lowStockAlert.length})</h3>
              <div className="alert-grid">
                {lowStockAlert.map(medicine => (
                  <div key={medicine._id} className="alert-card">
                    <span>{medicine.name}</span>
                    <span className="stock-count">{medicine.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-header">
            <h2>Medicine Inventory</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="add-btn">
              {showAddForm ? 'Cancel' : 'Add Medicine'}
            </button>
          </div>
        </>
      )}

      {activeTab === 'medicines' && showAddForm && (
        <div className="add-form">
          <h3>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input type="text" name="name" placeholder="Medicine Name" value={formData.name} onChange={handleInputChange} required />
              <select name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="">Select Category</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Allergy">Allergy</option>
                <option value="Digestive">Digestive</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Cardiac">Cardiac</option>
              </select>
              <input type="number" name="price" placeholder="Price (₹)" value={formData.price} onChange={handleInputChange} required min="0" />
              <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleInputChange} required min="0" />
            </div>
            <input type="url" name="image" placeholder="Image URL (optional)" value={formData.image} onChange={handleInputChange} className="image-url-input" />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="2"></textarea>
            <div className="form-actions">
              <button type="submit" className="save-btn">{editingMedicine ? 'Update' : 'Add'}</button>
              <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'medicines' && (
        <div className="medicines-grid">
          {medicines.map(medicine => (
            <div key={medicine._id} className="medicine-card ecommerce">
              <div className="medicine-image-container">
                <img src={medicine.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80'} alt={medicine.name} className="medicine-img" />
                <div className="medicine-badge">
                  {medicine.stock < 10 ? '⚠️ Low Stock' : '✅ In Stock'}
                </div>
              </div>
              <div className="card-content">
                <h4>{medicine.name}</h4>
                <span className="category">{medicine.category}</span>
                <p className="description">{medicine.description}</p>
                <div className="price-section">
                  <span className="price">₹{medicine.price}</span>
                  <span className="per-unit">per unit</span>
                </div>
                <div className="stock-section">
                  <div className="stock-info">
                    <span className="stock-label">Stock:</span>
                    <span className={`stock-count ${medicine.stock < 10 ? 'low' : ''}`}>{medicine.stock} units</span>
                  </div>
                  <div className="stock-controls">
                    <button onClick={() => updateStock(medicine._id, Math.max(0, medicine.stock - 1))} className="stock-btn minus">-</button>
                    <button onClick={() => updateStock(medicine._id, medicine.stock + 1)} className="stock-btn plus">+</button>
                  </div>
                </div>
                <div className="card-actions">
                  <button onClick={() => handleEdit(medicine)} className="action-btn edit">📝 Edit</button>
                  <button onClick={() => handleDelete(medicine._id)} className="action-btn delete">🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-section">
          <div className="orders-header">
            <h2>📦 Order Management</h2>
            <div className="orders-filter">
              <select className="filter-select" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
                <option value="active">Active Orders</option>
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
          <div className="orders-grid">
            {orders.filter(order => {
              if (orderFilter === 'active') return order.status !== 'delivered';
              if (orderFilter === 'all') return true;
              return order.status === orderFilter;
            }).map(order => (
              <div key={order._id} className="order-card ecommerce">
                <div className="order-header">
                  <div className="order-id">
                    <span className="order-number">#{order._id.slice(-6)}</span>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>
                  <button onClick={() => handleDeleteOrder(order._id)} className="delete-order-btn">×</button>
                </div>
                <div className="customer-section">
                  <div className="customer-avatar">👤</div>
                  <div className="customer-details">
                    <h4>{order.userName}</h4>
                    <p className="customer-phone">📱 {order.userPhone}</p>
                    <p className="order-date">📅 {new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="order-items">
                  <h5>Items Ordered:</h5>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                      <span className="item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="order-summary">
                  <div className="order-total">
                    <span>Total: </span>
                    <span className="total-amount">₹{order.total}</span>
                  </div>
                </div>
                <div className="order-actions">
                  <button onClick={() => updateOrderStatus(order._id, 'confirmed')} disabled={order.status !== 'pending'} className="action-btn confirm">✅ Confirm</button>
                  <button onClick={() => updateOrderStatus(order._id, 'delivered')} disabled={order.status !== 'confirmed'} className="action-btn deliver">🚚 Deliver</button>
                  {order.status === 'delivered' && (
                    <button onClick={() => handleDeleteOrder(order._id)} className="action-btn archive">🗂️ Archive</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-pharmacy {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 12px;
        }

        .admin-header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .add-btn {
          padding: 10px 20px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .alert-section {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .alert-section h3 {
          margin: 0 0 15px 0;
          color: #856404;
        }

        .alert-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }

        .alert-card {
          background: white;
          padding: 10px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid #f39c12;
        }

        .stock-count {
          font-weight: 600;
          color: #e74c3c;
        }

        .add-form {
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .add-form h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-grid input, .form-grid select {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }

        .image-url-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          margin-bottom: 15px;
        }

        .image-url-input:focus {
          border-color: #667eea;
        }

        .form-grid input:focus, .form-grid select:focus {
          border-color: #667eea;
        }

        textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          margin-bottom: 15px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 10px;
        }

        .save-btn {
          padding: 12px 24px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: #95a5a6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .header-stats {
          display: flex;
          gap: 20px;
        }

        .header-stats span {
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
        }

        .tab-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .tab-btn {
          padding: 12px 24px;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          background: #667eea;
          color: white;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .medicines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .medicine-card.ecommerce {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          position: relative;
        }

        .medicine-card.ecommerce:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          border-color: #667eea;
        }

        .medicine-image-container {
          position: relative;
          overflow: hidden;
        }

        .medicine-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .medicine-card.ecommerce:hover .medicine-img {
          transform: scale(1.05);
        }

        .medicine-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
        }

        .card-content {
          padding: 20px;
        }

        .card-content h4 {
          margin: 0 0 8px 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .description {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 8px 0 15px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price-section {
          margin: 15px 0;
        }

        .price {
          font-size: 1.4rem;
          font-weight: 700;
          color: #27ae60;
        }

        .per-unit {
          font-size: 0.8rem;
          color: #666;
          margin-left: 5px;
        }

        .stock-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .stock-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stock-label {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        .stock-count {
          font-weight: 600;
          color: #2e7d32;
        }

        .stock-count.low {
          color: #d32f2f;
        }

        .stock-controls {
          display: flex;
          gap: 8px;
        }

        .stock-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .stock-btn.minus {
          background: #fee;
          color: #d32f2f;
        }

        .stock-btn.plus {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .stock-btn:hover {
          transform: scale(1.1);
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .action-btn.edit {
          background: #e3f2fd;
          color: #1976d2;
        }

        .action-btn.delete {
          background: #ffebee;
          color: #d32f2f;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .orders-filter {
          display: flex;
          gap: 15px;
        }

        .filter-select {
          padding: 8px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          background: white;
          cursor: pointer;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .order-card.ecommerce {
          background: white;
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          overflow: hidden;
        }

        .order-card.ecommerce:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 15px 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-id {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .order-number {
          font-weight: 700;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .order-status {
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .order-status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .order-status.confirmed {
          background: #d4edda;
          color: #155724;
        }

        .order-status.delivered {
          background: #d1ecf1;
          color: #0c5460;
        }

        .delete-order-btn {
          width: 30px;
          height: 30px;
          border: none;
          background: #ffebee;
          color: #d32f2f;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .delete-order-btn:hover {
          background: #d32f2f;
          color: white;
          transform: scale(1.1);
        }

        .customer-section {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: #f8f9fa;
        }

        .customer-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .customer-details h4 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }

        .customer-phone, .order-date {
          margin: 2px 0;
          font-size: 0.85rem;
          color: #666;
        }

        .order-items {
          padding: 15px 20px;
        }

        .order-items h5 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .item-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .item-qty {
          color: #666;
          font-size: 0.9rem;
        }

        .item-price {
          font-weight: 600;
          color: #27ae60;
        }

        .order-summary {
          padding: 15px 20px;
          background: #f8f9fa;
          border-top: 1px solid #f0f0f0;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-amount {
          font-size: 1.3rem;
          font-weight: 700;
          color: #27ae60;
        }

        .order-actions {
          display: flex;
          gap: 10px;
          padding: 20px;
        }

        .action-btn.confirm {
          background: #d4edda;
          color: #155724;
        }

        .action-btn.deliver {
          background: #d1ecf1;
          color: #0c5460;
        }

        .action-btn.archive {
          background: #f8f9fa;
          color: #6c757d;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }



        .status {
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status.confirmed {
          background: #d4edda;
          color: #155724;
        }

        .status.delivered {
          background: #d1ecf1;
          color: #0c5460;
        }

        .order-total {
          font-size: 1.2rem;
          font-weight: 700;
          color: #27ae60;
          margin-top: 10px;
        }

        .order-actions {
          display: flex;
          gap: 8px;
          margin-top: 15px;
        }

        .confirm-btn, .deliver-btn {
          flex: 1;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .confirm-btn {
          background: #28a745;
          color: white;
        }

        .deliver-btn {
          background: #17a2b8;
          color: white;
        }

        .confirm-btn:disabled, .deliver-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .medicine-admin-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #f0f0f0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .medicine-admin-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .medicine-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .medicine-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .medicine-image:hover img {
          transform: scale(1.05);
        }

        .card-header {
          background: #f8f9fa;
          padding: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .card-header h3 {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .category {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .card-body {
          padding: 15px;
        }

        .description {
          color: #666;
          font-size: 0.9rem;
          margin: 0 0 15px 0;
          line-height: 1.4;
        }

        .price {
          font-size: 1.2rem;
          font-weight: 700;
          color: #27ae60;
          margin-bottom: 15px;
        }

        .stock-controls {
          margin-bottom: 15px;
        }

        .stock-controls label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }

        .stock-input {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stock-btn {
          width: 35px;
          height: 35px;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
        }

        .stock-btn:hover {
          background: #667eea;
          color: white;
        }

        .stock-display {
          font-weight: 600;
          font-size: 1.1rem;
          min-width: 40px;
          text-align: center;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .stock-display.low {
          background: #fff3cd;
          color: #856404;
        }

        .status {
          margin-bottom: 15px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.good {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.low {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.out {
          background: #f8d7da;
          color: #721c24;
        }

        .card-actions {
          padding: 15px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 10px;
        }

        .edit-btn {
          flex: 1;
          padding: 8px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .delete-btn {
          flex: 1;
          padding: 8px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .admin-loading {
          text-align: center;
          padding: 50px;
          font-size: 1.2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .medicines-grid, .orders-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          }
          
          .admin-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .header-stats {
            justify-content: center;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }

          .tab-navigation {
            justify-content: center;
          }

          .section-header {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPharmacy;