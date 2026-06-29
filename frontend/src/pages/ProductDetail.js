// src/pages/ProductDetail.js — REPLACE

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus, FiCheck, FiZap } from 'react-icons/fi';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, imgPlaceholder } from '../utils/helpers';
import { PageLoader } from '../components/common/Spinner';
import GoHome from '../components/common/GoHome '; 
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug }                      = useParams();
  const { addToCart, loading: cLoading } = useCart();
  const { user }                      = useAuth();
  const navigate                      = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty]         = useState(1);
  const [added, setAdded]     = useState(false);
  const [mainImg, setMainImg] = useState(0);

  useEffect(() => {
    productAPI.getBySlug(slug)
      .then(res => setProduct(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const guard = () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return false; }
    return true;
  };

  const handleAddToCart = async () => {
    if (!guard()) return;
    await addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!guard()) return;
    await addToCart(product.id, qty);
    navigate('/checkout');
  };

  const discount = product?.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  if (loading) return <PageLoader />;

  if (!product) return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>😔</div>
        <h2 style={{ marginBottom: 16 }}>Product not found</h2>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
        <GoHome />
      </div>
    </div>
  );

  const images = product.images?.length ? product.images : [imgPlaceholder(product.name)];

  return (
    <div className="page">
      <div className="container">
        <Link to="/products" className="back-link">
          <FiArrowLeft size={15} /> Back to Products
        </Link>

        <div className="pd-grid">

          {/* Images */}
          <div className="pd-images">
            <div className="pd-main-img">
              <img src={images[mainImg]} alt={product.name} />
              {discount && <span className="pd-discount">-{discount}% OFF</span>}
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${i === mainImg ? 'active' : ''}`}
                    onClick={() => setMainImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <h1 className="pd-name">{product.name}</h1>

            <div className="pd-price-row">
              <span className="pd-price">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="pd-compare">{formatPrice(product.comparePrice)}</span>
              )}
              {discount && <span className="pd-save">Save {discount}%</span>}
            </div>

            <p className="pd-desc">{product.description}</p>

            {/* Delivery charge */}
            {product.deliveryCharge !== undefined && (
              <div className="pd-delivery">
                🚚 Delivery: <strong>
                  {product.deliveryCharge === 0 ? 'Free' : formatPrice(product.deliveryCharge)}
                </strong>
              </div>
            )}

            {/* Stock badge */}
            <div className={`pd-stock ${product.stock > 0 ? 'in' : 'out'}`}>
              {product.stock > 0
                ? <><FiCheck size={13} /> In Stock ({product.stock} available)</>
                : 'Out of Stock'
              }
            </div>

            {product.stock > 0 && (
              <>
                {/* Quantity */}
                <div className="pd-qty-row">
                  <span className="pd-qty-label">Quantity</span>
                  <div className="pd-qty">
                    <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
                      <FiMinus size={13} />
                    </button>
                    <span className="pd-qty-val">{qty}</span>
                    <button className="pd-qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>
                      <FiPlus size={13} />
                    </button>
                  </div>
                  <span className="pd-qty-total">{formatPrice(product.price * qty)}</span>
                </div>

                {/* Action buttons */}
                <div className="pd-actions">
                  <button
                    className={`btn btn-lg ${added ? 'btn-success' : 'btn-outline'} pd-cart-btn`}
                    onClick={handleAddToCart}
                    disabled={cLoading}
                  >
                    {added ? <><FiCheck size={17} /> Added!</> : <><FiShoppingCart size={17} /> Add to Cart</>}
                  </button>
                  <button
                    className="btn btn-primary btn-lg pd-buy-btn"
                    onClick={handleBuyNow}
                    disabled={cLoading}
                  >
                    <FiZap size={17} /> Buy Now
                  </button>
                </div>
              </>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="pd-tags">
                {product.tags.map(t => (
                  <span key={t} className="pd-tag">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <GoHome />
      </div>
    </div>
  );
};

export default ProductDetail;