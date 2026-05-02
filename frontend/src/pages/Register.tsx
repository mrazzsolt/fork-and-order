import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import './Auth.css'

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      navigate('/login')
    } catch {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h2>Create Account</h2>
        {error && <div className="auth-error">{error}</div>}
        <label>Username
          <input
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
        </label>
        <label>Email
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>Password
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  )
}