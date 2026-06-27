import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <p className="about-eyebrow">WHO WE ARE</p>
        <h1 className="about-title">
          Fashion, reimagined<br />for independent voices.
        </h1>
        <p className="about-subtitle">
          VESTRA is a curated marketplace where independent sellers bring unique
          fashion and lifestyle products to people who care about style and individuality.
        </p>
      </section>

      {/* ── Story + Why ── */}
      <section className="about-cards">
        <div className="about-card">
          <div className="about-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="about-card-title">Our Story</h2>
          <p className="about-card-text">
            VESTRA was born from a simple belief — that great style shouldn't be limited
            to big brands. We built a space where passionate sellers can reach customers
            who value authenticity, craftsmanship, and individuality over mass production.
          </p>
          <p className="about-card-text" style={{ marginTop: '12px' }}>
            Every seller on VESTRA is hand-reviewed by our team, ensuring you always
            shop from trusted, quality-driven creators.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="about-card-title">Why Choose VESTRA</h2>
          {[
            { title: 'Verified Sellers',      desc: 'Every seller is approved by our admin team before listing products.' },
            { title: 'Unique Collections',    desc: "Discover fashion you won't find anywhere else — straight from independent creators." },
            { title: 'Secure Shopping',       desc: 'Your data and transactions are always protected on our platform.' },
            { title: 'Support Independents',  desc: 'Every purchase directly supports a small business owner.' },
          ].map((item, i) => (
            <div key={i} className="about-point">
              <div className="about-dot" />
              <div>
                <p className="about-point-title">{item.title}</p>
                <p className="about-point-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats">
        {[
          { value: '500+',  label: 'Independent Sellers' },
          { value: '10K+',  label: 'Products Listed' },
          { value: '50K+',  label: 'Happy Customers' },
        ].map((stat, i) => (
          <div key={i} className={`about-stat-card ${i === 1 ? 'accent' : ''}`}>
            <h3 className="about-stat-value">{stat.value}</h3>
            <p className="about-stat-label">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ── Mission ── */}
      <section className="about-mission">
        <div className="about-mission-inner">
          <p className="about-eyebrow" style={{ color: '#1D9E75' }}>OUR MISSION</p>
          <h2 className="about-mission-title">
            Empowering creators.<br />Inspiring shoppers.
          </h2>
          <p className="about-mission-text">
            We believe fashion is personal. That's why we've built a platform that puts
            independent sellers first — giving them the tools to reach customers who
            appreciate what makes their work special. When you shop on VESTRA, you're
            not just buying clothes. You're supporting a dream.
          </p>
          <button
            className="about-cta"
            onClick={() => window.location.href = '/seller/register'}
          >
            Start Selling on VESTRA
          </button>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;