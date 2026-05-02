import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Cart.css'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const placeOrder = async () => {
    if (!isLoggedIn) {
      setError('You need to be logged in to place an order.')
      return
    }
    setError('')
    try {
      await api.post('/api/orders/', {
        items: items.map(i => ({ food_id: i.id, quantity: i.quantity }))
      })
      clearCart()
      navigate('/orders')
    } catch {
      setError('Failed to place order. Please try again.')
    }
  }

  if (items.length === 0) return (
    <div className="empty-state">
      <p>🛒 Your cart is empty.</p>
      <button onClick={() => navigate('/')} className="btn-primary">Browse Menu</button>
    </div>
  )

  return (
    <div className="cart-page">
      <h1 className="page-title">Your Cart</h1>
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">{item.price.toLocaleString('hu-HU')} Ft</span>
            </div>
            <div className="cart-item-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              <button className="btn-remove" onClick={() => removeItem(item.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="cart-error">
          ⚠️ {error}
          {!isLoggedIn && (
            <button onClick={() => navigate('/login')} className="btn-login-redirect">
              Go to Login
            </button>
          )}
        </div>
      )}

      <div className="cart-summary">
        <span className="cart-total">Total: {total.toLocaleString('hu-HU')} Ft</span>
        <button className="btn-primary" onClick={placeOrder}>Place Order</button>
      </div>
    </div>
  )
}