import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/* ── inject keyframes once ── */
const sheet = document.createElement('style');
sheet.innerText = `
  @keyframes scaleIn {
    0%   { transform: scale(0.6); opacity: 0; }
    70%  { transform: scale(1.08); }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes drawCheck {
    0%   { stroke-dashoffset: 60; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(34,197,94,.35); }
    70%  { box-shadow: 0 0 0 18px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }
`;
if (!document.head.querySelector('#order-success-styles')) {
  sheet.id = 'order-success-styles';
  document.head.appendChild(sheet);
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '56px 48px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,.06), 0 20px 60px -12px rgba(0,0,0,.08)',
    animation: 'fadeUp .5s ease both',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 28px',
    animation: 'scaleIn .5s cubic-bezier(.34,1.56,.64,1) .1s both, pulse-ring 1.8s ease .6s 2',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 10px',
    letterSpacing: '-0.4px',
  },
  sub: {
    fontSize: '15px',
    color: '#64748b',
    margin: '0 0 32px',
    lineHeight: '1.6',
  },
  divider: {
    height: '1px',
    background: '#f1f5f9',
    margin: '0 0 28px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  label: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  value: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
  },
  btnPrimary: {
    display: 'block',
    width: '100%',
    padding: '14px 0',
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '28px',
    letterSpacing: '0.2px',
    transition: 'background .2s, transform .15s',
  },
  btnSecondary: {
    display: 'block',
    width: '100%',
    padding: '13px 0',
    background: 'transparent',
    color: '#475569',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'border-color .2s, color .2s',
  },
};

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const orderId = id || 'ORD-' + Math.random().toString(36).slice(2, 9).toUpperCase();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const btnRef = useRef(null);
  const btn2Ref = useRef(null);

  const hoverIn = (e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-1px)'; };
  const hoverOut = (e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; };
  const hover2In = (e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#0f172a'; };
  const hover2Out = (e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Animated check icon */}
        <div style={s.iconWrap}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <circle cx="19" cy="19" r="19" fill="#22c55e" opacity=".12" />
            <polyline
              points="10,19 16,25 28,13"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="60"
              strokeDashoffset="60"
              style={{ animation: 'drawCheck .5s ease .3s forwards' }}
            />
          </svg>
        </div>

        <h1 style={s.heading}>Order Confirmed!</h1>
        <p style={s.sub}>
          Thank you for your purchase. Your order has been placed<br />
          and is being prepared for shipment.
        </p>

        <div style={s.divider} />

        <div style={s.infoRow}>
          <span style={s.label}>Order ID</span>
          <span style={s.value}>#{orderId}</span>
        </div>
        <div style={s.infoRow}>
          <span style={s.label}>Date</span>
          <span style={s.value}>{today}</span>
        </div>
        <div style={s.infoRow}>
          <span style={s.label}>Status</span>
          <span style={{ ...s.value, color: '#22c55e' }}>Processing</span>
        </div>

        <button
          style={s.btnPrimary}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </button>
        <button
          style={s.btnSecondary}
          onMouseEnter={hover2In}
          onMouseLeave={hover2Out}
          onClick={() => navigate('/profile')}
        >
          View My Orders
        </button>

      </div>
    </div>
  );
};

export default OrderSuccessPage;