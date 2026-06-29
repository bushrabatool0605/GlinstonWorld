// src/pages/Orders.js — REPLACE

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiChevronDown, FiChevronUp,
  FiTruck, FiSmartphone, FiCreditCard,
  FiMapPin, FiPhone,
} from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { formatPrice, formatDate, statusColor } from '../utils/helpers';
import { PageLoader } from '../components/common/Spinner';
import './Orders.css';

const PAYMENT_ICONS = {
  cod:       <FiTruck size={12} />,
  jazzcash:  <FiSmartphone size={12} />,
  easypaisa: <FiSmartphone size={12} />,
  safepay:   <FiCreditCard size={12} />,
};

const PAYMENT_LABELS = {
  cod:       'Cash on Delivery',
  jazzcash:  'JazzCash',
  easypaisa: 'Easypaisa',
  safepay:   'Card (Safepay)',
};

const PAYMENT_STATUS_BADGE = {
  pending:  'badge-warning',
  paid:     'badge-success',
  failed:   'badge-danger',
  refunded: 'badge-gray',
};

// ── Single order card ─────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="order-card card">

      {/* Header — click to expand */}
      <div className="order-card-header" onClick={() => setExpanded(e => !e)}>
        <div>
          <p className="order-num">{order.orderNumber}</p>
          <p className="order-dt">{formatDate(order.createdAt)}</p>
        </div>
        <div className="order-status-wrap">
          <span className={`badge ${statusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
          <span className="expand-icon">
            {expanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
          </span>
        </div>
      </div>

      {/* Items preview */}
      <div className="order-items-row" onClick={() => setExpanded(e => !e)}>
        {order.items?.slice(0, 3).map(item => (
          <span key={item.productId} className="item-chip">
            {item.productName} × {item.quantity}
          </span>
        ))}
        {order.items?.length > 3 && (
          <span className="item-more">+{order.items.length - 3} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="order-card-footer">
        <div className="footer-left">
          <span className="payment-chip">
            {PAYMENT_ICONS[order.paymentMethod]}
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
          </span>
          <span
            className={`badge ${PAYMENT_STATUS_BADGE[order.paymentStatus] || 'badge-gray'}`}
            style={{ fontSize: 11 }}
          >
            {order.paymentStatus === 'pending' && order.paymentMethod === 'cod'
              ? 'Pay on delivery'
              : order.paymentStatus}
          </span>
        </div>
        <span className="order-amount">{formatPrice(order.total)}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="order-detail">
          <div className="order-detail-grid">

            {/* Items ordered */}
            <div className="detail-block">
              <p className="detail-block-title">Items Ordered</p>
              {order.items?.map((item, i) => (
                <div key={i} className="detail-item">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="detail-item-thumb"
                    />
                  )}
                  <span className="detail-item-name">{item.productName}</span>
                  <span className="detail-item-qty">× {item.quantity}</span>
                  <span className="detail-item-price">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            <div className="detail-block">
              <p className="detail-block-title">Delivery Address</p>
              <div className="detail-addr">
                <p>
                  <FiPhone size={12} />
                  {order.shippingAddress?.name} &nbsp;·&nbsp; {order.shippingAddress?.phone}
                </p>
                <p>
                  <FiMapPin size={12} />
                  {order.shippingAddress?.street}
                </p>
                <p className="addr-indent">
                  {order.shippingAddress?.city}, {order.shippingAddress?.province}
                </p>
                <p className="addr-indent">
                  {order.shippingAddress?.postalCode}, Pakistan
                </p>
              </div>
              {order.trackingNumber && (
                <div className="tracking-row">
                  <FiTruck size={13} />
                  Tracking: <strong>{order.trackingNumber}</strong>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="detail-block">
              <p className="detail-block-title">Price Breakdown</p>
              <div className="detail-price-row">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="detail-price-row">
                <span>Delivery</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.tax > 0 && (
                <div className="detail-price-row">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="detail-price-row bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>

              {order.notes && (
                <p className="order-notes">Note: {order.notes}</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};


// ── Orders page ───────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(res => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="orders-page">
      <div className="container">

        {location.state?.cod && (
          <div className="success-banner cod-banner">
            🎉 Order confirmed! Our delivery agent will contact you soon.
          </div>
        )}
        {location.state?.success && !location.state?.cod && (
          <div className="success-banner online-banner">
            ✅ Payment received! Your order is being processed.
          </div>
        )}

        <h1 className="orders-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your orders will appear here after you place them.</p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;