import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiMail, FiUser } from 'react-icons/fi';
import api from '../services/api';
import { PageLoader, EmptyState } from '../components/common/Spinner';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setCustomers(res.data?.data || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="customers-page">
      <div className="page-header">
        <p className="page-subtitle">{customers.length} registered customers</p>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={fetchCustomers}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="card search-bar">
        <div className="search-wrap">
          <FiUser size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="card table-card">
        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No customers found"
            description="Customers will appear here after they register."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {customer.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="customer-name">{customer.name}</span>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${customer.email}`} className="customer-email">
                        <FiMail size={13} /> {customer.email}
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${customer.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>
                        {customer.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${customer.isVerified ? 'badge-success' : 'badge-warning'}`}>
                        {customer.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {formatDate(customer.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
