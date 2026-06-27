import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './AdminPanel.css';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    sellers: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    products: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
    ),
    customers: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
    ),
  };
  return <span className="icon">{icons[name]}</span>;
};

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div className={`stat-card ${accent ? 'accent' : ''}`}>
    <p className="stat-label">{label}</p>
    <h2 className="stat-value">{value}</h2>
    {sub && <p className="stat-sub">{sub}</p>}
  </div>
);

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState({ sellers: 0, customers: 0, products: 0, pending: 0 });
  const [recentSellers, setRecentSellers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      api.get('/admin/sellers', { headers }),
      api.get('/admin/customers', { headers }),
      api.get('/admin/products', { headers }),
    ]).then(([sellersRes, customersRes, productsRes]) => {
      const sellers = sellersRes.data;
      setStats({
        sellers: sellers.length,
        customers: customersRes.data.length,
        products: productsRes.data.length,
        pending: sellers.filter(s => s.status === 'pending').length,
      });
      setRecentSellers(sellers.slice(0, 3));
    }).catch(console.error);
  }, []);

  return (
    <div className="section">
      <h2 className="section-title">Dashboard</h2>
      <p className="section-sub">Welcome back, Admin. Here's what's happening on VESTRA.</p>
      <div className="stats-grid">
        <StatCard label="Total Customers" value={stats.customers} sub="registered users" accent />
        <StatCard label="Total Sellers" value={stats.sellers} sub={`${stats.pending} pending approval`} />
        <StatCard label="Total Products" value={stats.products} sub="across all sellers" />
      </div>
      <div className="recent-section">
        <h3 className="recent-title">Recent Seller Registrations</h3>
        <table className="data-table">
          <thead>
            <tr><th>Shop Name</th><th>Email</th><th>Registered</th><th>Status</th></tr>
          </thead>
          <tbody>
            {recentSellers.map((s, i) => (
              <tr key={i}>
                <td>{s.shop_name}</td>
                <td>{s.email}</td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
                <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Sellers ────────────────────────────────────────────────────────────────
const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    api.get('/admin/sellers', { headers })
      .then(res => setSellers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/sellers/${id}/status`, { status: newStatus }, { headers });
      setSellers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered = filter === 'all' ? sellers : sellers.filter(s => s.status === filter);

  return (
    <div className="section">
      <h2 className="section-title">Sellers</h2>
      <p className="section-sub">Manage seller accounts and approval status.</p>
      <div className="filter-bar">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <p style={{ color: '#6b6b6b' }}>Loading sellers...</p> : (
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Shop</th><th>Email</th><th>Registered</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.shop_name}</td>
                <td>{s.email}</td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
                <td>
                  <select
                    className={`status-select status-${s.status}`}
                    value={s.status}
                    onChange={(e) => updateStatus(s.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ── Products ───────────────────────────────────────────────────────────────
const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    api.get('/admin/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.seller && p.seller.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="section">
      <h2 className="section-title">Products</h2>
      <p className="section-sub">All products listed by sellers on VESTRA.</p>
      <div className="filter-bar">
        <input className="search-input" placeholder="Search by product or seller..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <p style={{ color: '#6b6b6b' }}>Loading products...</p> : (
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Product</th><th>Price</th><th>Stock</th><th>Seller</th><th>Listed On</th></tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>₹{Number(p.price).toLocaleString()}</td>
                <td>
                  <span className={`badge ${p.stock_quantity === 0 ? 'badge-rejected' : p.stock_quantity < 10 ? 'badge-pending' : 'badge-approved'}`}>
                    {p.stock_quantity === 0 ? 'Out of stock' : p.stock_quantity}
                  </span>
                </td>
                <td>{p.seller || '—'}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ── Customers ──────────────────────────────────────────────────────────────
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    api.get('/admin/customers', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCustomers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section">
      <h2 className="section-title">Customers</h2>
      <p className="section-sub">All registered customers on VESTRA.</p>
      <div className="filter-bar">
        <input className="search-input" placeholder="Search by username or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <p style={{ color: '#6b6b6b' }}>Loading customers...</p> : (
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Username</th><th>Email</th><th>Verified</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td>{c.username}</td>
                <td>{c.email}</td>
                <td>
                  <span className={`badge ${c.is_verified ? 'badge-approved' : 'badge-pending'}`}>
                    {c.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ── Settings ───────────────────────────────────────────────────────────────
const Settings = () => {
  const [form, setForm] = useState({ name: 'Admin', email: 'admin@vestra.com', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="section">
      <h2 className="section-title">Settings</h2>
      <p className="section-sub">Update your admin profile and password.</p>
      <div className="settings-card">
        <h3 className="settings-group-title">Profile</h3>
        <div className="form-group">
          <label>Name</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="form-input" name="email" value={form.email} onChange={handleChange} />
        </div>
        <h3 className="settings-group-title" style={{ marginTop: '28px' }}>Change Password</h3>
        <div className="form-group">
          <label>Current Password</label>
          <input className="form-input" type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="••••••••" />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input className="form-input" type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="••••••••" />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
        </div>
        <button className="save-btn" onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// ── Main AdminPanel ────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [active, setActive] = useState('dashboard');
  const navigate = useNavigate();

  // ✅ Fixed: redirect to /login if no token
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/login');
  }, []);

  // ✅ Fixed: logout also goes to /login
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'sellers', label: 'Sellers' },
    { key: 'products', label: 'Products' },
    { key: 'customers', label: 'Customers' },
    { key: 'settings', label: 'Settings' },
  ];

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <Dashboard />;
      case 'sellers':   return <Sellers />;
      case 'products':  return <Products />;
      case 'customers': return <Customers />;
      case 'settings':  return <Settings />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-v">V</span>
          <span className="brand-name">ESTRA</span>
          <span className="brand-tag">Admin</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${active === item.key ? 'active' : ''}`}
              onClick={() => setActive(item.key)}
            >
              <Icon name={item.key} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <p className="topbar-label">{navItems.find(n => n.key === active)?.label}</p>
          <div className="admin-avatar">A</div>
        </header>
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;