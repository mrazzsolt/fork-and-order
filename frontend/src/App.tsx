import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Orders from './pages/Orders'

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
    </CartProvider>
  )
}