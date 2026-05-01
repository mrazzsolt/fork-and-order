import { useEffect, useState } from 'react'
import api from '../api/client'
import FoodCard from '../components/FoodCard'
import './Home.css'

interface Food {
  id: number
  name: string
  description: string
  price: number
  category: string
}

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/foods/')
      .then(res => setFoods(res.data))
      .catch(() => setError('Failed to load menu. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="status-msg">Loading menu...</div>
  if (error) return <div className="status-msg error">{error}</div>
  if (foods.length === 0) return (
    <div className="empty-state">
      <p>No foods available yet.</p>
      <small>Add some via the API: POST /api/foods/</small>
    </div>
  )

  return (
    <div>
      <h1 className="page-title">Our Menu</h1>
      <div className="food-grid">
        {foods.map(food => <FoodCard key={food.id} {...food} />)}
      </div>
    </div>
  )
}