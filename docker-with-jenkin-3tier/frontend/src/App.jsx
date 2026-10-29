import { useEffect, useMemo, useState } from 'react';
import React from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    request('/products').then(setProducts).catch(e => setMessage(e.message));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = useMemo(() => cart.reduce((sum, item) => {
    const p = products.find(product => product.id === item.productId);
    return sum + (p ? p.price_cents * item.quantity : 0);
  }, 0), [cart, products]);

  function addToCart(product) {
    setCart(old => {
      const found = old.find(item => item.productId === product.id);
      if (found) return old.map(item => item.productId === product.id
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      return [...old, { productId: product.id, quantity: 1 }];
    });
    setMessage(`${product.name} added to cart`);
    setShowCart(false);
  }

  function changeQuantity(productId, delta) {
    const product = products.find(p => p.id === productId);
    setCart(old => old.map(item => item.productId === productId
      ? { ...item, quantity: Math.min(product?.stock || 99, item.quantity + delta) } : item)
      .filter(item => item.quantity > 0));
  }

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const data = await request(endpoint, { method: 'POST', body: JSON.stringify(form) });
      setToken(data.token); setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setShowAuth(false); setForm({ name: '', email: '', password: '' });
      setMessage(`Welcome${data.user.name ? `, ${data.user.name}` : ''}!`);
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  }

  async function checkout() {
    if (!token) { setShowAuth(true); setMessage('Please sign in before checkout.'); return; }
    if (!cart.length) return;
    setBusy(true); setMessage('');
    try {
      const data = await request('/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: cart })
      });
      setCart([]); setShowCart(false);
      setMessage(`Order #${data.order.id} placed successfully. Total: ${money(data.order.total_cents)}. Demo checkout does not collect payment.`);
      const fresh = await request('/products');
      setProducts(fresh);
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  }

  function logout() {
    setToken(''); setUser(null);
    localStorage.removeItem('token'); localStorage.removeItem('user');
    setMessage('You have signed out.');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">N</span> northstar<span className="brand-light">/shop</span></a>
        <nav><a href="#products">Shop</a><a href="#story">Our story</a></nav>
        <div className="header-actions">
          {user ? <button className="text-button" onClick={logout}>Hi, {user.name.split(' ')[0]} · Sign out</button>
            : <button className="text-button" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>Sign in</button>}
          <button className="cart-button" onClick={() => setShowCart(true)} aria-label="Open shopping cart">Bag <span>{cartCount}</span></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line"></span> THOUGHTFULLY CHOSEN GOODS</div>
            <h1>Good things.<br /><em>Every day.</em></h1>
            <p>Useful essentials, considered design, and little upgrades that make everyday life feel better.</p>
            <a className="primary-button" href="#products">Explore the collection <span>↗</span></a>
            <div className="hero-note"><span>✳</span> Made for the everyday, built to last.</div>
          </div>
          <div className="hero-visual">
            <div className="hero-image"></div>
            <div className="image-caption"><span>THE EVERYDAY EDIT</span><span>01 / 04</span></div>
            <div className="floating-stamp">LESS,<br />BUT<br /><i>BETTER.</i></div>
          </div>
          <div className="hero-index">01 — DISCOVER</div>
        </section>

        <section className="trust-row">
          <div><span>✳</span><p>Thoughtful design</p></div><div><span>↗</span><p>Everyday essentials</p></div><div><span>◇</span><p>Made to be enjoyed</p></div><div><span>♡</span><p>Small things, big joy</p></div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading"><div><div className="eyebrow">THE COLLECTION</div><h2>Meet your new <em>favourites.</em></h2></div><span className="product-count">{products.length.toString().padStart(2, '0')} PRODUCTS</span></div>
          {message && <div className="notice" role="status">{message}<button onClick={() => setMessage('')} aria-label="Dismiss message">×</button></div>}
          {products.length === 0 ? <div className="empty-state">Loading products…</div> : <div className="product-grid">
            {products.map((product, index) => <article className="product-card" key={product.id}>
              <div className={`product-image image-tone-${index % 4}`}>
                <img src={product.image_url} alt={product.name} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} />
                <span className="product-tag">{index === 0 ? 'BESTSELLER' : index === 1 ? 'EVERYDAY TECH' : 'CONSIDERED GOODS'}</span>
                <button className="quick-add" onClick={() => addToCart(product)} disabled={product.stock < 1} aria-label={`Add ${product.name} to bag`}>+</button>
              </div>
              <div className="product-meta"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.price_cents)}</strong></div>
              <div className="stock-line">{product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'} <span>·</span> Ready to ship</div>
            </article>)}
          </div>}
        </section>

        <section className="story-section" id="story"><div className="story-symbol">N.</div><div><div className="eyebrow">A LITTLE ABOUT US</div><h2>Buy less.<br /><em>Choose well.</em></h2></div><p>We believe the things we keep close should earn their place. A small collection of useful, well-designed goods for wherever your day takes you.</p></section>
      </main>

      <footer><a className="brand" href="#"><span className="brand-mark">N</span> northstar<span className="brand-light">/shop</span></a><span>Good things for everyday living.</span><span>© 2026 Northstar Shop</span></footer>

      {showCart && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setShowCart(false); }}>
        <aside className="drawer">
          <div className="drawer-heading"><div><div className="eyebrow">YOUR SELECTION</div><h2>Your bag <em>({cartCount})</em></h2></div><button className="close-button" onClick={() => setShowCart(false)}>×</button></div>
          {!cart.length ? <div className="empty-state">Your bag is taking a little break.<br /><button className="primary-button" onClick={() => setShowCart(false)}>Keep exploring</button></div> : <>
            <div className="cart-items">{cart.map(item => {
              const p = products.find(product => product.id === item.productId);
              if (!p) return null;
              return <div className="cart-item" key={item.productId}><img src={p.image_url} alt="" /><div className="cart-item-info"><h3>{p.name}</h3><strong>{money(p.price_cents)}</strong><div className="quantity"><button onClick={() => changeQuantity(p.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(p.id, 1)} disabled={item.quantity >= p.stock}>+</button></div></div><button className="remove" onClick={() => setCart(old => old.filter(x => x.productId !== p.id))}>Remove</button></div>;
            })}</div>
            <div className="cart-footer"><div className="subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div><p>Shipping and taxes calculated separately.</p><button className="primary-button full-button" disabled={busy} onClick={checkout}>{busy ? 'Please wait…' : 'Place demo order'} <span>↗</span></button><small>Demo only — no payment is collected.</small></div>
          </>}
        </aside>
      </div>}

      {showAuth && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setShowAuth(false); }}><section className="auth-modal">
        <button className="close-button modal-close" onClick={() => setShowAuth(false)}>×</button><div className="eyebrow">WELCOME TO NORTHSTAR</div><h2>{authMode === 'login' ? 'Good to see you.' : 'Make yourself at home.'}</h2><p>{authMode === 'login' ? 'Sign in to continue to checkout.' : 'Create an account to keep track of your orders.'}</p>
        <form onSubmit={submitAuth}>
          {authMode === 'register' && <label>Your name<input required minLength="2" maxLength="120" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>}
          <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input required type="password" minLength="10" maxLength="128" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><small>Use at least 10 characters.</small></label>
          <button className="primary-button full-button" disabled={busy}>{busy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'} <span>↗</span></button>
        </form>
        <div className="auth-switch">{authMode === 'login' ? 'New here?' : 'Already have an account?'} <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Create an account' : 'Sign in'}</button></div>
      </section></div>}
    </div>
  );
}
