import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { VersionInfo } from './VersionInfo';
import { CouponSlider } from './CouponSlider';
import { ScrollToTop } from './ScrollToTop';
import { PaymentMethods } from './PaymentMethods';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      {/* Coupon Slider - Only for customers */}
      {user?.role !== 'admin' && <CouponSlider />}
      
      {/* Modern Navigation */}
      <nav className="bg-account-menu backdrop-blur-md shadow-glass sticky top-0 z-50 border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            {/* Logo */}
            <Link
              href={user?.role === 'admin' ? '/admin' : '/'}
              className="flex items-center space-x-2 group flex-shrink-0"
            >
              <div className="w-10 h-10 bg-button rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-button-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-foreground">
                TouchMunyun
              </span>
            </Link>

            {/* Search Bar - Centered (Only for customers) */}
            {user?.role !== 'admin' && (
              <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearch} className="w-full relative">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-4 py-2.5 pl-12 pr-4 border border-foreground/20 rounded-lg bg-primary/80 backdrop-blur-md text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all shadow-glass hover:shadow-lg hover:border-button/50"
                    />
                    <button
                      type="submit"
                      className="absolute left-3 p-1.5 text-foreground/60 hover:text-button transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
              {user?.role === 'admin' ? (
                // Admin Navigation - Simplified
                <>
                  <Link
                    href="/admin"
                    className={`font-medium transition-all duration-300 relative group ${
                      router.pathname === '/admin' || router.pathname.startsWith('/admin')
                        ? 'text-button' 
                        : 'text-foreground hover:text-button'
                    }`}
                  >
                    Dashboard
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-button transition-all duration-300 ${
                      router.pathname === '/admin' || router.pathname.startsWith('/admin')
                        ? 'w-full' 
                        : 'w-0 group-hover:w-full'
                    }`} />
                    {router.pathname === '/admin' && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-button rounded-full animate-pulse" />
                    )}
                  </Link>
                  <Link
                    href="/products"
                    className={`font-medium transition-all duration-300 relative group ${
                      router.pathname === '/products'
                        ? 'text-button' 
                        : 'text-foreground hover:text-button'
                    }`}
                  >
                    View Products
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-button transition-all duration-300 ${
                      router.pathname === '/products'
                        ? 'w-full' 
                        : 'w-0 group-hover:w-full'
                    }`} />
                    {router.pathname === '/products' && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-button rounded-full animate-pulse" />
                    )}
                  </Link>
                </>
              ) : (
                // Customer Navigation
                <>
                  <Link
                    href="/products"
                    className={`font-medium transition-all duration-300 relative group ${
                      router.pathname === '/products'
                        ? 'text-button' 
                        : 'text-foreground hover:text-button'
                    }`}
                  >
                    Products
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-button transition-all duration-300 ${
                      router.pathname === '/products'
                        ? 'w-full' 
                        : 'w-0 group-hover:w-full'
                    }`} />
                    {router.pathname === '/products' && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-button rounded-full animate-pulse" />
                    )}
                  </Link>
                  <Link
                    href="/new-arrivals"
                    className={`font-medium transition-all duration-300 relative group ${
                      router.pathname === '/new-arrivals'
                        ? 'text-button' 
                        : 'text-foreground hover:text-button'
                    }`}
                  >
                    New Arrivals
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-button transition-all duration-300 ${
                      router.pathname === '/new-arrivals'
                        ? 'w-full' 
                        : 'w-0 group-hover:w-full'
                    }`} />
                    {router.pathname === '/new-arrivals' && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-button rounded-full animate-pulse" />
                    )}
                  </Link>
                  <Link
                    href="/best-sellers"
                    className={`font-medium transition-all duration-300 relative group ${
                      router.pathname === '/best-sellers'
                        ? 'text-button' 
                        : 'text-foreground hover:text-button'
                    }`}
                  >
                    Best Sellers
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-button transition-all duration-300 ${
                      router.pathname === '/best-sellers'
                        ? 'w-full' 
                        : 'w-0 group-hover:w-full'
                    }`} />
                    {router.pathname === '/best-sellers' && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-button rounded-full animate-pulse" />
                    )}
                  </Link>
                  <Link
                    href="/collections"
                    className={`font-medium transition-all duration-300 relative group ${
                      router.pathname === '/collections'
                        ? 'text-button' 
                        : 'text-foreground hover:text-button'
                    }`}
                  >
                    Collections
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-button transition-all duration-300 ${
                      router.pathname === '/collections'
                        ? 'w-full' 
                        : 'w-0 group-hover:w-full'
                    }`} />
                    {router.pathname === '/collections' && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-button rounded-full animate-pulse" />
                    )}
                  </Link>
                  <Link
                    href="/about"
                    className={`font-medium transition-all duration-300 relative group ${
                      router.pathname === '/about'
                        ? 'text-button' 
                        : 'text-foreground hover:text-button'
                    }`}
                  >
                    About
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-button transition-all duration-300 ${
                      router.pathname === '/about'
                        ? 'w-full' 
                        : 'w-0 group-hover:w-full'
                    }`} />
                    {router.pathname === '/about' && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-button rounded-full animate-pulse" />
                    )}
                  </Link>
                  <Link
                    href="/cart"
                    className={`relative font-medium transition-all duration-300 group flex items-center gap-2 ${
                      router.pathname === '/cart'
                        ? 'text-button' 
                        : 'text-foreground hover:text-button'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="hidden lg:inline">Cart</span>
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                        {itemCount}
                      </span>
                    )}
                    {router.pathname === '/cart' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-button" />
                    )}
                  </Link>
                </>
              )}
              {/* User Menu */}
              <div className="relative user-menu-container">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 text-foreground hover:text-button font-medium transition-colors"
                    >
                      <div className="w-8 h-8 bg-button rounded-full flex items-center justify-center text-button-text font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span>{user?.name}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-account-menu backdrop-blur-lg rounded-xl shadow-glass-lg py-2 z-50 border border-foreground/10">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-primary/50 hover:text-button transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Profile</span>
                        </Link>
                        {user?.role !== 'admin' && (
                          <Link
                            href="/orders"
                            className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-primary/50 hover:text-button transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            <span>My Orders</span>
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-primary/50 hover:text-button transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <div className="border-t border-primary-500/30 my-1"></div>
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-foreground/70 hover:bg-primary/50 hover:text-foreground transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-foreground hover:text-button font-medium transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Account</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
                {!isAuthenticated && userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-account-menu backdrop-blur-lg rounded-xl shadow-glass-lg py-2 z-50 border border-foreground/10">
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-primary-300 hover:text-button transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-primary-300 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Search Button (Only for customers) */}
            {user?.role !== 'admin' && (
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden lg:hidden p-2 rounded-lg text-foreground hover:bg-primary-300 mr-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-primary-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Search Bar (Only for customers) */}
          {user?.role !== 'admin' && showSearch && (
            <div className="md:hidden lg:hidden py-3 border-t border-foreground/10 px-4">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2.5 pl-12 pr-4 border border-foreground/20 rounded-lg bg-primary/80 backdrop-blur-md text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 focus:bg-primary outline-none transition-all shadow-glass hover:shadow-lg hover:border-button/50"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 text-foreground/60 hover:text-button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-foreground/10">
              {user?.role === 'admin' ? (
                // Admin Mobile Navigation - Simplified
                <div className="flex flex-col space-y-4 px-4">
                  <Link
                    href="/admin"
                    className="text-foreground hover:text-button font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/products"
                    className="text-foreground hover:text-button font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View Products
                  </Link>
                </div>
              ) : (
                // Customer Mobile Navigation
                <div className="flex flex-col space-y-4 px-4">
                  <Link
                    href="/products"
                    className="text-foreground hover:text-button font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    href="/new-arrivals"
                    className="text-foreground hover:text-button font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    New Arrivals
                  </Link>
                  <Link
                    href="/best-sellers"
                    className="text-foreground hover:text-button font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Best Sellers
                  </Link>
                  <Link
                    href="/collections"
                    className="text-foreground hover:text-button font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Collections
                  </Link>
                  <Link
                    href="/about"
                    className="text-foreground hover:text-button font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/cart"
                    className="text-foreground hover:text-button font-medium flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cart
                    {itemCount > 0 && (
                      <span className="bg-gold-500 text-white text-xs font-bold rounded-full px-2 py-1">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}
                {isAuthenticated ? (
                  <>
                    <div className="pt-4 border-t border-foreground/10 px-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-button rounded-full flex items-center justify-center text-button-text font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-foreground font-medium">{user?.name}</span>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 text-foreground hover:text-button font-medium mb-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>Profile</span>
                      </Link>
                      {user?.role !== 'admin' && (
                        <Link
                          href="/orders"
                          className="flex items-center space-x-2 text-foreground hover:text-button font-medium mb-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span>My Orders</span>
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 text-foreground hover:text-button font-medium mb-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full text-foreground/70 hover:text-foreground font-medium"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-foreground/10">
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 text-foreground hover:text-button font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center space-x-2 bg-button text-button-text px-4 py-2 rounded-lg font-semibold text-center hover:bg-button-200 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      {/* Sports Background Section Above Footer */}
      <section className="relative overflow-hidden bg-black py-20">
        {/* Dynamic Sports Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/85" />
          
          {/* Red Accent Overlay for Sports Energy */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/15 via-transparent to-red-600/10" />
          
          {/* Gold Accent Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-gold-600/5" />
          
          {/* Animated Sports Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 50 L50 40 L40 50 Z' fill='%23dc2626' opacity='0.3'/%3E%3Ccircle cx='20' cy='20' r='3' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='3' fill='%23ffffff' opacity='0.2'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              animation: 'shimmer 20s linear infinite',
            }} />
          </div>
        </div>

        {/* Floating Sports Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-600/20 rounded-full blur-xl animate-float animation-delay-200" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gold-600/20 rounded-full blur-2xl animate-float animation-delay-400" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full blur-lg animate-float animation-delay-600" />
        <div className="absolute bottom-1/4 left-20 w-24 h-24 bg-red-600/15 rounded-full blur-xl animate-float animation-delay-300" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <span className="block">Experience the</span>
            <span className="block text-red-600">Dynamics of Sports</span>
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            From football to tennis, discover premium sportswear that matches your passion and performance
          </p>
        </div>

        {/* Decorative Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Modern Footer with Football Sports Background */}
      <footer className="relative overflow-hidden bg-black text-white/70 mt-auto border-t border-white/10">
        {/* Dynamic Football Sports Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/90" />
          
          {/* Red Accent Overlay for Sports Energy */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-red-600/8" />
          
          {/* Gold Accent Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-gold-600/5" />
          
          {/* Animated Sports Pattern Overlay */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 50 L50 40 L40 50 Z' fill='%23dc2626' opacity='0.3'/%3E%3Ccircle cx='20' cy='20' r='3' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='3' fill='%23ffffff' opacity='0.2'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              animation: 'shimmer 20s linear infinite',
            }} />
          </div>
        </div>

        {/* Floating Football Sports Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-600/15 rounded-full blur-xl animate-float animation-delay-200" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gold-600/15 rounded-full blur-2xl animate-float animation-delay-400" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/8 rounded-full blur-lg animate-float animation-delay-600" />
        <div className="absolute bottom-1/4 left-20 w-24 h-24 bg-red-600/12 rounded-full blur-xl animate-float animation-delay-300" />
        <div className="absolute top-1/4 left-1/3 w-28 h-28 bg-gold-600/12 rounded-full blur-2xl animate-float animation-delay-500" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                TouchMunyun
              </h3>
              <p className="text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                where artistry meets sophistication, offering unique handcrafted treasures that elevate your lifestyle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Quick Links</h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link href="/products" className="hover:text-white hover:text-red-600 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Products
                  </Link>
                </li>
                {user?.role !== 'admin' && (
                  <li>
                    <Link href="/cart" className="hover:text-white hover:text-red-600 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      Shopping Cart
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Support</h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link href="/help" className="hover:text-white hover:text-red-600 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white hover:text-red-600 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white hover:text-red-600 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white hover:text-red-600 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Connect</h4>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://www.instagram.com/_touchmunyun" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-pink-500 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com/TouchmunyunLLC" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-blue-400 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  aria-label="Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a 
                  href="mailto:TouchMunyunLLC@gmail.com" 
                  className="text-white/80 hover:text-yellow-400 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  aria-label="Email"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20">
            {/* Payment Methods */}
            <PaymentMethods />
            
            {/* Copyright and Version */}
            <div className="mt-6 text-center text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <p>&copy; {new Date().getFullYear()} TouchMunyun. All rights reserved.</p>
              <div className="mt-2">
                <VersionInfo />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Gradient Fade at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent" />
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};
