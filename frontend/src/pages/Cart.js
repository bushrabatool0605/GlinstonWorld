// src/pages/Cart.js — REPLACE

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, imgPlaceholder } from '../utils/helpers';
import GoHome from '../components/common/GoHome '; 
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeItem, loading } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  // Delivery: highest per-product charge
  const deliveryCharge = cart.items?.length
    ? Math.max(...cart.items.map(i => i.deliveryCharge ?? 200))
    : 200;

  const total = cart.totalAmount + deliveryCharge;

  if (!user) return (
    <div className="page">
      <div className="container empty-state" style={{ paddingTop: 60 }}>
        <div className="empty-icon">🔒</div>
        <h3>Login to view cart</h3>
        <p>Please login to access your shopping cart</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
        <GoHome />
      </div>
    </div>
  );

  if (cart.items.length === 0) return (
    <div className="page">
      <div className="container empty-state" style={{ paddingTop: 60 }}>
        <div className="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started</p>
        <Link to="/products" className="btn btn-primary">
          <FiShoppingBag size={15} /> Browse Products
        </Link>
        <GoHome />
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <h1 className="cart-title">
          Cart
          <span className="cart-count-label">
            ({cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''})
          </span>
        </h1>

        <div className="cart-layout">

          {/* Items */}
          <div className="card cart-items-card">
            {cart.items.map(item => (
              <div key={item.productId} className="cart-item">
                <img
                  src={item.productImage || imgPlaceholder(item.productName)}
                  alt={item.productName}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <p className="cart-item-name">{item.productName}</p>
                  <p className="cart-item-price">{formatPrice(item.price)} each</p>
                </div>

                <div className="cart-item-right">
                  <div className="qty-ctrl">
                    <button className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}>
                      <FiMinus size={12} />
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={loading}>
                      <FiPlus size={12} />
                    </button>
                  </div>
                  <p className="cart-subtotal">{formatPrice(item.subtotal)}</p>
                  <button className="remove-btn" onClick={() => removeItem(item.productId)} disabled={loading} aria-label="Remove item">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary card">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="summary-sep" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg checkout-btn" onClick={() => navigate('/checkout')}>
              Checkout <FiArrowRight size={16} />
            </button>
            <Link to="/products" className="continue-link">← Continue Shopping</Link>
          </div>
        </div>

        <GoHome />
      </div>
    </div>
  );
};

export default Cart;