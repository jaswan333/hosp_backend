import React, { useState, useEffect } from 'react';
import { medicineAPI, ordersAPI } from '../api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '', category: '', price: '', stock: '', image: '', usedFor: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchMedicines();
    const interval = setInterval(() => {
      fetchOrders();
      fetchMedicines();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchMedicines = async () => {
    try {
      const data = await medicineAPI.getAll();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      // Fallback data when API fails
      setMedicines([
        {
          _id: '1',
          name: 'Paracetamol 500mg',
          category: 'Pain Relief',
          price: 25,
          stock: 150,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=150&fit=crop',
          usedFor: 'Fever, headache, body pain'
        },
        {
          _id: '2',
          name: 'Amoxicillin 250mg',
          category: 'Antibiotic',
          price: 45,
          stock: 80,
          image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=200&h=150&fit=crop',
          usedFor: 'Bacterial infections'
        },
        {
          _id: '3',
          name: 'Cetirizine 10mg',
          category: 'Allergy',
          price: 45,
          stock: 60,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
          usedFor: 'Allergies, skin rash'
        }
      ]);
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

      <div className="dashboard-tabs">
        <div className="tab-content">
          <div className="orders-section">
            <h2>📋 Recent Orders</h2>
            {orders.length === 0 ? (
              <p>No orders yet</p>
            ) : (
              <div className="orders-grid">
                {orders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <span className={`status ${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-details">
                      <p><strong>Customer:</strong> {order.userName}</p>
                      <p><strong>Phone:</strong> {order.userPhone}</p>
                      <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                      <div className="order-items">
                        <strong>Items:</strong>
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            {item.name} × {item.quantity} = ₹{item.price * item.quantity}
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
                        className="confirm-btn"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                        disabled={order.status !== 'confirmed'}
                        className="deliver-btn"
                      >
                        Delivered
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="medicines-section">
            <div className="section-header">
              <h2>💊 Medicine Inventory</h2>
              <button onClick={() => setShowAddMedicine(true)} className="add-btn">
                + Add Medicine
              </button>
            </div>
            
            <div className="medicines-grid">
              {medicines.map(medicine => (
                <div key={medicine._id} className="medicine-card">
                  <img src={medicine.image} alt={medicine.name} />
                  <div className="medicine-info">
                    <h3>{medicine.name}</h3>
                    <p className="used-for">{medicine.usedFor}</p>
                    <div className="price">₹{medicine.price}</div>
                    <div className="stock-controls">
                      <button onClick={() => updateStock(medicine._id, Math.max(0, medicine.stock - 1))}>
                        -
                      </button>
                      <span className={`stock ${medicine.stock < 10 ? 'low' : ''}`}>
                        {medicine.stock}
                      </span>
                      <button onClick={() => updateStock(medicine._id, medicine.stock + 1)}>
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => deleteMedicine(medicine._id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
          font-family: Arial, sans-serif;
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

        .add-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .order-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #eee;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .status {
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: bold;
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

        .order-details p {
          margin: 5px 0;
          font-size: 0.9rem;
        }

        .order-items {
          margin: 10px 0;
        }

        .order-item {
          background: #f8f9fa;
          padding: 5px 10px;
          margin: 2px 0;
          border-radius: 3px;
          font-size: 0.8rem;
        }

        .order-total {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #eee;
          color: #4CAF50;
        }

        .order-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .confirm-btn, .deliver-btn {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
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

        .medicines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .medicine-card {
          background: white;
          border-radius: 10px;
          padding: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #eee;
        }

        .medicine-card img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .medicine-info h3 {
          margin: 0 0 5px 0;
          font-size: 1rem;
        }

        .used-for {
          color: #666;
          font-size: 0.8rem;
          margin: 0 0 10px 0;
        }

        .price {
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10px;
        }

        .stock-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .stock-controls button {
          width: 30px;
          height: 30px;
          border: 1px solid #4CAF50;
          background: white;
          color: #4CAF50;
          border-radius: 50%;
          cursor: pointer;
          font-weight: bold;
        }

        .stock {
          font-weight: bold;
          min-width: 30px;
          text-align: center;
          padding: 5px 10px;
          border-radius: 15px;
          background: #e8f5e8;
          color: #2e7d32;
        }

        .stock.low {
          background: #fff3cd;
          color: #856404;
        }

        .delete-btn {
          width: 100%;
          padding: 8px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.8rem;
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
          .admin-header {
            flex-direction: column;
            gap: 15px;
          }
          
          .stats {
            flex-direction: column;
            gap: 10px;
          }
          
          .orders-grid, .medicines-grid {
            grid-template-columns: 1fr;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;