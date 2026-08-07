// src/pages/OrderConfirmationPage.tsx
import { Link } from 'react-router-dom';

export default function OrderConfirmationPage() {
  return (
    <div>
      <p>
        We're confirming your payment. You'll receive an email confirmation shortly. View your order
        history for updates.
      </p>
      <Link to="/orders">Order History</Link>
    </div>
  );
}
