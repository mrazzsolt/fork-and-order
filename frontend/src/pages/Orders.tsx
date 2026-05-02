import { useEffect, useState } from 'react'
import api from '../api/client'
import './Orders.css'

interface OrderItem {
  id: number
  food_id: number
  food_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: number
  status: string
  total_price: number
  created_at: string
  items: OrderItem[]
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  useEffect(() => {
    api.get('/api/orders/')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(order => {
    const date = new Date(order.created_at)
    if (filterFrom && date < new Date(filterFrom)) return false
    if (filterTo && date > new Date(filterTo + 'T23:59:59')) return false
    return true
  })

  if (loading) return <div className="status-msg">Loading orders...</div>

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="page-title">Order History</h1>
        <span className="orders-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Dátumszűrő */}
      <div className="orders-filter">
        <div className="filter-group">
          <label>From</label>
          <input
            type="date"
            value={filterFrom}
            onChange={e => setFilterFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>To</label>
          <input
            type="date"
            value={filterTo}
            onChange={e => setFilterTo(e.target.value)}
          />
        </div>
        {(filterFrom || filterTo) && (
          <button className="btn-clear" onClick={() => { setFilterFrom(''); setFilterTo('') }}>
            ✕ Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>🍽️ No orders found.</p>
          {(filterFrom || filterTo) && <small>Try adjusting the date filters.</small>}
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-id">Order #{order.id}</span>
                  <span className={`order-status status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('hu-HU', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.id} className="order-item-row">
                    <div className="order-item-left">
                      <span className="item-dot">•</span>
                      <span className="item-name">{item.food_name}</span>
                      <span className="item-qty">× {item.quantity}</span>
                    </div>
                    <span className="item-price">
                      {(item.unit_price * item.quantity).toLocaleString('hu-HU')} Ft
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <span className="order-item-count">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                <span className="order-total">Total: <strong>{order.total_price.toLocaleString('hu-HU')} Ft</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}