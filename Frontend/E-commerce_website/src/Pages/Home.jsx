import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const categories = [
  { name: "Men's Wear", emoji: "👔", desc: "Sharp fits for every occasion" },
  { name: "Women's Wear", emoji: "👗", desc: "Curated styles, your way" },
  { name: "Accessories", emoji: "👜", desc: "Details that define you" },
  { name: "Footwear", emoji: "👟", desc: "Step with intention" },
];

const steps = [
  { num: "01", title: "Browse", desc: "Explore thousands of products from verified sellers." },
  { num: "02", title: "Add to Cart", desc: "Save favourites and checkout when you're ready." },
  { num: "03", title: "Delivered", desc: "Fast, reliable delivery right to your door." },
];

export default function Home() {
  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__content">
          <span className="hero__eyebrow">New Season. New You.</span>
          <h1 className="hero__heading">
            Dress the life<br />
            you're <em>building.</em>
          </h1>
          <p className="hero__sub">
            Thousands of styles from independent sellers — all in one place.
          </p>
          <div className="hero__actions">
            <Link to="/products" className="btn btn--primary">Shop Now</Link>
            <Link to="/seller/register" className="btn btn--outline">Sell on VESTRA</Link>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__card hero__card--1">
            <span className="card-emoji">👗</span>
            <p>Women's Wear</p>
          </div>
          <div className="hero__card hero__card--2">
            <span className="card-emoji">👔</span>
            <p>Men's Wear</p>
          </div>
          <div className="hero__card hero__card--3">
            <span className="card-emoji">👟</span>
            <p>Footwear</p>
          </div>
          <div className="hero__card hero__card--4">
            <span className="card-emoji">👜</span>
            <p>Accessories</p>
          </div>
          <div className="hero__accent-stripe" />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="categories">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories__grid">
          {categories.map((cat) => (
            <Link to="/products" className="cat-card" key={cat.name}>
              <span className="cat-card__emoji">{cat.emoji}</span>
              <h3 className="cat-card__name">{cat.name}</h3>
              <p className="cat-card__desc">{cat.desc}</p>
              <span className="cat-card__arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-it-works">
        <h2 className="section-title">How VESTRA Works</h2>
        <div className="steps">
          {steps.map((step) => (
            <div className="step" key={step.num}>
              <span className="step__num">{step.num}</span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2>Ready to sell your products?</h2>
          <p>Join hundreds of sellers already growing their business on VESTRA.</p>
          <Link to="/seller/register" className="btn btn--white">Become a Seller</Link>
        </div>
      </section>

    </div>
  );
}