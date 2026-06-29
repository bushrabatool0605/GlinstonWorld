import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { FiDollarSign, FiShoppingBag, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { statsAPI } from '../services/api';
import { formatPrice, formatDate, statusColor } from '../utils/helpers';
import { PageLoader } from '../components/common/Spinner';
import './Dashboard.css';

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899'];

const StatCard = ({ icon, label, value, sub, iconBg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
    <p className="stat-label">{label}</p>
    <p className="stat-value">{value}</p>
    {sub && <p className="stat-sub">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.getSummary()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!stats)  return <p style={{ color: 'var(--text-secondary)', padding: 24 }}>Failed to load dashboard data.</p>;

  return (
    <div className="dashboard">

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<FiDollarSign size={20} color="#6366f1" />}
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          sub="From paid orders"
          iconBg="#eef2ff"
        />
        <StatCard
          icon={<FiShoppingBag size={20} color="#10b981" />}
          label="Total Orders"
          value={stats.totalOrders}
          sub="All time"
          iconBg="#d1fae5"
        />
        <StatCard
          icon={<FiPackage size={20} color="#f59e0b" />}
          label="Total Products"
          value={stats.totalProducts}
          sub="Active listings"
          iconBg="#fef3c7"
        />
        <StatCard
          icon={<FiAlertCircle size={20} color="#ef4444" />}
          label="Low Stock"
          value={stats.lowStock}
          sub="5 or fewer units"
          iconBg="#fee2e2"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row">

        {/* Revenue Bar Chart */}
        <div className="card chart-card">
          <h2 className="chart-title">Revenue by Month</h2>
          {stats.revenueChart.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p>No revenue data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.revenueChart} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  formatter={v => [formatPrice(v), 'Revenue']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="card chart-card chart-card-sm">
          <h2 className="chart-title">Orders by Status</h2>
          {stats.ordersByStatus.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p>No orders yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.ordersByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {stats.ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card recent-orders-card">
        <div className="card-header">
          <h2 className="chart-title" style={{ marginBottom: 0 }}>Recent Orders</h2>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders placed yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>
                      {order.orderNumber}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(order.createdAt)}</td>
                    <td><span className={`badge ${statusColor(order.status)}`}>{order.status}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{order.items?.length || 0} items</td>
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

export default Dashboard;
