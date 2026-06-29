// Format price in PKR
export const formatPrice = (amount) =>
  `PKR ${Number(amount).toLocaleString('en-PK')}`;

// Truncate text
export const truncate = (str, max = 80) =>
  str?.length > max ? str.slice(0, max) + '…' : str;

// Format date
export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Order status badge color
export const statusColor = (status) => {
  const map = {
    pending:    'badge-warning',
    paid:       'badge-info',
    processing: 'badge-info',
    shipped:    'badge-info',
    delivered:  'badge-success',
    cancelled:  'badge-danger',
    refunded:   'badge-gray',
  };
  return map[status] || 'badge-gray';
};

// Placeholder image
export const imgPlaceholder = (name = 'Product') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e5e7eb&color=6b7280&size=400&font-size=0.3`;
