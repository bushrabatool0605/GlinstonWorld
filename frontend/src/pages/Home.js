// src/pages/Home.js — REPLACE

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { productAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import { PageLoader } from '../components/common/Spinner';
import './Home.css';

const FEATURES = [
  { icon: <FiTruck size={22} />,    title: 'Fast Delivery',  desc: 'Across Pakistan in 3–5 days' },
  { icon: <FiShield size={22} />,   title: 'Secure Payment', desc: 'COD, JazzCash, Easypaisa' },
  { icon: <FiRefreshCw size={22} />, title: 'Easy Returns',  desc: 'Contact support within 7 days' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    productAPI.getAll({ limit: 8, sort: 'createdAt', order: -1 })
      .then(res => setProducts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">

      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-tag">Pakistan's Online Store</span>
            <h1 className="hero-title">
              Shop the Best<br />
              <span className="hero-accent">Products Online</span>
            </h1>
            <p className="hero-desc">
              Thousands of products, fast delivery, and secure payments.
            </p>
            <div className="hero-btns">
              <Link to="/products" className="btn btn-lg" style={{ background: '#fff', color: '#111827' }}>
                Shop Now <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <p className="feature-title">{f.title}</p>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="latest">
        <div className="container">
          <div className="latest-header">
            <h2 className="section-title">Latest Products</h2>
            <Link to="/products" className="see-all">
              See all <FiArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products yet</h3>
              <p>Check back soon!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;