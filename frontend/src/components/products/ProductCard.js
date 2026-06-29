// src/components/products/ProductCard.js — REPLACE

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiZap } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, imgPlaceholder, truncate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const guard = () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return false; }
    return true;
  };

  const handleCart = async e => {
    e.preventDefault(); e.stopPropagation();
    if (!guard()) return;
    await addToCart(product.id, 1);
  };

  const handleBuy = async e => {
    e.preventDefault(); e.stopPropagation();
    if (!guard()) return;
    await addToCart(product.id, 1);
    navigate('/checkout');
  };

  return (
    <div className="pc card">
      <Link to={`/products/${product.slug}`} className="pc-img-wrap">
        <img
          src={product.images?.[0] || imgPlaceholder(product.name)}
          alt={product.name}
          className="pc-img"
          loading="lazy"
        />
        {discount && <span className="pc-discount">-{discount}%</span>}
        {product.stock === 0 && <div className="pc-oos">Out of Stock</div>}
      </Link>

      <div className="pc-body">
        <Link to={`/products/${product.slug}`} className="pc-name">
          {truncate(product.name, 52)}
        </Link>

        <div className="pc-prices">
          <span className="pc-price">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="pc-compare">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        {product.stock > 0 ? (
          <div className="pc-actions">
            <button className="btn btn-outline btn-sm pc-cart" onClick={handleCart} disabled={loading} aria-label="Add to cart">
              <FiShoppingCart size={14} />
            </button>
            <button className="btn btn-primary btn-sm pc-buy" onClick={handleBuy} disabled={loading}>
              <FiZap size={13} /> Buy Now
            </button>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm btn-full" disabled style={{ marginTop: 'auto' }}>
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;