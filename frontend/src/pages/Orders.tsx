import { useEffect, useState } from 'react'
import api from '../api/client'
import './Orders.css'

interface OrderItem { food_id: number; quantity: number; unit_price: number }
interface Order { id: number; status: string; total_price: number; created_at: string; items: OrderItem[] }

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/orders/')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="status-msg">Loading orders...</div>
  if (orders.length === 0) return <div className="status-msg">No orders yet.</div>

  return (
    <div>
      <h1 className="page-title">My Orders</h1>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.id}</span>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
              <span className="order-date">{new Date(order.created_at).toLocaleDateString('hu-HU')}</span>
            </div>
            <div className="order-items">
              {order.items.map((item, i) => (
                <div key={i} className="order-item">
                  <span>Food #{item.food_id} × {item.quantity}</span>
                  <span>{(item.unit_price * item.quantity).toLocaleString('hu-HU')} Ft</span>
                </div>
              ))}
            </div>
            <div className="order-total">Total: {order.total_price.toLocaleString('hu-HU')} Ft</div>
          </div>
        ))}
      </div>
    </div>
  )
}