// src/pages/Checkout.js — REPLACE

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiTruck, FiSmartphone, FiCreditCard } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import { formatPrice } from '../utils/helpers';
import { Spinner } from '../components/common/Spinner';
import toast from 'react-hot-toast';
import './Checkout.css';

const PROVINCES = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
  'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir',
];

const PAYMENT_METHODS = [
  {
    id:          'cod',
    name:        'Cash on Delivery',
    description: 'Pay cash when your order arrives',
    icon:        <FiTruck size={18} />,
    color:       '#10b981',
    bg:          '#d1fae5',
  },
  {
    id:          'jazzcash',
    name:        'JazzCash',
    description: 'Pay via JazzCash mobile wallet',
    icon:        <FiSmartphone size={18} />,
    color:       '#d97706',
    bg:          '#fef3c7',
  },
  {
    id:          'easypaisa',
    name:        'Easypaisa',
    description: 'Pay via Easypaisa mobile wallet',
    icon:        <FiSmartphone size={18} />,
    color:       '#059669',
    bg:          '#d1fae5',
  },
  {
    id:          'safepay',
    name:        'Debit / Credit Card',
    description: 'Visa or Mastercard via Safepay',
    icon:        <FiCreditCard size={18} />,
    color:       '#6366f1',
    bg:          '#eef2ff',
  },
];

const STEPS = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [selectedPayment, setPayment] = useState('cod');

  const [shipping, setShipping] = useState({
    name: '', phone: '', street: '', city: '',
    province: 'Punjab', postalCode: '', country: 'Pakistan',
  });

  /**
   * Per-product delivery charge calculation.
   *
   * Each product has its own deliveryCharge set by admin.
   * We take the HIGHEST delivery charge across all cart items.
   * This is the same logic used in the backend order_service.py
   *
   * Example:
   *   Product A: deliveryCharge = 150
   *   Product B: deliveryCharge = 250
   *   Cart delivery = 250 (highest)
   *
   * If a product has no deliveryCharge, fallback to 200.
   */
  const deliveryCharge = useMemo(() => {
    if (!cart.items || cart.items.length === 0) return 200;
    let max = 0;
    for (const item of cart.items) {
      const charge = item.deliveryCharge ?? item.price * 0 + 200; // fallback 200
      if (charge > max) max = charge;
    }
    return max;
  }, [cart.items]);

  const subtotal   = cart.totalAmount;
  const orderTotal = subtotal + deliveryCharge;

  const handleChange = e =>
    setShipping(s => ({ ...s, [e.target.name]: e.target.value }));

  const validateShipping = () =>
    ['name', 'phone', 'street', 'city', 'postalCode'].every(k => shipping[k].trim().length > 0);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res   = await orderAPI.place({ shippingAddress: shipping, 
      paymentMethod: selectedPayment });
      console.log("FULL RES:", res);
      console.log("RES.DATA:", res.data);
      console.log("RES.DATA.DATA:", res.data?.data);
      const order = res.data;   
      if (selectedPayment === 'cod') {
        navigate('/orders', { state: { success: true, cod: true } });
        await clearCart();
        return;
                }


      if (order.redirectUrl) {
        toast.success('Redirecting to payment page...');
        console.log("REDIRECT URL:", order.redirectUrl);
        window.location.href = order.redirectUrl;
        return;
      }

      toast.error('Payment URL not received. Please try again.');
    } catch (e) {
      toast.error(e.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="step-circle">
                  {i < step ? <FiCheck size={12} /> : i + 1}
                </div>
                <span className="step-label">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${i < step ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="checkout-layout">

          {/* Order Summary — mobile top, desktop right */}
          <div className="card cart-summary-sidebar">
            <h3 className="summary-title">Order Summary</h3>

            {/* Cart items */}
            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item.productId} className="summary-item">
                  {item.productImage && (
                    <img src={item.productImage} alt={item.productName} className="summary-item-img" />
                  )}
                  <div className="summary-item-info">
                    <p className="summary-item-name">{item.productName}</p>
                    <p className="summary-item-meta">× {item.quantity}</p>
                  </div>
                  <span className="summary-item-price">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            {/* Totals */}
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>

          {/* Main form */}
          <div className="checkout-main">

            {/* Step 0 — Shipping */}
            {step === 0 && (
              <div className="card checkout-section">
                <h2 className="section-heading">Shipping Address</h2>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input name="name" value={shipping.name} onChange={handleChange}
                      className="form-input" placeholder="Ahmed Khan" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input name="phone" value={shipping.phone} onChange={handleChange}
                      className="form-input" placeholder="03XX-XXXXXXX" type="tel" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input name="street" value={shipping.street} onChange={handleChange}
                    className="form-input" placeholder="House 12, Street 4, Block B" />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input name="city" value={shipping.city} onChange={handleChange}
                      className="form-input" placeholder="Lahore" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input name="postalCode" value={shipping.postalCode} onChange={handleChange}
                      className="form-input" placeholder="54000" inputMode="numeric" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Province</label>
                  <select name="province" value={shipping.province}
                    onChange={handleChange} className="form-input">
                    {PROVINCES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <button
                  className="btn btn-primary btn-lg btn-full"
                  onClick={() => setStep(1)}
                  disabled={!validateShipping()}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 1 — Payment */}
            {step === 1 && (
              <div className="card checkout-section">
                <h2 className="section-heading">Payment Method</h2>

                <div className="payment-methods-list">
                  {PAYMENT_METHODS.map(method => (
                    <div
                      key={method.id}
                      className={`payment-method-card ${selectedPayment === method.id ? 'selected' : ''}`}
                      onClick={() => setPayment(method.id)}
                    >
                      <div className="payment-method-left">
                        <div className="payment-radio">
                          {selectedPayment === method.id && <div className="radio-dot" />}
                        </div>
                        <div className="payment-icon-wrap"
                          style={{ background: method.bg, color: method.color }}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="payment-method-name">{method.name}</p>
                          <p className="payment-method-desc">{method.description}</p>
                        </div>
                      </div>
                      {method.id === 'cod' && (
                        <span className="recommended-badge">Popular</span>
                      )}
                    </div>
                  ))}
                </div>

                {selectedPayment === 'cod' && (
                  <div className="payment-notice cod-notice">
                    <FiTruck size={15} />
                    <p>
                      Our agent will collect <strong>{formatPrice(orderTotal)}</strong> on delivery.
                      Please keep exact change ready.
                    </p>
                  </div>
                )}
                {selectedPayment !== 'cod' && (
                  <div className="payment-notice online-notice">
                    <FiCreditCard size={15} />
                    <p>You will be redirected to a secure payment page after confirming.</p>
                  </div>
                )}

                <div className="step-actions">
                  <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 2 — Review */}
            {step === 2 && (
              <div className="card checkout-section">
                <h2 className="section-heading">Review Your Order</h2>

                <div className="review-items">
                  {cart.items.map(item => (
                    <div key={item.productId} className="review-item">
                      {item.productImage && (
                        <img src={item.productImage} alt={item.productName} className="review-item-img" />
                      )}
                      <span className="review-item-name">{item.productName}</span>
                      <span className="review-item-qty">× {item.quantity}</span>
                      <span className="review-item-price">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="review-block">
                  <h3 className="review-block-title">Deliver to</h3>
                  <p>{shipping.name} &nbsp;·&nbsp; {shipping.phone}</p>
                  <p>{shipping.street}</p>
                  <p>{shipping.city}, {shipping.province} {shipping.postalCode}</p>
                </div>

                <div className="review-block">
                  <h3 className="review-block-title">Payment</h3>
                  <p>
                    {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}
                    {selectedPayment === 'cod' && ' — Pay on delivery'}
                  </p>
                </div>

                <div className="review-total-bar">
                  <span>Total to pay</span>
                  <span className="review-total-amount">{formatPrice(orderTotal)}</span>
                </div>

                <div className="step-actions">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? <Spinner /> : selectedPayment === 'cod'
                      ? 'Confirm Order'
                      : 'Pay Now →'
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;