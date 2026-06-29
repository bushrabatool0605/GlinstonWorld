import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { productAPI } from '../services/api';
import ProductModal from '../components/products/ProductModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { PageLoader, EmptyState } from '../components/common/Spinner';
import { formatPrice, truncate } from '../utils/helpers';
import toast from 'react-hot-toast';
import './Products.css';

const Products = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const [showModal, setShowModal]       = useState(false);
  const [editProduct, setEditProduct]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ page, limit: 15, search: search || undefined });
      setProducts(res.data || []);
      setPagination(res.pagination || { pages: 1, total: 0 });
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search]);

  const handleEdit = (product) => { setEditProduct(product); setShowModal(true); };
  const handleAdd  = ()        => { setEditProduct(null);    setShowModal(true); };
  const handleClose = ()       => { setShowModal(false); setEditProduct(null); };
  const handleSaved = ()       => { handleClose(); fetchProducts(); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productAPI.delete(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="products-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-subtitle">{pagination.total} total products</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={fetchProducts}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            <FiPlus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card search-bar">
        <div className="search-wrap">
          <FiSearch size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No products found"
            description={search ? 'Try a different search term.' : 'Add your first product to get started.'}
            action={!search && (
              <button className="btn btn-primary" onClick={handleAdd}>
                <FiPlus size={15} /> Add First Product
              </button>
            )}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          <div className="product-thumb">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} />
                            ) : (
                              <div className="product-thumb-placeholder">
                                {product.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="product-name-cell">{truncate(product.name, 45)}</p>
                            <p className="product-slug-cell">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{formatPrice(product.price)}</span>
                        {product.comparePrice && (
                          <span className="compare-price-cell">{formatPrice(product.comparePrice)}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${product.stock <= 5 ? 'badge-danger' : product.stock <= 20 ? 'badge-warning' : 'badge-success'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${product.isActive ? 'badge-success' : 'badge-gray'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" onClick={() => handleEdit(product)} title="Edit product">
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            className="btn-icon"
                            style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                            onClick={() => setDeleteTarget(product)}
                            title="Delete product"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(n => Math.abs(n - page) <= 2)
                  .map(n => (
                    <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                  ))}
                <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <ProductModal product={editProduct} onClose={handleClose} onSaved={handleSaved} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          danger
        />
      )}
    </div>
  );
};

export default Products;
