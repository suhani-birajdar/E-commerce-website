import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellerDashboard.css';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    products: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
    ),
    add: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
    shop: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
    ),
    edit: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    delete: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>
    ),
  };
  return <span className="icon">{icons[name]}</span>;
};

// ── My Products ────────────────────────────────────────────────────────────
const MyProducts = ({ onEdit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('sellerToken');

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/seller/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/seller/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      alert('Something went wrong.');
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">My Products</h2>
      <p className="section-sub">All products you have listed on VESTRA.</p>
      {loading ? (
        <p style={{ color: '#6b6b6b' }}>Loading products...</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#6b6b6b' }}>No products listed yet. Add your first product!</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>
                  <div className="product-name">{p.name}</div>
                  {p.description && <div className="product-desc">{p.description}</div>}
                </td>
                <td>₹{Number(p.price).toLocaleString()}</td>
                <td>
                  <span className={`badge ${p.stock_quantity === 0 ? 'badge-rejected' : p.stock_quantity < 10 ? 'badge-pending' : 'badge-approved'}`}>
                    {p.stock_quantity === 0 ? 'Out of stock' : p.stock_quantity}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn edit" onClick={() => onEdit(p)}>
                      <Icon name="edit" /> Edit
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(p.id)}>
                      <Icon name="delete" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ── Add / Edit Product Form ────────────────────────────────────────────────
const ProductForm = ({ editProduct, onSuccess }) => {
  const isEdit = !!editProduct;
  const [form, setForm] = useState({
    name: editProduct?.name || '',
    description: editProduct?.description || '',
    price: editProduct?.price || '',
    image_url: editProduct?.image_url || '',
    stock_quantity: editProduct?.stock_quantity || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('sellerToken');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      alert('Name and price are required.');
      return;
    }
    setLoading(true);
    try {
      const url = isEdit
        ? `http://localhost:5000/api/seller/products/${editProduct.id}`
        : 'http://localhost:5000/api/seller/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
        }, 1500);
        if (!isEdit) setForm({ name: '', description: '', price: '', image_url: '', stock_quantity: '' });
      } else {
        alert(data.message || 'Failed to save product.');
      }
    } catch (err) {
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
      <p className="section-sub">{isEdit ? 'Update your product details.' : 'List a new product on VESTRA.'}</p>
      <div className="settings-card">
        <div className="form-group">
          <label>Product Name *</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Cotton Kurta" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-input" name="description" value={form.description} onChange={handleChange} placeholder="Brief description of your product..." rows={3} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 499" />
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input className="form-input" name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange} placeholder="e.g. 50" />
          </div>
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input className="form-input" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..." />
        </div>
        {form.image_url && (
          <div className="image-preview">
            <img src={form.image_url} alt="preview" onError={e => e.target.style.display = 'none'} />
          </div>
        )}
        <button className="save-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : success ? '✓ Saved!' : isEdit ? 'Update Product' : 'Add Product'}
        </button>
        {isEdit && (
          <button className="cancel-btn" onClick={onSuccess}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ── Shop Info ──────────────────────────────────────────────────────────────
const ShopInfo = () => {
  const seller = JSON.parse(localStorage.getItem('sellerInfo') || '{}');

  return (
    <div className="section">
      <h2 className="section-title">Shop Info</h2>
      <p className="section-sub">Your seller profile on VESTRA.</p>
      <div className="settings-card">
        <div className="shop-info-row">
          <div className="shop-avatar">{seller.shop_name?.charAt(0)?.toUpperCase() || 'S'}</div>
          <div>
            <h3 className="shop-name">{seller.shop_name || '—'}</h3>
            <p className="shop-owner">Owner: {seller.name || '—'}</p>
          </div>
        </div>
        <div className="info-divider" />
        <div className="form-group">
          <label>Shop Name</label>
          <input className="form-input" value={seller.shop_name || ''} disabled />
        </div>
        <div className="form-group">
          <label>Owner Name</label>
          <input className="form-input" value={seller.name || ''} disabled />
        </div>
        <p className="info-note">To update shop details, please contact VESTRA support.</p>
      </div>
    </div>
  );
};

// ── Main SellerDashboard ───────────────────────────────────────────────────
const SellerDashboard = () => {
  const [active, setActive] = useState('products');
  const [editProduct, setEditProduct] = useState(null);
  const navigate = useNavigate();
  const seller = JSON.parse(localStorage.getItem('sellerInfo') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('sellerToken');
    if (!token) navigate('/seller/login');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('sellerInfo');
    navigate('/seller/login');
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setActive('add');
  };

  const handleFormSuccess = () => {
    setEditProduct(null);
    setActive('products');
  };

  const navItems = [
    { key: 'products', label: 'My Products' },
    { key: 'add',      label: 'Add Product' },
    { key: 'shop',     label: 'Shop Info' },
  ];

  const renderContent = () => {
    switch (active) {
      case 'products': return <MyProducts onEdit={handleEdit} />;
      case 'add':      return <ProductForm editProduct={editProduct} onSuccess={handleFormSuccess} />;
      case 'shop':     return <ShopInfo />;
      default:         return <MyProducts onEdit={handleEdit} />;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-v">V</span>
          <span className="brand-name">ESTRA</span>
          <span className="brand-tag">Seller</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${active === item.key ? 'active' : ''}`}
              onClick={() => { setEditProduct(null); setActive(item.key); }}
            >
              <Icon name={item.key === 'products' ? 'products' : item.key === 'add' ? 'add' : 'shop'} />
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
          <p className="topbar-label">
            {active === 'add' && editProduct ? 'Edit Product' : navItems.find(n => n.key === active)?.label}
          </p>
          <div className="seller-topbar-right">
            <span className="seller-shop-name">{seller.shop_name}</span>
            <div className="admin-avatar">{seller.shop_name?.charAt(0)?.toUpperCase() || 'S'}</div>
          </div>
        </header>
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;