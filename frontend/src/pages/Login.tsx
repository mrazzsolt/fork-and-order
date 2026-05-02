import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      login(res.data.access_token)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h2>Login</h2>
        {error && <div className="auth-error">{error}</div>}
        <label>Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  )
}