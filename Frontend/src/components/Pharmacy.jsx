import { useState } from 'react';
import './Pages.css';

function Pharmacy({ cart, setCart }) {
  const medicines = [
    { id: 1, name: 'Paracetamol 500mg', category: 'Pain Relief', price: 5, stock: 'In Stock' },
    { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', price: 12, stock: 'In Stock' },
    { id: 3, name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', price: 8, stock: 'In Stock' },
    { id: 4, name: 'Omeprazole 20mg', category: 'Gastric', price: 10, stock: 'In Stock' },
    { id: 5, name: 'Metformin 500mg', category: 'Diabetes', price: 15, stock: 'In Stock' },
    { id: 6, name: 'Atorvastatin 10mg', category: 'Cholesterol', price: 18, stock: 'In Stock' },
    { id: 7, name: 'Aspirin 75mg', category: 'Cardiac', price: 6, stock: 'In Stock' },
    { id: 8, name: 'Cetirizine 10mg', category: 'Allergy', price: 7, stock: 'In Stock' }
  ];

  const addToCart = (medicine) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      setCart(cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      setCart(cart.filter(item => item.id !== id));
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal > 50 ? 0 : 5;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryCharge + tax;

  return (
    <div className="page-container">
      <div className="pharmacy-header">
        <h1>💊 ACE Pharmacy</h1>
        <p>Your trusted healthcare partner - Quality medicines at affordable prices</p>
      </div>

      <div className="pharmacy-info">
        <div className="info-card">
          <h3>🕒 Operating Hours</h3>
          <p>24/7 Service Available</p>
          <p>Emergency: Always Open</p>
        </div>
        <div className="info-card">
          <h3>📞 Contact</h3>
          <p>Phone: (555) 123-MEDS</p>
          <p>Email: pharmacy@acehospital.com</p>
        </div>
        <div className="info-card">
          <h3>🚚 Home Delivery</h3>
          <p>Free delivery over $50</p>
          <p>Same day delivery available</p>
        </div>
      </div>

      <div className="medicines-section">
        <h2>Available Medicines</h2>
        <div className="medicines-grid">
          {medicines.map((med, i) => (
            <div key={i} className="medicine-card">
              <div className="medicine-icon">💊</div>
              <h3>{med.name}</h3>
              <p className="medicine-category">{med.category}</p>
              <div className="medicine-footer">
                <span className="medicine-price">${med.price}</span>
                <div className="medicine-controls">
                  {cart.find(item => item.id === med.id) ? (
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(med.id, cart.find(item => item.id === med.id).quantity - 1)}>-</button>
                      <span className="qty-display">{cart.find(item => item.id === med.id).quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(med.id, cart.find(item => item.id === med.id).quantity + 1)}>+</button>
                    </div>
                  ) : (
                    <button className="add-to-cart-btn" onClick={() => addToCart(med)}>Add</button>
                  )}
                </div>
              </div>
              {cart.find(item => item.id === med.id) && (
                <div className="in-cart-indicator">
                  ✓ In Cart ({cart.find(item => item.id === med.id).quantity})
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pharmacy-services">
        <h2>Our Services</h2>
        <div className="services-list">
          <div className="service-item">✅ Prescription Filling</div>
          <div className="service-item">✅ Medicine Home Delivery</div>
          <div className="service-item">✅ Health Consultations</div>
          <div className="service-item">✅ Vaccination Services</div>
          <div className="service-item">✅ Medical Equipment</div>
          <div className="service-item">✅ Insurance Accepted</div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="cart-section">
          <h2>🛍️ Shopping Cart ({cart.length} items)</h2>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="cart-item-category">{item.category}</p>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>×</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="summary-row"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>Delivery Charge:</span><span>{deliveryCharge === 0 ? 'FREE' : `$${deliveryCharge.toFixed(2)}`}</span></div>
            <div className="summary-row"><span>Tax (8%):</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-total"><span>Total:</span><span>${total.toFixed(2)}</span></div>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pharmacy;
