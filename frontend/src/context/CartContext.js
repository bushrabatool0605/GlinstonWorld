// src/context/CartContext.js — REPLACE

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]       = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  // Load cart when user logs in
  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [], totalItems: 0, totalAmount: 0 });
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await cartAPI.get();
      setCart(res.data);
    } catch {}
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items'); return; }
    setLoading(true);
    try {
      const res = await cartAPI.addItem(productId, quantity);
      setCart(res.data);
      toast.success('Added to cart!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const res = await cartAPI.updateItem(productId, quantity);
      setCart(res.data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setLoading(true);
    try {
      const res = await cartAPI.removeItem(productId);
      setCart(res.data);
      toast.success('Item removed');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
    } catch {}
  };

  return (
    <CartContext.Provider value={{
      cart, loading,
      addToCart, updateQuantity, removeItem, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
