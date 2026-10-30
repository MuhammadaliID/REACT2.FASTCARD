import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import "./Orders.css";

function Orders() {
  return (
    <div className="orders-page">
      <div className="page-head">
        <h1 className="page-title">Orders</h1>
      </div>

      <div className="card orders-card">
        <div className="orders-empty">
          <span className="orders-icon">
            <Icon name="orders" size={28} />
          </span>
          <h2>Orders are not available yet</h2>
          <p>
            The store backend (<code>store-api.softclub.tj</code>) does not
            provide order endpoints — there is no way to fetch or manage orders
            without inventing API calls, so this page intentionally shows no
            data.
          </p>
          <p>
            Carts are supported by the API per user, but there is no endpoint
            for viewing other customers' orders.
          </p>
          <Link to="/products" className="btn btn-primary">
            <Icon name="tag" size={16} />
            Manage products instead
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Orders;
