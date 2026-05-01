import { useCart } from '../context/CartContext'
import './FoodCard.css'

interface Props {
  id: number
  name: string
  description: string
  price: number
  category: string
}

export default function FoodCard({ id, name, description, price, category }: Props) {
  const { addItem } = useCart()

  return (
    <div className="food-card">
      <div className="food-card-img">🍽️</div>
      <div className="food-card-body">
        <span className="food-category">{category}</span>
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="food-card-footer">
          <span className="food-price">{price.toLocaleString('hu-HU')} Ft</span>
          <button
            className="btn-add"
            onClick={() => addItem({ id, name, price })}
          >
            + Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}