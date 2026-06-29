import React, { useEffect, useState, useCallback } from 'react';
import {
  FiRefreshCw, FiEdit2,
  FiChevronDown, FiChevronUp,
  FiPhone, FiMail, FiMapPin,
} from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { PageLoader, EmptyState, Spinner } from '../components/common/Spinner';
import { formatPrice, formatDate, statusColor, paymentMethodLabel, ORDER_STATUSES } from '../utils/helpers';
import toast from 'react-hot-toast';
import './Orders.css';

// ── Status update modal ───────────────────────────────────────────────────
const StatusModal = ({ order, onClose, onSaved }) => {
  const [status,   setStatus]   = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber || '');
  const [loading,  setLoading]  = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await orderAPI.updateStatus(order.id, status, tracking || undefined);
      toast.success('Order status updated');
      onSaved();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Update Order Status</span>
        </div>
        <div className="modal-body">
          <div className="order-mini-info">
            <p className="order-mini-num">{order.orderNumber}</p>
            <p className="order-mini-customer">
              {order.customerName || order.shippingAddress?.name}
              {order.customerEmail && ` · ${order.customerEmail}`}
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="form-input">
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {(status === 'shipped' || status === 'out_for_delivery') && (
            <div className="form-group">
              <label className="form-label">Tracking Number (optional)</label>
              <input
                value={tracking}
                onChange={e => setTracking(e.target.value)}
                className="form-input"
                placeholder="e.g. TCS-123456789"
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <Spinner /> : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Mobile Order Card ─────────────────────────────────────────────────────
const OrderCard = ({ order, onEdit }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`order-card ${expanded ? 'is-expanded' : ''}`}>
      {/* Card Header */}
      <div className="order-card-header">
        <div className="order-card-top">
          <span className="order-num-badge">{order.orderNumber}</span>
          <span className={`badge badge-sm ${statusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
        <div className="order-card-meta">
          <span className="order-date-badge">{formatDate(order.createdAt)}</span>
          <span className="order-card-total">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="order-card-customer">
        <div className="customer-avatar-sm">
          {(order.customerName || order.shippingAddress?.name || '?')[0].toUpperCase()}
        </div>
        <div className="customer-info">
          <p className="customer-name-text">
            {order.customerName || order.shippingAddress?.name || 'Unknown'}
          </p>
          {order.shippingAddress?.phone && (
            <p className="customer-phone-text">
              <FiPhone size={11} /> {order.shippingAddress.phone}
            </p>
          )}
          {order.shippingAddress?.city && (
            <p className="customer-phone-text">
              <FiMapPin size={11} /> {order.shippingAddress.city}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="order-card-actions">
        <button className="btn btn-outline btn-sm" onClick={() => onEdit(order)}>
          <FiEdit2 size={13} /> Update Status
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => setExpanded(e => !e)}>
          {expanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="order-card-detail">
          {/* Address */}
          <div className="detail-col">
            <p className="detail-col-title">Delivery Address</p>
            <div className="detail-address-block">
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
              <p>{order.shippingAddress?.postalCode}, Pakistan</p>
            </div>
            {order.notes && (
              <div className="order-note-badge">Note: {order.notes}</div>
            )}
          </div>

          {/* Items */}
          <div className="detail-col">
            <p className="detail-col-title">Items Ordered</p>
            {order.items?.map((item, i) => (
              <div key={i} className="detail-item-row">
                {item.productImage && (
                  <img src={item.productImage} alt={item.productName} className="detail-item-img" />
                )}
                <span className="detail-item-name">{item.productName}</span>
                <span className="detail-item-qty">× {item.quantity}</span>
                <span className="detail-item-price">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="detail-col">
            <p className="detail-col-title">Price Summary</p>
            <div className="detail-price-rows">
              <div className="detail-price-row">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="detail-price-row">
                <span>Delivery</span><span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.tax > 0 && (
                <div className="detail-price-row">
                  <span>Tax</span><span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="detail-price-row total-row">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
              Payment: <strong>{paymentMethodLabel(order.paymentMethod)}</strong>
              &nbsp;·&nbsp;
              <span className={`badge badge-sm ${
                order.paymentStatus === 'paid' ? 'badge-success'
                : order.paymentStatus === 'failed' ? 'badge-danger'
                : 'badge-warning'
              }`}>
                {order.paymentStatus === 'pending' && order.paymentMethod === 'cod'
                  ? 'Collect on delivery' : order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Desktop Order Row ─────────────────────────────────────────────────────
const OrderRow = ({ order, onEdit }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className={`order-tr ${expanded ? 'is-expanded' : ''}`}>
        <td>
          <div className="cell-order-num">
            <span className="order-num-badge">{order.orderNumber}</span>
            <span className="order-date-badge">{formatDate(order.createdAt)}</span>
          </div>
        </td>
        <td>
          <div className="cell-customer">
            <div className="customer-avatar-sm">
              {(order.customerName || order.shippingAddress?.name || '?')[0].toUpperCase()}
            </div>
            <div className="customer-info">
              <p className="customer-name-text">
                {order.customerName || order.shippingAddress?.name || 'Unknown'}
              </p>
              {order.shippingAddress?.phone && (
                <p className="customer-phone-text">
                  <FiPhone size={11} /> {order.shippingAddress.phone}
                </p>
              )}
              {order.customerEmail && (
                <p className="customer-email-text">
                  <FiMail size={11} /> {order.customerEmail}
                </p>
              )}
            </div>
          </div>
        </td>
        <td>
          <div className="cell-city">
            <FiMapPin size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span>{order.shippingAddress?.city || '—'}</span>
          </div>
        </td>
        <td>
          <span className={`badge ${statusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
        </td>
        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {paymentMethodLabel(order.paymentMethod)}
        </td>
        <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-icon" onClick={() => onEdit(order)} title="Update status">
              <FiEdit2 size={13} />
            </button>
            <button
              className="btn-icon"
              onClick={() => setExpanded(e => !e)}
              title={expanded ? 'Collapse' : 'View detail'}
            >
              {expanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="detail-tr">
          <td colSpan={7}>
            <div className="order-detail-panel">
              <div className="detail-col">
                <p className="detail-col-title">Customer Details</p>
                <div className="detail-info-list">
                  <div className="detail-info-row">
                    <span className="detail-info-label">Name</span>
                    <span>{order.customerName || order.shippingAddress?.name || '—'}</span>
                  </div>
                  {order.customerEmail && (
                    <div className="detail-info-row">
                      <span className="detail-info-label">Email</span>
                      <a href={`mailto:${order.customerEmail}`} className="detail-link">
                        {order.customerEmail}
                      </a>
                    </div>
                  )}
                  {order.shippingAddress?.phone && (
                    <div className="detail-info-row">
                      <span className="detail-info-label">Phone</span>
                      <a href={`tel:${order.shippingAddress.phone}`} className="detail-link">
                        {order.shippingAddress.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="detail-col">
                <p className="detail-col-title">Delivery Address</p>
                <div className="detail-address-block">
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                  <p>{order.shippingAddress?.postalCode}, Pakistan</p>
                </div>
                {order.trackingNumber && (
                  <div className="tracking-badge">
                    Tracking: <strong>{order.trackingNumber}</strong>
                  </div>
                )}
                {order.notes && (
                  <div className="order-note-badge">Note: {order.notes}</div>
                )}
              </div>
              <div className="detail-col">
                <p className="detail-col-title">Items Ordered</p>
                {order.items?.map((item, i) => (
                  <div key={i} className="detail-item-row">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="detail-item-img" />
                    )}
                    <span className="detail-item-name">{item.productName}</span>
                    <span className="detail-item-qty">× {item.quantity}</span>
                    <span className="detail-item-price">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
              <div className="detail-col">
                <p className="detail-col-title">Price Summary</p>
                <div className="detail-price-rows">
                  <div className="detail-price-row">
                    <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="detail-price-row">
                    <span>Delivery</span><span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="detail-price-row">
                      <span>Tax</span><span>{formatPrice(order.tax)}</span>
                    </div>
                  )}
                  <div className="detail-price-row total-row">
                    <span>Total</span><span>{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Payment: <strong style={{ color: 'var(--text-primary)' }}>
                    {paymentMethodLabel(order.paymentMethod)}
                  </strong>
                  &nbsp;·&nbsp;
                  <span className={`badge badge-sm ${
                    order.paymentStatus === 'paid' ? 'badge-success'
                    : order.paymentStatus === 'failed' ? 'badge-danger'
                    : 'badge-warning'
                  }`}>
                    {order.paymentStatus === 'pending' && order.paymentMethod === 'cod'
                      ? 'Collect on delivery' : order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Main Orders page ──────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [statusFilter, setStatus]   = useState('');
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [editOrder, setEditOrder]   = useState(null);
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll({
        page, limit: 15,
        status: statusFilter || undefined,
      });
      setOrders(res.data || []);
      setPagination(res.pagination || { pages: 1, total: 0 });
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  return (
    <div className="orders-page">
      <div className="page-header">
        <p className="page-subtitle">{pagination.total} total orders</p>
        <div className="page-actions">
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            className="form-input"
            style={{ width: 170, fontSize: 13 }}
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          <button className="btn btn-outline btn-sm" onClick={fetchOrders}>
            <FiRefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="card table-card">
        {loading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="No orders found"
            description="Orders will appear here once customers start purchasing."
          />
        ) : isMobile ? (
          /* ── Mobile Card View ── */
          <div className="orders-card-list">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onEdit={setEditOrder} />
            ))}
          </div>
        ) : (
          /* ── Desktop Table View ── */
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <OrderRow key={order.id} order={order} onEdit={setEditOrder} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(n => Math.abs(n - page) <= 2)
              .map(n => (
                <button
                  key={n}
                  className={`page-btn ${n === page ? 'active' : ''}`}
                  onClick={() => setPage(n)}
                >{n}</button>
              ))}
            <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>→</button>
          </div>
        )}
      </div>

      {editOrder && (
        <StatusModal
          order={editOrder}
          onClose={() => setEditOrder(null)}
          onSaved={() => { setEditOrder(null); fetchOrders(); }}
        />
      )}
    </div>
  );
};

export default Orders;