// src/pages/Products.js — REPLACE

import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { productAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import { PageLoader } from '../components/common/Spinner';
import GoHome from '../components/common/GoHome '; 
import './Products.css';

const SORT_OPTIONS = [
  { label: 'Newest',          value: 'createdAt|-1' },
  { label: 'Oldest',          value: 'createdAt|1'  },
  { label: 'Price: Low–High', value: 'price|1'      },
  { label: 'Price: High–Low', value: 'price|-1'     },
  { label: 'Name A–Z',        value: 'name|1'       },
];

const Products = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState('createdAt|-1');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page,     setPage]     = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const [sortField, sortOrder] = sort.split('|');
    try {
      const res = await productAPI.getAll({
        page, limit: 12,
        search:    search    || undefined,
        sort:      sortField,
        order:     Number(sortOrder),
        min_price: minPrice  || undefined,
        max_price: maxPrice  || undefined,
      });
      setProducts(res.data || []);
      setPagination(res.pagination || { pages: 1, total: 0 });
    } catch {}
    finally { setLoading(false); }
  }, [page, search, sort, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, sort, minPrice, maxPrice]);

  const clearFilters = () => {
    setSearch(''); setMinPrice(''); setMaxPrice('');
    setSort('createdAt|-1'); setPage(1);
  };

  const hasFilters = search || minPrice || maxPrice || sort !== 'createdAt|-1';

  return (
    <div className="page products-page">
      <div className="container">

        <div className="products-header">
          <h1 className="section-title">All Products</h1>
          {!loading && (
            <p className="products-count">{pagination.total} products</p>
          )}
        </div>

        {/* Filters */}
        <div className="filters card">
          <div className="search-wrap">
            <FiSearch size={15} className="search-icon" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-row">
            <select value={sort} onChange={e => setSort(e.target.value)} className="filter-select">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <input
              type="number" placeholder="Min price"
              value={minPrice} onChange={e => setMinPrice(e.target.value)}
              className="filter-select price-input"
            />
            <input
              type="number" placeholder="Max price"
              value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              className="filter-select price-input"
            />

            {hasFilters && (
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                <FiX size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try different search terms or clear filters</p>
            {hasFilters && (
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <div className="page-nums">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(n => Math.abs(n - page) <= 2)
                    .map(n => (
                      <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>
                        {n}
                      </button>
                    ))}
                </div>
                <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}

        <GoHome />
      </div>
    </div>
  );
};

export default Products;