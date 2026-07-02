import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
  FiChevronDown, FiChevronRight, FiLogOut, FiPackage, FiShield, FiZap
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { productAPI } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { CATEGORY_TREE } from '../../utils/helpers';

// ─── Mega Menu Data ────────────────────────────────────────────────────────────
// Each category shows its sub-categories and the first few types

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [mobileSubExpanded, setMobileSubExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const searchRef = useRef(null);
  const megaRef = useRef(null);
  const megaTimer = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, openCart, fetchCart } = useCartStore();
  const { wishlist, fetchWishlist } = useWishlistStore();

  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const wishlistCount = wishlist?.products?.length || 0;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) { fetchCart(); fetchWishlist(); }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!debouncedSearch.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    productAPI.getAll({ search: debouncedSearch, limit: 6 })
      .then(data => setSearchResults(data.products || []))
      .catch(() => setSearchResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!searchRef.current?.contains(e.target)) setSearchQuery('');
      if (!megaRef.current?.contains(e.target)) setActiveMega(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate('/'); };

  const openMega = (catId) => {
    clearTimeout(megaTimer.current);
    setActiveMega(catId);
  };

  const closeMega = () => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 120);
  };

  const keepMegaOpen = () => {
    clearTimeout(megaTimer.current);
  };

  const navToShop = (category, subCategory = '', productType = '') => {
    const params = new URLSearchParams();
    if (subCategory) params.set('subCategory', subCategory);
    if (productType) params.set('productType', productType);
    navigate(`/shop/${category}${params.toString() ? '?' + params.toString() : ''}`);
    setActiveMega(null);
    setIsMobileOpen(false);
  };

  const catEntries = Object.entries(CATEGORY_TREE);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/96 backdrop-blur-lg shadow-md' : 'bg-white'}`}>

      {/* ─── Marquee Top Bar ─────────────────────────────────────────── */}
      <div className="bg-red-600 text-white overflow-hidden">
        <style>{`
          @keyframes marqueeLeft { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
          .marquee-track { display: flex; width: max-content; white-space: nowrap; animation: marqueeLeft 20s linear infinite; }
        `}</style>
        <div className="marquee-track items-center text-xs sm:text-sm py-1.5 font-medium">
          {[
            'Free Delivery on orders above ₹999 — Shop more & save more',
            '🎉 Flat 10% OFF on First Order — Use WELCOME10',
            '✨ New Season Collection Just Dropped — Limited Stock!',
            '⚡ Extra 20% OFF on Selected Items — Today Only',
            '🔒 Easy Returns & 100% Secure Payments',
            '🚚 Fast Shipping Across India — Delivered in 2–5 Days',
          ].flatMap((msg, i) => [
            <span key={i} className="mx-16 tracking-wide">{msg}</span>,
            <span key={`dup-${i}`} className="mx-16 tracking-wide">{msg}</span>,
          ])}
        </div>
      </div>

      {/* ─── Main Nav Row ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/tecai.png" alt="LuxeFit" className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain" />
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <input
              type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search clothes, brands, categories..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm transition-all"
            />
            <AnimatePresence>
              {(searchResults.length > 0 || isSearching) && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                  ) : searchResults.map(product => (
                    <Link key={product._id} to={`/product/${product._id}`}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-red-600 font-bold">₹{product.price}</p>
                          {product.subCategory && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{product.subCategory}</span>}
                        </div>
                      </div>
                      <FiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </Link>
                  ))}
                  {searchResults.length > 0 && (
                    <Link to={`/shop?search=${searchQuery}`} onClick={() => setSearchQuery('')}
                      className="block text-center py-3 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors border-t border-gray-100">
                      See all results for "{searchQuery}" →
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button onClick={() => isAuthenticated ? navigate('/wishlist') : navigate('/login')}
              className="relative p-2.5 text-gray-600 hover:text-pink-500 transition-colors hidden md:flex items-center">
              <FiHeart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-xs min-w-4 h-4 rounded-full flex items-center justify-center px-1 font-bold">{wishlistCount}</span>
              )}
            </button>

            <button onClick={() => isAuthenticated ? openCart() : navigate('/login')}
              className="relative p-2.5 text-gray-600 hover:text-red-600 transition-colors flex items-center">
              <FiShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-1 font-bold">{itemCount}</span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors ml-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs text-gray-500 leading-none">Hello,</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight max-w-20 truncate">{user?.name?.split(' ')[0]}</p>
                  </div>
                  <FiChevronDown className="w-3.5 h-3.5 text-gray-500 hidden md:block" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
                        <p className="font-bold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                      </div>
                      {[
                        { to: '/profile', icon: <FiUser className="w-4 h-4" />, label: 'My Profile' },
                        { to: '/orders', icon: <FiPackage className="w-4 h-4" />, label: 'My Orders' },
                        { to: '/wishlist', icon: <FiHeart className="w-4 h-4" />, label: 'Wishlist' },
                        ...(user?.role === 'admin' ? [{ to: '/admin', icon: <FiShield className="w-4 h-4" />, label: 'Admin Panel' }] : []),
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <span className="text-red-500">{item.icon}</span> {item.label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100 font-medium">
                        <FiLogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors ml-2">
                <FiUser className="w-4 h-4" /> Sign In
              </Link>
            )}

            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 md:hidden text-gray-600 ml-1">
              {isMobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ─── Category Nav Bar (desktop) ────────────────────────────── */}
        <nav ref={megaRef} className="hidden md:flex items-center gap-0.5 border-t border-gray-100 py-1">
          <Link to="/shop"
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            All Products
          </Link>

          {catEntries.map(([catId, catData]) => (
            <div
              key={catId}
              className="relative"
              onMouseEnter={() => openMega(catId)}
              onMouseLeave={closeMega}
            >
              <button
                onClick={() => navToShop(catId)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeMega === catId ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                {catData.label}
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMega === catId ? 'rotate-180 text-red-500' : ''}`} />
              </button>

              {/* ── MEGA MENU PANEL ── */}
              <AnimatePresence>
                {activeMega === catId && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={keepMegaOpen}
                    onMouseLeave={closeMega}
                    className="absolute top-full left-0 mt-0 bg-white border border-gray-200 shadow-2xl rounded-2xl z-50 overflow-hidden"
                    style={{ minWidth: '680px', maxWidth: '860px' }}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 flex items-center justify-between">
                      <button
                        onClick={() => navToShop(catId)}
                        className="text-white font-bold text-base hover:underline flex items-center gap-2"
                      >
                        {catData.label}
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                      <span className="text-red-200 text-xs">{Object.keys(catData.subCategories).length} categories</span>
                    </div>

                    {/* Grid of sub-categories */}
                    <div
                      className="p-5 grid gap-5 overflow-y-auto"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(Object.keys(catData.subCategories).length, 4)}, 1fr)`,
                        maxHeight: '480px',
                      }}
                    >
                      {Object.entries(catData.subCategories).map(([subId, subData]) => (
                        <div key={subId} className="min-w-0">
                          {/* Sub-category title */}
                          <button
                            onClick={() => navToShop(catId, subId)}
                            className="text-sm font-bold text-gray-900 hover:text-red-600 transition-colors mb-2 flex items-center gap-1 group w-full text-left"
                          >
                            {subData.label}
                            <FiChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                          </button>

                          {/* Types list */}
                          <ul className="space-y-1">
                            {subData.types.slice(0, 8).map(type => (
                              <li key={type}>
                                <button
                                  onClick={() => navToShop(catId, subId, type)}
                                  className="text-xs text-gray-500 hover:text-red-600 hover:font-medium transition-all text-left w-full truncate block py-0.5"
                                >
                                  {type}
                                </button>
                              </li>
                            ))}
                            {subData.types.length > 8 && (
                              <li>
                                <button
                                  onClick={() => navToShop(catId, subId)}
                                  className="text-xs text-red-500 font-semibold hover:underline mt-1 block"
                                >
                                  +{subData.types.length - 8} more →
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Footer CTA */}
                    <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {Object.values(catData.subCategories).reduce((a, b) => a + b.types.length, 0)}+ product types available
                      </span>
                      <button
                        onClick={() => navToShop(catId)}
                        className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        View All {catData.label} <FiChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <Link to="/shop?isFlashSale=true"
            className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1.5 ml-2">
            <FiZap className="w-3.5 h-3.5" /> Flash Sale
          </Link>
        </nav>
      </div>

      {/* ─── Mobile Menu ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <div className="p-4">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text" placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-50"
                />
              </div>

              {/* Mobile Nav Links */}
              <div className="space-y-1">
                <Link to="/shop" onClick={() => setIsMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">
                  All Products
                </Link>

                {catEntries.map(([catId, catData]) => (
                  <div key={catId}>
                    {/* Category row */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navToShop(catId)}
                        className="flex-1 text-left px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        {catData.label}
                      </button>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === catId ? null : catId)}
                        className="p-3 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FiChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === catId ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Sub-categories accordion */}
                    <AnimatePresence>
                      {mobileExpanded === catId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 overflow-hidden"
                        >
                          {Object.entries(catData.subCategories).map(([subId, subData]) => (
                            <div key={subId} className="border-l-2 border-gray-100 pl-3 mb-1">
                              <div className="flex items-center">
                                <button
                                  onClick={() => navToShop(catId, subId)}
                                  className="flex-1 text-left px-3 py-2.5 text-sm font-semibold text-gray-600 rounded-lg hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                  {subData.label}
                                </button>
                                <button
                                  onClick={() => setMobileSubExpanded(mobileSubExpanded === subId ? null : subId)}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileSubExpanded === subId ? 'rotate-180' : ''}`} />
                                </button>
                              </div>

                              {/* Types */}
                              <AnimatePresence>
                                {mobileSubExpanded === subId && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-3 overflow-hidden"
                                  >
                                    <div className="grid grid-cols-2 gap-1 py-2">
                                      {subData.types.map(type => (
                                        <button
                                          key={type}
                                          onClick={() => navToShop(catId, subId, type)}
                                          className="text-left text-xs text-gray-500 hover:text-red-600 hover:font-medium py-1.5 px-2 rounded-lg hover:bg-red-50 transition-all truncate"
                                        >
                                          {type}
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <Link to="/shop?isFlashSale=true" onClick={() => setIsMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 transition-all flex items-center gap-2">
                  <FiZap className="w-4 h-4" /> Flash Sale
                </Link>

                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setIsMobileOpen(false)}
                    className="block w-full text-center bg-red-600 text-white font-bold py-3 rounded-xl mt-3 hover:bg-red-700 transition-colors">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
