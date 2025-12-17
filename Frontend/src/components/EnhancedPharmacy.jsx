import { useState, useEffect } from 'react';
import { medicineAPI } from '../api';

const EnhancedPharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const medicineImages = {
    'Paracetamol': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc9suBYMBhhVJZuRH8C3ZcH3Yv1BC_areCtw&s',
    'Amoxicillin': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSHe7UGYpUakywB6bJKcfzeWnxI3upbqkOQ&s',
    'Cetirizine': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=150&fit=crop',
    'Omeprazole': 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=200&h=150&fit=crop',
    'Vitamin D3': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=200&h=150&fit=crop',
    'Aspirin': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=150&fit=crop',
    'Ibuprofen': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
    'Metformin': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=150&fit=crop',
    'Losartan': 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=200&h=150&fit=crop',
    'Atorvastatin': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=200&h=150&fit=crop'
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item._id === medicine._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === medicine._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item._id !== medicineId));
    } else {
      setCart(cart.map(item => 
        item._id === medicineId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(medicines.map(med => med.category))];

  if (loading) {
    return <div className="pharmacy-loading">Loading medicines...</div>;
  }

  return (
    <div className="pharmacy-container">
      <div className="pharmacy-header">
        <h1>💊 ACE Pharmacy</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pharmacy-layout">
        <div className="medicines-grid">
          {filteredMedicines.map(medicine => (
            <div key={medicine._id} className="medicine-card">
              <img 
                src={medicineImages[medicine.name] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=150&fit=crop'} 
                alt={medicine.name}
                className="medicine-image"
              />
              <div className="medicine-content">
                <h3>{medicine.name}</h3>
                <span className="category">{medicine.category}</span>
                <p className="description">{medicine.description}</p>
                <div className="medicine-footer">
                  <span className="price">₹{medicine.price}</span>
                  <span className={`stock ${medicine.stock < 10 ? 'low' : ''}`}>
                    {medicine.stock} left
                  </span>
                </div>
                <button 
                  onClick={() => addToCart(medicine)}
                  disabled={medicine.stock === 0}
                  className="add-btn"
                >
                  {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="cart-sidebar">
            <h3>Cart ({cart.length})</h3>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item._id} className="cart-item">
                  <span className="item-name">{item.name}</span>
                  <div className="item-controls">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <span className="item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <strong>Total: ₹{getTotalPrice()}</strong>
              <button className="checkout-btn">Checkout</button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .pharmacy-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .pharmacy-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .pharmacy-header h1 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: 2.5rem;
        }

        .search-bar {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .search-bar input {
          padding: 12px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 25px;
          font-size: 16px;
          width: 300px;
          outline: none;
        }

        .search-bar select {
          padding: 12px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 25px;
          font-size: 16px;
          outline: none;
        }

        .pharmacy-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 30px;
        }

        .medicines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .medicine-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #f0f0f0;
        }

        .medicine-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .medicine-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-bottom: 1px solid #f0f0f0;
        }

        .medicine-content {
          padding: 15px;
        }

        .medicine-content h3 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .category {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .description {
          color: #666;
          font-size: 0.9rem;
          margin: 10px 0;
          line-height: 1.4;
        }

        .medicine-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0;
        }

        .price {
          font-size: 1.2rem;
          font-weight: 700;
          color: #27ae60;
        }

        .stock {
          font-size: 0.8rem;
          color: #666;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .stock.low {
          background: #fff3cd;
          color: #856404;
        }

        .add-btn {
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .add-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .add-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .cart-sidebar {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .cart-sidebar h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }

        .cart-items {
          max-height: 400px;
          overflow-y: auto;
        }

        .cart-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .item-name {
          font-size: 0.9rem;
          font-weight: 500;
          flex: 1;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 10px;
        }

        .item-controls button {
          width: 25px;
          height: 25px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .item-price {
          font-weight: 600;
          color: #27ae60;
        }

        .cart-total {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
          text-align: center;
        }

        .cart-total strong {
          display: block;
          margin-bottom: 15px;
          font-size: 1.2rem;
          color: #2c3e50;
        }

        .checkout-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
        }

        .pharmacy-loading {
          text-align: center;
          padding: 50px;
          font-size: 1.2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .pharmacy-layout {
            grid-template-columns: 1fr;
          }
          
          .medicines-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
          
          .search-bar {
            flex-direction: column;
            align-items: center;
          }
          
          .search-bar input {
            width: 100%;
            max-width: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedPharmacy;