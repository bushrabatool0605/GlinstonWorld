import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({ title, message, onConfirm, onCancel, loading, danger = true }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {danger && <FiAlertTriangle size={20} style={{ color: 'var(--danger)' }} />}
          <span className="modal-title">{title}</span>
        </div>
      </div>
      <div className="modal-body">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
