import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiTrendingDown, FiArrowRight, FiLogOut } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatPrice, formatDateShort, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';

const AdminNav = () => {
  const { user, logout } = useAuthStore();
  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👗</span>
          <span className="font-display text-xl font-bold text-white">LuxeFit</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {[
          { to: '/admin', icon: '📊', label: 'Dashboard' },
          { to: '/admin/products', icon: '👗', label: 'Products' },
          { to: '/admin/orders', icon: '📦', label: 'Orders' },
          { to: '/admin/users', icon: '👥', label: 'Users' },
          { to: '/admin/categories', icon: '🗂️', label: 'Categories' },
          { to: '/admin/coupons', icon: '🎫', label: 'Coupons' },
          { to: '/', icon: '🏠', label: 'View Store' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
};

export { AdminNav };

const StatCard = ({ title, value, icon, change, color, prefix = '' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-xl`}>{icon}</div>
      <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {change >= 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
        {Math.abs(change)}%
      </div>
    </div>
    <p className="text-gray-500 text-sm mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{prefix}{value}</p>
  </motion.div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening at LuxeFit.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Revenue (This Month)" value={formatPrice(data.stats.currentRevenue).replace('₹','')} prefix="₹" icon="💰" color="bg-red-100" change={data.stats.revenueGrowth} />
              <StatCard title="Orders (This Month)" value={data.stats.monthOrders} icon="📦" color="bg-blue-100" change={data.stats.orderGrowth} />
              <StatCard title="Total Users" value={data.stats.totalUsers} icon="👥" color="bg-green-100" change={12} />
              <StatCard title="Active Products" value={data.stats.totalProducts} icon="👗" color="bg-orange-100" change={5} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue chart (simple bar) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-5">Monthly Revenue</h3>
                <div className="flex items-end gap-2 h-40">
                  {data.revenueByMonth?.slice(-8).map((m, i) => {
                    const maxRev = Math.max(...(data.revenueByMonth?.map(r => r.revenue) || [1]));
                    const height = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
                    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-to-t from-red-600 to-pink-500 rounded-t-lg transition-all hover:opacity-80 cursor-pointer" style={{ height: `${Math.max(height, 4)}%` }} title={formatPrice(m.revenue)} />
                        <span className="text-xs text-gray-400">{months[m._id.month - 1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order status breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-5">Orders by Status</h3>
                <div className="space-y-3">
                  {data.ordersByStatus?.map(s => (
                    <div key={s._id} className="flex items-center gap-3">
                      <span className={`badge ${getOrderStatusColor(s._id)} px-3 py-1 text-xs font-semibold w-24 text-center`}>{getOrderStatusLabel(s._id)}</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                          style={{ width: `${Math.min(100, (s.count / data.stats.totalOrders) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent orders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-800">Recent Orders</h3>
                  <Link to="/admin/orders" className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1">View All <FiArrowRight className="w-3 h-3" /></Link>
                </div>
                <div className="space-y-3">
                  {data.recentOrders?.map(order => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.user?.name} • {formatDateShort(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${getOrderStatusColor(order.status)} text-xs px-2 py-1`}>{getOrderStatusLabel(order.status)}</span>
                        <span className="text-sm font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top products */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-800">Top Selling Products</h3>
                  <Link to="/admin/products" className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1">View All <FiArrowRight className="w-3 h-3" /></Link>
                </div>
                <div className="space-y-3">
                  {data.topProducts?.map((item, i) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">{item.totalSold} units sold</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">Failed to load dashboard data. Make sure backend is running and DB is seeded.</div>
        )}
      </main>
    </div>
  );
}
