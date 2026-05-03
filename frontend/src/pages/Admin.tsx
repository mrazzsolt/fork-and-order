import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Admin.css'

interface Food { id: number; name: string; description: string; price: number; category: string }
interface User { id: number; email: string; username: string; is_admin: boolean }
interface OrderItem { id: number; food_name: string; quantity: number; unit_price: number }
interface Order { id: number; user_id: number; status: string; total_price: number; created_at: string; items: OrderItem[] }

const emptyFood = { name: '', description: '', price: 0, category: '' }
const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'delivered', 'cancelled']

export default function Admin() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'foods' | 'users' | 'orders'>('foods')
  const [foods, setFoods] = useState<Food[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [newFood, setNewFood] = useState(emptyFood)
  const [editFood, setEditFood] = useState<Food | null>(null)
  const [orderTab, setOrderTab] = useState<'pending' | 'done'>('pending')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    loadFoods()
    loadUsers()
    loadOrders()
  }, [])

  const loadFoods = () => api.get('/api/admin/foods').then(r => setFoods(r.data)).catch(() => setError('Access denied. Admin only.'))
  const loadUsers = () => api.get('/api/admin/users').then(r => setUsers(r.data))
  const loadOrders = () => api.get('/api/admin/orders').then(r => setOrders(r.data))

  const notify = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  const addFood = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/api/admin/foods', { ...newFood, price: Number(newFood.price) })
    setNewFood(emptyFood)
    loadFoods()
    notify('Food added!')
  }

  const saveFood = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFood) return
    await api.patch(`/api/admin/foods/${editFood.id}`, editFood)
    setEditFood(null)
    loadFoods()
    notify('Food updated!')
  }

  const deleteFood = async (id: number) => {
    if (!confirm('Delete this food?')) return
    await api.delete(`/api/admin/foods/${id}`)
    loadFoods()
    notify('Food deleted.')
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/api/admin/users/${id}`)
    loadUsers()
    notify('User deleted.')
  }

  const toggleAdmin = async (user: User) => {
    await api.patch(`/api/admin/users/${user.id}`, { is_admin: !user.is_admin })
    loadUsers()
    notify('User updated!')
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    await api.patch(`/api/admin/orders/${orderId}/status`, { status })
    loadOrders()
    notify(`Order #${orderId} → ${status}`)
  }

  const pendingOrders = orders
    .filter(o => !['delivered', 'cancelled'].includes(o.status))
    .sort((a, _b) => (a.status === 'pending' ? -1 : 1))

  const doneOrders = orders
    .filter(o => ['delivered', 'cancelled'].includes(o.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="page-title">Admin Panel</h1>
        <div className="admin-tabs">
          <button className={tab === 'foods' ? 'tab active' : 'tab'} onClick={() => setTab('foods')}>Foods</button>
          <button className={tab === 'users' ? 'tab active' : 'tab'} onClick={() => setTab('users')}>Users</button>
          <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>
            📋 Orders
            {pendingOrders.length > 0 && <span className="tab-badge">{pendingOrders.length}</span>}
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {/* FOODS TAB */}
      {tab === 'foods' && (
        <div className="admin-section">
          <div className="admin-card">
            <h2>{editFood ? 'Edit Food' : 'Add New Food'}</h2>
            <form className="admin-form" onSubmit={editFood ? saveFood : addFood}>
              <div className="form-row">
                <input placeholder="Name" required value={editFood ? editFood.name : newFood.name}
                  onChange={e => editFood ? setEditFood({...editFood, name: e.target.value}) : setNewFood({...newFood, name: e.target.value})} />
                <input placeholder="Category" required value={editFood ? editFood.category : newFood.category}
                  onChange={e => editFood ? setEditFood({...editFood, category: e.target.value}) : setNewFood({...newFood, category: e.target.value})} />
                <input type="number" placeholder="Price (Ft)" required value={editFood ? editFood.price : newFood.price}
                  onChange={e => editFood ? setEditFood({...editFood, price: Number(e.target.value)}) : setNewFood({...newFood, price: Number(e.target.value)})} />
              </div>
              <input placeholder="Description" value={editFood ? editFood.description : newFood.description}
                onChange={e => editFood ? setEditFood({...editFood, description: e.target.value}) : setNewFood({...newFood, description: e.target.value})} />
              <div className="form-actions">
                <button type="submit" className="btn-primary">{editFood ? 'Save Changes' : '+ Add Food'}</button>
                {editFood && <button type="button" className="btn-secondary" onClick={() => setEditFood(null)}>Cancel</button>}
              </div>
            </form>
          </div>
          <div className="admin-card">
            <h2>All Foods ({foods.length})</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  {foods.map(food => (
                    <tr key={food.id}>
                      <td><strong>{food.name}</strong><br/><small>{food.description}</small></td>
                      <td><span className="badge">{food.category}</span></td>
                      <td>{food.price.toLocaleString('hu-HU')} Ft</td>
                      <td>
                        <button className="btn-edit" onClick={() => setEditFood(food)}>Edit</button>
                        <button className="btn-delete" onClick={() => deleteFood(food.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="admin-section">
          <div className="admin-card">
            <h2>All Users ({users.length})</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td><strong>{user.username}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={`badge ${user.is_admin ? 'badge-admin' : 'badge-user'}`}>{user.is_admin ? 'Admin' : 'User'}</span></td>
                      <td>
                        <button className="btn-edit" onClick={() => toggleAdmin(user)}>{user.is_admin ? 'Revoke Admin' : 'Make Admin'}</button>
                        <button className="btn-delete" onClick={() => deleteUser(user.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div className="admin-section">
          <div className="order-subtabs">
            <button className={orderTab === 'pending' ? 'tab active' : 'tab'} onClick={() => setOrderTab('pending')}>
              Active Orders
              {pendingOrders.length > 0 && <span className="tab-badge">{pendingOrders.length}</span>}
            </button>
            <button className={orderTab === 'done' ? 'tab active' : 'tab'} onClick={() => setOrderTab('done')}>
              Completed ({doneOrders.length})
            </button>
          </div>

          <div className="admin-card">
            {(orderTab === 'pending' ? pendingOrders : doneOrders).length === 0 ? (
              <div className="empty-state"><p>No orders here.</p></div>
            ) : (
              <div className="orders-admin-list">
                {(orderTab === 'pending' ? pendingOrders : doneOrders).map(order => (
                  <div key={order.id} className="order-admin-card">
                    <div className="order-admin-header">
                      <div className="order-meta">
                        <span className="order-id">Order #{order.id}</span>
                        <span className={`order-status status-${order.status}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="order-user-id">User #{order.user_id}</span>
                      </div>
                      <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString('hu-HU', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="order-admin-items">
                      {order.items.map(item => (
                        <span key={item.id} className="order-item-chip">
                          {item.food_name} × {item.quantity}
                        </span>
                      ))}
                    </div>

                    <div className="order-admin-footer">
                      <span className="order-total"><strong>{order.total_price.toLocaleString('hu-HU')} Ft</strong></span>
                      {orderTab === 'pending' && (
                        <div className="status-buttons">
                          {STATUS_OPTIONS.filter(s => s !== order.status).map(s => (
                            <button
                              key={s}
                              className={`btn-status btn-status-${s}`}
                              onClick={() => updateOrderStatus(order.id, s)}
                            >
                              → {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}