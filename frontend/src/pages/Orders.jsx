import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiArrowRight } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { formatPrice, formatDateShort, getOrderStatusColor, getOrderStatusLabel } from '../utils/helpers';
import { OrderRowSkeleton } from '../components/ui/Skeleton';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    orderAPI.getMyOrders({ limit: 20 })
      .then(data => { setOrders(data.orders || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-28 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">My Orders ({total})</h1>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link to="/shop" className="btn-primary py-3 px-8 rounded-xl text-sm inline-flex items-center gap-2">
              Browse Products <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-400">{formatDateShort(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getOrderStatusColor(order.status)} px-3 py-1.5 text-xs font-semibold`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <span className={`badge ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} px-3 py-1.5 text-xs font-semibold`}>
                      {order.isPaid ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 overflow-x-auto no-scrollbar">
                  {order.items?.slice(0, 4).map((item, j) => (
                    <img key={j} src={item.image || item.product?.images?.[0]} alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                  ))}
                  {(order.items?.length || 0) > 4 && (
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-500 flex-shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    <p className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</p>
                  </div>
                  <Link to={`/orders/${order._id}`}
                    className="flex items-center gap-2 text-red-600 font-semibold text-sm hover:gap-3 transition-all">
                    View Details <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
