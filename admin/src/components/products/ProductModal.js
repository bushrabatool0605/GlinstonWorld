// ecommerce-admin/src/components/products/ProductModal.js — REPLACE

import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { productAPI } from '../../services/api';
import api from '../../services/api';
import { Spinner } from '../common/Spinner';
import toast from 'react-hot-toast';
import './ProductModal.css';

const EMPTY = {
  name:           '',
  description:    '',
  price:          '',
  comparePrice:   '',
  stock:          '',
  categoryId:     '',
  deliveryCharge: '200',
  tags:           '',
  isActive:       true,
};

// Extract readable error message from any error shape
const extractError = (err) => {
  if (!err) return 'Something went wrong. Please try again.';

  // Axios error with response
  const data = err.response?.data;
  if (data) {
    if (typeof data.message === 'string') return data.message;
    if (typeof data.detail  === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map(d => {
        const field = d.loc?.slice(1).join(' → ') || '';
        return field ? `${field}: ${d.msg}` : d.msg;
      }).join('\n');
    }
    if (Array.isArray(data.errors)) return data.errors[0];
  }

  // Plain error message
  if (typeof err.message === 'string' && err.message !== '[object Object]') {
    return err.message;
  }

  return 'Please check all required fields and try again.';
};

const ProductModal = ({ product, onClose, onSaved }) => {
  const isEdit  = Boolean(product);
  const fileRef = useRef();

  const [form, setForm]           = useState(EMPTY);
  const [images, setImages]       = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name:           product.name           || '',
        description:    product.description    || '',
        price:          product.price          || '',
        comparePrice:   product.comparePrice   || '',
        stock:          product.stock          ?? '',
        categoryId:     product.categoryId     || '',
        deliveryCharge: product.deliveryCharge ?? '200',
        tags:           (product.tags || []).join(', '),
        isActive:       product.isActive !== false,
      });
      setImages(product.images || []);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    // Clear field error when user types
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  // Client-side validation — clear messages in English
  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = 'Product name is required';
    if (!form.description.trim())
      e.description = 'Description is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Enter a valid price greater than 0';
    if (form.comparePrice && Number(form.comparePrice) <= Number(form.price))
      e.comparePrice = 'Original price must be higher than sale price';
    if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'Stock quantity is required (enter 0 if out of stock)';
    if (form.deliveryCharge === '' || isNaN(Number(form.deliveryCharge)) || Number(form.deliveryCharge) < 0)
      e.deliveryCharge = 'Enter delivery charge (0 for free delivery)';
    return e;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed per product');
      return;
    }
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setImages(prev => [...prev, res.data.data.url]);
        toast.success('Image uploaded successfully');
      } catch (err) {
        const msg = err.response?.data?.detail || 'Image upload failed. Check Cloudinary keys in .env';
        toast.error(msg);
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Run client-side validation first
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setSubmitError('Please fix the errors below before saving.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name:           form.name.trim(),
        description:    form.description.trim(),
        price:          Number(form.price),
        comparePrice:   form.comparePrice ? Number(form.comparePrice) : null,
        stock:          Number(form.stock),
        categoryId:     form.categoryId.trim() || 'general',
        deliveryCharge: Number(form.deliveryCharge),
        images,
        tags:           form.tags.split(',').map(s => s.trim()).filter(Boolean),
        isActive:       form.isActive,
      };

      if (isEdit) {
        await productAPI.update(product.id, payload);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(payload);
        toast.success('Product created successfully');
      }
      onSaved();
    } catch (err) {
      const message = extractError(err);
      setSubmitError(message);
      toast.error(message.split('\n')[0]); // Show first error in toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal product-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Product' : 'Add New Product'}</span>
          <button className="btn-icon" onClick={onClose}><FiX size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Global submit error banner */}
            {submitError && (
              <div className="submit-error-banner">
                <FiAlertCircle size={16} />
                <div>
                  {submitError.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* IMAGE UPLOAD */}
            <div className="form-group">
              <label className="form-label">
                Product Images
                <span className="field-hint">({images.length}/5) — first image shown as main</span>
              </label>
              <div className="images-row">
                {images.map((url, i) => (
                  <div key={i} className="img-thumb">
                    <img src={url} alt={`Product ${i + 1}`} />
                    {i === 0 && <span className="main-badge">Main</span>}
                    <button type="button" className="remove-img-btn" onClick={() => removeImage(i)}>
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div
                    className={`img-upload-slot ${uploading ? 'uploading' : ''}`}
                    onClick={() => !uploading && fileRef.current?.click()}
                  >
                    <input ref={fileRef} type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple onChange={handleImageUpload}
                      style={{ display: 'none' }} />
                    {uploading
                      ? <Spinner dark />
                      : <><FiPlus size={22} /><span>Add</span></>
                    }
                  </div>
                )}
              </div>
              <p className="form-hint">JPEG, PNG or WebP — max 5MB each</p>
            </div>

            {/* PRODUCT NAME */}
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Men's Cotton Kurta" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className={`form-input ${errors.description ? 'input-error' : ''}`}
                rows={3} placeholder="Describe the product — material, size, colors..." />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            {/* SALE PRICE + ORIGINAL PRICE */}
            <div className="two-col">
              <div className="form-group">
                <label className="form-label">Sale Price (PKR) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange}
                  className={`form-input ${errors.price ? 'input-error' : ''}`}
                  placeholder="1500" min="1" step="1" />
                {errors.price && <span className="field-error">{errors.price}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Original Price (PKR)</label>
                <input name="comparePrice" type="number" value={form.comparePrice} onChange={handleChange}
                  className={`form-input ${errors.comparePrice ? 'input-error' : ''}`}
                  placeholder="2000" min="0" step="1" />
                {errors.comparePrice
                  ? <span className="field-error">{errors.comparePrice}</span>
                  : <span className="form-hint">Shows as ~~strikethrough~~ price</span>
                }
              </div>
            </div>

            {/* STOCK + CATEGORY */}
            <div className="two-col">
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input name="stock" type="number" value={form.stock} onChange={handleChange}
                  className={`form-input ${errors.stock ? 'input-error' : ''}`}
                  placeholder="50" min="0" step="1" />
                {errors.stock && <span className="field-error">{errors.stock}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input name="categoryId" value={form.categoryId} onChange={handleChange}
                  className="form-input" placeholder="clothing" />
              </div>
            </div>

            {/* DELIVERY CHARGE — per product */}
            <div className="form-group">
              <label className="form-label">Delivery Charge (PKR) *</label>
              <div className="delivery-input-wrap">
                <input name="deliveryCharge" type="number" value={form.deliveryCharge}
                  onChange={handleChange}
                  className={`form-input ${errors.deliveryCharge ? 'input-error' : ''}`}
                  placeholder="200" min="0" step="10" />
              </div>
              {errors.deliveryCharge
                ? <span className="field-error">{errors.deliveryCharge}</span>
                : <span className="form-hint">
                    Enter 0 for free delivery on this product. This overrides the global setting.
                  </span>
              }
            </div>

            {/* TAGS */}
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input name="tags" value={form.tags} onChange={handleChange}
                className="form-input" placeholder="cotton, men, kurta (comma separated)" />
            </div>

            {/* ACTIVE TOGGLE */}
            <label className="checkbox-row">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              <span>Active — visible to customers on the store</span>
            </label>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {loading ? <Spinner /> : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
