import React, { useState, useEffect } from 'react';

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
      const response = await fetch('http://localhost:3002/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        // Fallback data if backend is not available
        setOrders([
          {
            _id: 'order1',
            userName: 'Dr. Rajesh Kumar',
            userPhone: '9876543210',
            userEmail: 'rajesh.kumar@gmail.com',
            orderDate: new Date(),
            status: 'pending',
            deliveryAddress: '123 Medical Colony, Mumbai',
            items: [
              { name: 'Paracetamol', quantity: 2, price: 25, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80' },
              { name: 'Vitamin D3', quantity: 1, price: 180, image: 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=100&q=80' }
            ],
            total: 230
          },
          {
            _id: 'order2',
            userName: 'Mrs. Priya Sharma',
            userPhone: '9123456789',
            userEmail: 'priya.sharma@yahoo.com',
            orderDate: new Date(Date.now() - 86400000),
            status: 'confirmed',
            deliveryAddress: '456 Health Street, Delhi',
            items: [
              { name: 'Cetirizine', quantity: 1, price: 45, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&q=80' },
              { name: 'Amoxicillin', quantity: 2, price: 120, image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&q=80' }
            ],
            total: 285
          },
          {
            _id: 'order3',
            userName: 'Mr. Amit Patel',
            userPhone: '9988776655',
            userEmail: 'amit.patel@hotmail.com',
            orderDate: new Date(Date.now() - 172800000),
            status: 'delivered',
            deliveryAddress: '789 Care Avenue, Bangalore',
            items: [
              { name: 'Omeprazole', quantity: 1, price: 85, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&q=80' }
            ],
            total: 85
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback data if network error
      setOrders([
        {
          _id: 'order1',
          userName: 'John Doe',
          userPhone: '9876543210',
          orderDate: new Date(),
          status: 'pending',
          items: [
            { name: 'Paracetamol', quantity: 2, price: 25 },
            { name: 'Vitamin D3', quantity: 1, price: 180 }
          ],
          total: 230
        },
        {
          _id: 'order2',
          userName: 'Jane Smith',
          userPhone: '9123456789',
          orderDate: new Date(Date.now() - 86400000),
          status: 'confirmed',
          items: [
            { name: 'Cetirizine', quantity: 1, price: 45 }
          ],
          total: 45
        }
      ]);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/medicines');
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      } else {
        // Fallback data if backend is not available
        setMedicines([
          {
            _id: '1',
            name: 'Paracetamol',
            category: 'Pain Relief',
            price: 25,
            stock: 150,
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
            usedFor: 'Pain relief and fever reduction'
          },
          {
            _id: '2',
            name: 'Amoxicillin',
            category: 'Antibiotics',
            price: 120,
            stock: 8,
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&q=80',
            usedFor: 'Bacterial infections treatment'
          },
          {
            _id: '3',
            name: 'Cetirizine',
            category: 'Allergy',
            price: 45,
            stock: 75,
            image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&q=80',
            usedFor: 'Allergy and hay fever relief'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      // Fallback data if network error
      setMedicines([
        {
          _id: '1',
          name: 'Paracetamol',
          category: 'Pain Relief',
          price: 25,
          stock: 150,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
          usedFor: 'Pain relief and fever reduction'
        },
        {
          _id: '2',
          name: 'Amoxicillin',
          category: 'Antibiotics',
          price: 120,
          stock: 8,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&q=80',
          usedFor: 'Bacterial infections treatment'
        },
        {
          _id: '3',
          name: 'Cetirizine',
          category: 'Allergy',
          price: 45,
          stock: 75,
          image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&q=80',
          usedFor: 'Allergy and hay fever relief'
        }
      ]);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:3002/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const updateStock = async (medicineId, newStock) => {
    try {
      const response = await fetch(`http://localhost:3002/api/medicines/${medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (response.ok) {
        fetchMedicines();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const addMedicine = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMedicine,
          price: parseFloat(newMedicine.price),
          stock: parseInt(newMedicine.stock)
        })
      });
      if (response.ok) {
        setNewMedicine({ name: '', category: '', price: '', stock: '', image: '', usedFor: '' });
        setShowAddMedicine(false);
        fetchMedicines();
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };

  const deleteMedicine = async (medicineId) => {
    if (window.confirm('Delete this medicine?')) {
      try {
        const response = await fetch(`http://localhost:3002/api/medicines/${medicineId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchMedicines();
        }
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <h1>📦 Orders & Inventory Management</h1>
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
                      <div className="customer-info">
                        <div className="customer-avatar">👤</div>
                        <div>
                          <p><strong>Customer:</strong> {order.userName}</p>
                          <p><strong>Phone:</strong> {order.userPhone}</p>
                          <p><strong>Email:</strong> {order.userEmail}</p>
                          <p><strong>Address:</strong> {order.deliveryAddress}</p>
                        </div>
                      </div>
                      <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                      <div className="order-items">
                        <strong>Items Ordered:</strong>
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <img src={item.image} alt={item.name} className="item-image" />
                            <div className="item-details">
                              <span className="item-name">{item.name}</span>
                              <span className="item-qty">Qty: {item.quantity}</span>
                              <span className="item-price">₹{item.price} each</span>
                            </div>
                            <div className="item-total">₹{item.price * item.quantity}</div>
                          </div>
                        ))}
                      </div>
                      <div className="order-summary">
                        <div className="summary-row">
                          <span>Subtotal:</span>
                          <span>₹{order.total - 50}</span>
                        </div>
                        <div className="summary-row">
                          <span>Delivery:</span>
                          <span>₹50</span>
                        </div>
                        <div className="order-total">
                          <strong>Total: ₹{order.total.toFixed(2)}</strong>
                        </div>
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
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          border: 1px solid #eee;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .order-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
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

        .customer-info {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .customer-avatar {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e3f2fd;
          border-radius: 50%;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px;
          margin: 8px 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .item-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 6px;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-name {
          font-weight: 600;
          color: #2c3e50;
        }

        .item-qty {
          font-size: 0.9rem;
          color: #666;
        }

        .item-price {
          font-size: 0.9rem;
          color: #27ae60;
        }

        .item-total {
          font-weight: 600;
          color: #27ae60;
          font-size: 1.1rem;
        }

        .order-summary {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #e0e0e0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #666;
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

          .customer-info {
            flex-direction: column;
            text-align: center;
          }

          .order-item {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .item-details {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;