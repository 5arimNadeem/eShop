import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { useEffect } from "react";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";


/* ── inject keyframes once ── */
const sheet = document.createElement('style');
sheet.innerText = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .pay-input:focus {
    outline: none;
    border-color: #0f172a !important;
    box-shadow: 0 0 0 3px rgba(15,23,42,.08);
  }
  .pay-input::placeholder { color: #cbd5e1; }
`;
if (!document.head.querySelector('#payment-page-styles')) {
  sheet.id = 'payment-page-styles';
  document.head.appendChild(sheet);
}

/* ── helpers ── */
const formatCard = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/* ── styles ── */
const style = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    width: '100%',
    maxWidth: '820px',
    animation: 'fadeUp .45s ease both',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '36px 36px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,.06), 0 20px 60px -12px rgba(0,0,0,.08)',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '18px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 28px',
    letterSpacing: '-0.3px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  fieldWrap: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '7px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#0f172a',
    background: '#fafafa',
    boxSizing: 'border-box',
    transition: 'border-color .2s, box-shadow .2s',
  },
  cardChip: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    borderRadius: '16px',
    padding: '24px 28px',
    color: '#fff',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  chipCircles: {
    position: 'absolute',
    top: '-30px',
    right: '-30px',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,.06)',
  },
  chipCircles2: {
    position: 'absolute',
    bottom: '-40px',
    left: '-20px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,.04)',
  },
  cardNum: {
    fontSize: '17px',
    fontWeight: '600',
    letterSpacing: '3px',
    marginBottom: '20px',
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.9,
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  divider: {
    height: '1px',
    background: '#f1f5f9',
    margin: '20px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    marginBottom: '10px',
    color: '#475569',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '4px',
  },
  payBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '15px 0',
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '20px',
    letterSpacing: '0.2px',
    transition: 'background .2s, transform .15s',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
    justifyContent: 'center',
    marginTop: '14px',
  },
  methodTab: (active) => ({
    flex: 1,
    padding: '10px 0',
    border: active ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
    borderRadius: '10px',
    background: active ? '#0f172a' : '#fff',
    color: active ? '#fff' : '#64748b',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all .2s',
  }),
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { cart } = useSelector((state) => state.cart);

  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', cardNumber: '', expiry: '', cvv: '', email: '',
  });

  const subtotal = cart.reduce((acc, i) => acc + i.discountPrice * i.qty, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = formatCard(value);
    if (name === 'expiry') v = formatExpiry(value);
    if (name === 'cvv') v = value.replace(/\D/g, '').slice(0, 3);
    setForm((p) => ({ ...p, [name]: v }));
  };

  const handlePay = async (paymentInfo) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    order.paymentInfo = {
      id: paymentInfo.payer_id,
      status: "succeeded",
      type: "Paypal",
    };

    await axios
      .post(`${server}/order/create-order`, order, config)
      .then((res) => {
        setOpen(false);
        navigate("/order/success");
        toast.success("Order successful!");
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
        window.location.reload();
      });
  };

  const paymentData = {
    amount: Math.round(orderData?.totalPrice * 100),
  };

  const paymentHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${server}/payment/process`,
        paymentData,
        config
      );

      const client_secret = data.client_secret;

      if (!stripe || !elements) return;
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          order.paymentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
            type: "Credit Card",
          };

          await axios
            .post(`${server}/order/create-order`, order, config)
            .then((res) => {
              setOpen(false);
              navigate("/order/success");
              toast.success("Order successful!");
              localStorage.setItem("cartItems", JSON.stringify([]));
              localStorage.setItem("latestOrder", JSON.stringify([]));
              window.location.reload();
            });
        }
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const displayCard = form.cardNumber || '•••• •••• •••• ••••';
  const displayExpiry = form.expiry || 'MM/YY';
  const displayName = form.name || 'YOUR NAME';

  return (
    <>
      <Header />
      <br />
      <br />
      <div style={style.page}>
        <div style={{ ...style.grid, gridTemplateColumns: window.innerWidth < 700 ? '1fr' : '1fr 340px' }}>

          {/* ── Left: Form ── */}
          <div style={style.card}>
            <h1 style={style.pageTitle}>Secure Checkout</h1>

            {/* Payment method tabs */}
            <p style={style.sectionTitle}>Payment Method</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {['card', 'paypal'].map((m) => (
                <button key={m} style={style.methodTab(method === m)} onClick={() => setMethod(m)}>
                  {m === 'card' ? '💳 Card' : '🅿 PayPal'}
                </button>
              ))}
            </div>

            {method === 'card' ? (
              <form onSubmit={handlePay} autoComplete="off">
                {/* Live card preview */}
                <div style={style.cardChip}>
                  <div style={style.chipCircles} />
                  <div style={style.chipCircles2} />
                  <div style={{ fontSize: '11px', opacity: .6, marginBottom: '12px', letterSpacing: '1px' }}>CREDIT CARD</div>
                  <div style={style.cardNum}>{displayCard}</div>
                  <div style={style.cardMeta}>
                    <span>{displayName.toUpperCase()}</span>
                    <span>{displayExpiry}</span>
                  </div>
                </div>

                <p style={{ ...style.sectionTitle, marginBottom: '18px' }}>Card Details</p>

                <div style={style.fieldWrap}>
                  <label style={style.label} htmlFor="name">Cardholder Name</label>
                  <input id="name" name="name" className="pay-input" placeholder="John Doe"
                    style={style.input} value={form.name} onChange={handleChange} required />
                </div>

                <div style={style.fieldWrap}>
                  <label style={style.label} htmlFor="cardNumber">Card Number</label>
                  <input id="cardNumber" name="cardNumber" className="pay-input" placeholder="1234 5678 9012 3456"
                    style={style.input} value={form.cardNumber} onChange={handleChange} required />
                </div>

                <div style={{ ...style.row, ...style.fieldWrap }}>
                  <div>
                    <label style={style.label} htmlFor="expiry">Expiry</label>
                    <input id="expiry" name="expiry" className="pay-input" placeholder="MM/YY"
                      style={style.input} value={form.expiry} onChange={handleChange} required />
                  </div>
                  <div>
                    <label style={style.label} htmlFor="cvv">CVV</label>
                    <input id="cvv" name="cvv" type="password" className="pay-input" placeholder="•••"
                      style={style.input} value={form.cvv} onChange={handleChange} required />
                  </div>
                </div>

                <div style={style.fieldWrap}>
                  <label style={style.label} htmlFor="email">Email for Receipt</label>
                  <input id="email" name="email" type="email" className="pay-input" placeholder="you@example.com"
                    style={style.input} value={form.email} onChange={handleChange} required />
                </div>

                <button
                  type="submit"
                  style={{ ...style.payBtn, background: loading ? '#334155' : '#0f172a' }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#0f172a')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)',
                        borderTop: '2px solid #fff', borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Processing…
                    </>
                  ) : (
                    <>🔒 Pay ${total.toFixed(2)}</>
                  )}
                </button>

                <div style={style.badge}>
                  <span>🔐</span> 256-bit SSL encrypted · PCI DSS compliant
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🅿</div>
                <p style={{ fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>Pay with PayPal</p>
                <p style={{ fontSize: '14px' }}>You'll be redirected to PayPal to complete your payment.</p>
                <button
                  style={{ ...style.payBtn, marginTop: '28px' }}
                  onClick={() => navigate('/order/success/new')}
                >
                  Continue to PayPal →
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div>
            <div style={style.card}>
              <p style={style.sectionTitle}>Order Summary</p>

              {cart.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'center' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: '#f1f5f9', flexShrink: 0, overflow: 'hidden',
                    }}>
                      {item.images?.[0] && (
                        <img src={item.images[0]?.url || item.images[0]} alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Qty {item.qty}</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', flexShrink: 0 }}>
                      ${(item.discountPrice * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))
              )}

              <div style={style.divider} />

              <div style={style.summaryRow}>
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={style.summaryRow}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? '#22c55e' : undefined }}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div style={style.divider} />
              <div style={style.totalRow}>
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ ...style.card, marginTop: '14px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px' }}>🔄</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>30-Day Returns</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Hassle-free return policy</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <br />
      <br />
      <Footer />
    </>

  );
};

export default PaymentPage;

// 5:07:50