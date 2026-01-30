'use client';

import Link from 'next/link';
import { useState } from 'react';
import WalletButton from './wallet/WalletButton';

const navLinks = [
  { label: 'Markets', href: '/markets' },
  { label: 'Radar', href: '/radar' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link href="/" className="navbar__logo">
          <img src="/logo-icon.svg" alt="TrendFi" className="navbar__logo-icon" />
          <span className="navbar__logo-text">TrendFi</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__nav">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="navbar__link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: CTA + Wallet */}
        <div className="navbar__actions">
          <a href="#wallet" className="btn-cta btn-cta--compact">
            <span>Join Now</span>
          </a>
          <WalletButton />
          <button 
            className="navbar__mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="navbar__mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="navbar__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
