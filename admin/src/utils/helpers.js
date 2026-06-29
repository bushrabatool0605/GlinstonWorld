// ecommerce-admin/src/utils/helpers.js  — REPLACE your existing file

export const formatPrice  = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;
export const formatDate   = (d) => new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
export const truncate     = (s, max = 40) => s?.length > max ? s.slice(0, max) + '…' : s;

export const statusColor = (status) => ({
  pending:           'badge-warning',
  confirmed:         'badge-info',
  paid:              'badge-success',
  processing:        'badge-purple',
  shipped:           'badge-info',
  out_for_delivery:  'badge-info',
  delivered:         'badge-success',
  cancelled:         'badge-danger',
  refunded:          'badge-gray',
}[status] || 'badge-gray');

export const paymentStatusColor = (status) => ({
  pending:  'badge-warning',
  paid:     'badge-success',
  failed:   'badge-danger',
  refunded: 'badge-gray',
}[status] || 'badge-gray');

export const paymentMethodLabel = (method) => ({
  cod:       '💵 Cash on Delivery',
  jazzcash:  '📱 JazzCash',
  easypaisa: '📲 Easypaisa',
  safepay:   '💳 Card (Safepay)',
}[method] || method);

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'paid', 'processing',
  'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'refunded',
];
