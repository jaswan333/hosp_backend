import React, { useState, useEffect } from 'react';
import { medicineAPI, ordersAPI } from '../api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '', category: '', price: '', stock: '', image: '', usedFor: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchMedicines()]);
      setLoading(false);
    };
    loadData();
    
    const interval = setInterval(() => {
      fetchOrders();
      fetchMedicines();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      console.log('Orders fetched:', data?.length || 0);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchMedicines = async () => {
    try {
      const data = await medicineAPI.getAll();
      console.log('Medicines fetched:', data?.length || 0);
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicines([]);
    }
  };

  const seedSampleMedicines = async () => {
    const sampleMedicines = [
      {
        name: 'Paracetamol 500mg',
        category: 'Pain Relief',
        price: 25,
        stock: 150,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=150&fit=crop',
        usedFor: 'Fever, headache, body pain'
      },
      {
        name: 'Amoxicillin 250mg',
        category: 'Antibiotic',
        price: 45,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=200&h=150&fit=crop',
        usedFor: 'Bacterial infections'
      },
      {
        name: 'Cetirizine 10mg',
        category: 'Allergy',
        price: 35,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
        usedFor: 'Allergies, skin rash'
      },
      {
        name: 'Omeprazole 20mg',
        category: 'Digestive',
        price: 55,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=200&h=150&fit=crop',
        usedFor: 'Acidity, stomach ulcers'
      },
      {
        name: 'Vitamin D3 1000IU',
        category: 'Vitamins',
        price: 120,
        stock: 90,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop',
        usedFor: 'Bone health, immunity'
      },
      {
        name: 'Metformin 500mg',
        category: 'Diabetes',
        price: 65,
        stock: 70,
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=150&fit=crop',
        usedFor: 'Type 2 diabetes'
      },
      {
        name: 'Aspirin 75mg',
        category: 'Heart Care',
        price: 30,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=200&h=150&fit=crop',
        usedFor: 'Heart protection, blood thinner'
      },
      {
        name: 'Ibuprofen 400mg',
        category: 'Pain Relief',
        price: 40,
        stock: 85,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=150&fit=crop',
        usedFor: 'Pain, inflammation, fever'
      },
      {
        name: 'Loratadine 10mg',
        category: 'Allergy',
        price: 50,
        stock: 55,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
        usedFor: 'Seasonal allergies, hay fever'
      }
    ];

    try {
      for (const medicine of sampleMedicines) {
        await medicineAPI.create(medicine);
      }
      console.log('Sample medicines added successfully');
    } catch (error) {
      console.error('Error adding sample medicines:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.update(orderId, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const updateStock = async (medicineId, newStock) => {
    try {
      await medicineAPI.update(medicineId, { stock: newStock });
      fetchMedicines();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const addMedicine = async () => {
    try {
      await medicineAPI.create({
        ...newMedicine,
        price: parseFloat(newMedicine.price),
        stock: parseInt(newMedicine.stock)
      });
      setNewMedicine({ name: '', category: '', price: '', stock: '', image: '', usedFor: '' });
      setShowAddMedicine(false);
      fetchMedicines();
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };

  const deleteMedicine = async (medicineId) => {
    if (window.confirm('Delete this medicine?')) {
      try {
        await medicineAPI.delete(medicineId);
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <h1>🏥 Admin Dashboard</h1>
        <div className="stats">
          <span>📦 {orders.length} Orders</span>
          <span>💊 {medicines.length} Medicines</span>
        </div>
      </div>

      <div className="content-sections">
        <div className="orders-section">
          <div className="section-header">
            <h2>📋 Recent Orders</h2>
            <span className="count-badge">{orders.length}</span>
          </div>
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                </div>
                <div className="order-details">
                  <div className="customer-info">
                    <p><span className="icon">👤</span> {order.userName}</p>
                    <p><span className="icon">📞</span> {order.userPhone}</p>
                    <p><span className="icon">📅</span> {new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="order-items">
                    <h4>Items:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">×{item.quantity}</span>
                        <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>Total: ₹{order.total.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="order-actions">
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'confirmed')}
                    disabled={order.status !== 'pending'}
                    className="btn-confirm"
                  >
                    ✓ Confirm
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    disabled={order.status !== 'confirmed'}
                    className="btn-deliver"
                  >
                    🚚 Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="medicines-section">
          <div className="section-header">
            <h2>💊 Medicine Inventory</h2>
            <div className="header-actions">
              <span className="count-badge">{medicines.length}</span>
              <button onClick={() => setShowAddMedicine(true)} className="btn-add">
                + Add Medicine
              </button>
            </div>
          </div>
          <div className="medicines-grid">
            {medicines.map(medicine => (
              <div key={medicine._id} className="medicine-card">
                <div className="medicine-image">
                  <img src={medicine.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=150&fit=crop'} alt={medicine.name} />
                  <div className="category-tag">{medicine.category}</div>
                </div>
                <div className="medicine-info">
                  <h3>{medicine.name}</h3>
                  <p className="usage">{medicine.usedFor}</p>
                  <div className="price-stock">
                    <span className="price">₹{medicine.price}</span>
                    <span className={`stock ${medicine.stock < 10 ? 'low' : medicine.stock < 20 ? 'medium' : 'high'}`}>
                      Stock: {medicine.stock}
                    </span>
                  </div>
                  <div className="stock-controls">
                    <button 
                      onClick={() => updateStock(medicine._id, Math.max(0, medicine.stock - 1))}
                      className="btn-stock minus"
                      disabled={medicine.stock === 0}
                    >
                      −
                    </button>
                    <span className="stock-display">{medicine.stock}</span>
                    <button 
                      onClick={() => updateStock(medicine._id, medicine.stock + 1)}
                      className="btn-stock plus"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => deleteMedicine(medicine._id)}
                    className="btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddMedicine && (
        <div className="modal" onClick={() => setShowAddMedicine(false)}>
          <div className="add-medicine-modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Medicine</h2>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Medicine Name"
                value={newMedicine.name}
                onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
              />
              <select
                value={newMedicine.category}
                onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
              >
                <option value="">Select Category</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Heart Care">Heart Care</option>
                <option value="Allergy">Allergy</option>
                <option value="Digestive">Digestive</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Diabetes">Diabetes</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={newMedicine.price}
                onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
              />
              <input
                type="number"
                placeholder="Stock"
                value={newMedicine.stock}
                onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
              />
              <input
                type="url"
                placeholder="Image URL"
                value={newMedicine.image}
                onChange={(e) => setNewMedicine({...newMedicine, image: e.target.value})}
              />
              <input
                type="text"
                placeholder="Used For"
                value={newMedicine.usedFor}
                onChange={(e) => setNewMedicine({...newMedicine, usedFor: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddMedicine(false)}>Cancel</button>
              <button onClick={addMedicine}>Add Medicine</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-orders {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .content-sections {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 3px solid #e9ecef;
        }

        .section-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .count-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .btn-add {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }

        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 10px;
        }

        .stats {
          display: flex;
          gap: 20px;
        }

        .stats span {
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 20px;
        }

        .orders-section, .medicines-section {
          margin-bottom: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-actions {
          display: flex;
          gap: 10px;
        }

        .add-btn, .seed-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .seed-btn {
          background: #2196F3;
        }

        .add-btn:hover, .seed-btn:hover {
          opacity: 0.9;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 25px;
        }

        .order-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .order-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .order-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f8f9fa;
        }

        .order-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.pending {
          background: linear-gradient(135deg, #ffc107, #ff8f00);
          color: white;
        }

        .status-badge.confirmed {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }

        .status-badge.delivered {
          background: linear-gradient(135deg, #17a2b8, #6f42c1);
          color: white;
        }

        .customer-info {
          margin-bottom: 20px;
        }

        .customer-info p {
          margin: 8px 0;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          color: #495057;
        }

        .icon {
          margin-right: 8px;
          font-size: 1rem;
        }

        .order-items {
          margin: 20px 0;
        }

        .order-items h4 {
          margin: 0 0 10px 0;
          color: #6c757d;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-item {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 10px 15px;
          margin: 8px 0;
          border-radius: 8px;
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid #667eea;
        }

        .item-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .item-qty {
          background: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .item-price {
          font-weight: 600;
          color: #28a745;
        }

        .order-total {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #f8f9fa;
          text-align: right;
        }

        .order-total strong {
          color: #28a745;
          font-size: 1.1rem;
        }

        .order-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-confirm, .btn-deliver {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .btn-confirm {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .btn-deliver {
          background: linear-gradient(135deg, #17a2b8, #6f42c1);
          color: white;
          box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
        }

        .btn-confirm:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }

        .btn-deliver:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(23, 162, 184, 0.4);
        }

        .btn-confirm:disabled, .btn-deliver:disabled {
          background: #dee2e6;
          color: #6c757d;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .medicines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
        }

        .medicine-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .medicine-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .medicine-image {
          position: relative;
          height: 150px;
          overflow: hidden;
        }

        .medicine-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .medicine-card:hover .medicine-image img {
          transform: scale(1.05);
        }

        .category-tag {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .medicine-info {
          padding: 20px;
        }

        .medicine-info h3 {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .usage {
          color: #6c757d;
          font-size: 0.9rem;
          margin: 0 0 15px 0;
          line-height: 1.4;
        }

        .price-stock {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .price {
          font-weight: 600;
          color: #28a745;
          font-size: 1.1rem;
        }

        .stock {
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .stock.high {
          background: #d4edda;
          color: #155724;
        }

        .stock.medium {
          background: #fff3cd;
          color: #856404;
        }

        .stock.low {
          background: #f8d7da;
          color: #721c24;
        }

        .stock-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .btn-stock {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-weight: bold;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .btn-stock.minus {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
        }

        .btn-stock.plus {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }

        .btn-stock:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .btn-stock:disabled {
          background: #dee2e6;
          color: #6c757d;
          cursor: not-allowed;
        }

        .stock-display {
          font-weight: 600;
          font-size: 1.2rem;
          color: #2c3e50;
          min-width: 40px;
          text-align: center;
        }



        .btn-delete {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
        }

        .btn-delete:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .add-medicine-modal {
          background: white;
          border-radius: 10px;
          padding: 20px;
          width: 90%;
          max-width: 500px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .form-grid input, .form-grid select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .form-grid input:nth-child(5), .form-grid input:nth-child(6) {
          grid-column: 1 / -1;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .modal-actions button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .modal-actions button:first-child {
          background: #ccc;
          color: white;
        }

        .modal-actions button:last-child {
          background: #4CAF50;
          color: white;
        }

        @media (max-width: 768px) {
          .admin-orders {
            padding: 15px;
          }

          .admin-header {
            flex-direction: column;
            gap: 15px;
            padding: 20px 15px;
          }
          
          .stats {
            flex-direction: column;
            gap: 10px;
            width: 100%;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .orders-grid, .medicines-grid {
            grid-template-columns: 1fr;
          }

          .order-card, .medicine-card {
            margin-bottom: 20px;
          }

          .order-actions {
            flex-direction: column;
            gap: 10px;
          }

          .btn-confirm, .btn-deliver {
            width: 100%;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }

          .price-stock {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .orders-grid {
            grid-template-columns: 1fr;
          }

          .medicines-grid {
            grid-template-columns: 1fr;
          }

          .order-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }

          .stock-controls {
            gap: 10px;
          }

          .btn-stock {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;