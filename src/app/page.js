import orders from "../data/orders"
import OrdersTable from "../components/orders/OrdersTable"

export default function HomePage() {

  return (
    <main>
      <OrdersTable orders={orders} />
    </main>
  )
}
