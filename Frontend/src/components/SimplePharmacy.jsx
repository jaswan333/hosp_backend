import React, { useState, useEffect } from 'react';

const SimplePharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });

  const commonMedicines = [
    {
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      price: 25,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop',
      usedFor: 'Fever, headache, body pain'
    },
    {
      name: 'Aspirin 75mg',
      category: 'Heart Care',
      price: 30,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop',
      usedFor: 'Heart protection, blood thinning'
    },
    {
      name: 'Cetirizine 10mg',
      category: 'Allergy',
      price: 45,
      stock: 60,
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=150&h=150&fit=crop',
      usedFor: 'Allergies, skin rash, cold'
    },
    {
      name: 'Omeprazole 20mg',
      category: 'Digestive',
      price: 65,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=150&h=150&fit=crop',
      usedFor: 'Acidity, stomach ulcer'
    },
    {
      name: 'Vitamin D3',
      category: 'Vitamins',
      price: 120,
      stock: 90,
      image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=150&h=150&fit=crop',
      usedFor: 'Bone health, immunity'
    },
    {
      name: 'Metformin 500mg',
      category: 'Diabetes',
      price: 85,
      stock: 70,
      image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=150&h=150&fit=crop',
      usedFor: 'Type 2 diabetes control'
    }
  ];

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await fetch('https://hosp-backend-qz1z.onrender.com/api/medicines');
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.length > 0 ? data : commonMedicines);
      } else {
        setMedicines(commonMedicines);
      }
    } catch (error) {
      setMedicines(commonMedicines);
    }
  };

  const addToCart = (medicine) => {
    const medicineId = medicine._id || medicine.name;
    const existing = cart.find(item => item._id === medicineId);
    if (existing) {
      setCart(cart.map(item => 
        item._id === medicineId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, _id: medicineId, quantity: 1 }]);
    }
  };

  const removeFromCart = (medicineId) => {
    const existing = cart.find(item => item._id === medicineId);
    if (existing && existing.quantity === 1) {
      setCart(cart.filter(item => item._id !== medicineId));
    } else if (existing) {
      setCart(cart.map(item => 
        item._id === medicineId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    return { subtotal, gst, total: subtotal + gst };
  };

  const placeOrder = async () => {
    if (!userInfo.name || !userInfo.phone) {
      alert('Please fill in your name and phone number');
      return;
    }
    
    try {
      const orderData = {
        userName: userInfo.name,
        userPhone: userInfo.phone,
        items: cart.map(item => ({
          medicineId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      console.log('Placing order:', orderData);
      
      const response = await fetch('https://hosp-backend-qz1z.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Order response:', result);
        alert('Order placed successfully!');
        setCart([]);
        setShowCart(false);
        setShowCheckout(false);
        setUserInfo({ name: '', phone: '' });
        fetchMedicines();
      } else {
        const errorText = await response.text();
        console.error('Order error response:', errorText);
        alert('Error placing order. Please try again.');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Error placing order: ' + error.message);
    }
  };

  const { subtotal, gst, total } = getCartTotal();

  return (
    <div className="pharmacy">
      <div className="header">
        <h1>💊 ACE Pharmacy</h1>
        <button onClick={() => setShowCart(true)} className="cart-btn">
          🛒 Cart ({cart.length})
        </button>
      </div>

      <div className="medicines-grid">
        {medicines.map((medicine, index) => {
          const medicineId = medicine._id || medicine.name;
          return (
          <div key={medicineId} className="medicine-card">
            <img src={medicine.image} alt={medicine.name} />
            <div className="medicine-info">
              <h3>{medicine.name}</h3>
              <p className="used-for">{medicine.usedFor}</p>
              <div className="details">
                <span className="price">₹{medicine.price}</span>
                <span className="stock">Stock: {medicine.stock}</span>
              </div>
              <div className="cart-controls">
                {cart.find(item => item._id === medicineId) ? (
                  <div className="quantity-controls">
                    <button onClick={() => removeFromCart(medicineId)}>-</button>
                    <span>{cart.find(item => item._id === medicineId)?.quantity}</span>
                    <button onClick={() => addToCart(medicine)}>+</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(medicine)}
                    disabled={medicine.stock === 0}
                    className="add-btn"
                  >
                    {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {showCart && (
        <div className="modal" onClick={() => setShowCart(false)}>
          <div className="cart-modal" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Shopping Cart</h2>
              <button onClick={() => setShowCart(false)}>×</button>
            </div>
            
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item._id} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p>₹{item.price} × {item.quantity}</p>
                      </div>
                      <div className="item-controls">
                        <button onClick={() => removeFromCart(item._id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                      <span className="item-total">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST (18%):</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => setShowCheckout(true)}
                    className="checkout-btn"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="modal">
          <div className="checkout-modal">
            <h2>Checkout</h2>
            <div className="checkout-form">
              <input
                type="text"
                placeholder="Your Name"
                value={userInfo.name}
                onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
              />
              <div className="order-summary">
                <h3>Order Summary</h3>
                {cart.map(item => (
                  <div key={item._id} className="order-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="order-total">Total: ₹{total.toFixed(2)}</div>
              </div>
              <div className="checkout-actions">
                <button onClick={() => setShowCheckout(false)}>Cancel</button>
                <button 
                  onClick={placeOrder}
                  disabled={!userInfo.name || !userInfo.phone}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .pharmacy {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          border-radius: 10px;
        }

        .cart-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid white;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
        }

        .medicines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .medicine-info h3 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 1.1rem;
        }

        .used-for {
          color: #666;
          font-size: 0.9rem;
          margin: 0 0 10px 0;
        }

        .details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .price {
          font-weight: bold;
          color: #4CAF50;
          font-size: 1.1rem;
        }

        .stock {
          color: #666;
          font-size: 0.9rem;
        }

        .add-btn {
          width: 100%;
          padding: 10px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .add-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .quantity-controls button {
          width: 30px;
          height: 30px;
          border: 1px solid #4CAF50;
          background: white;
          color: #4CAF50;
          border-radius: 50%;
          cursor: pointer;
          font-weight: bold;
        }

        .quantity-controls span {
          font-weight: bold;
          min-width: 20px;
          text-align: center;
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

        .cart-modal, .checkout-modal {
          background: white;
          border-radius: 10px;
          padding: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .cart-header button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }

        .cart-item img {
          width: 50px;
          height: 50px;
          border-radius: 5px;
          object-fit: cover;
        }

        .item-info {
          flex: 1;
        }

        .item-info h4 {
          margin: 0;
          font-size: 0.9rem;
        }

        .item-info p {
          margin: 0;
          color: #666;
          font-size: 0.8rem;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .item-controls button {
          width: 25px;
          height: 25px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 3px;
          cursor: pointer;
        }

        .item-total {
          font-weight: bold;
          color: #4CAF50;
        }

        .cart-summary {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #eee;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .summary-row.total {
          font-weight: bold;
          font-size: 1.1rem;
          color: #4CAF50;
        }

        .checkout-btn {
          width: 100%;
          padding: 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 10px;
        }

        .checkout-form input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }

        .order-summary {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .order-total {
          font-weight: bold;
          font-size: 1.1rem;
          color: #4CAF50;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }

        .checkout-actions {
          display: flex;
          gap: 10px;
        }

        .checkout-actions button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .checkout-actions button:first-child {
          background: #ccc;
          color: white;
        }

        .checkout-actions button:last-child {
          background: #4CAF50;
          color: white;
        }

        .checkout-actions button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .medicines-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
          
          .header {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default SimplePharmacy;