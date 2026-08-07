// src/components/common/OrderCard.tsx
import { Link } from 'react-router-dom';
import type { OrderSummary } from '@/types';

interface OrderCardProps {
  order: OrderSummary;
}

export default function OrderCard({ order }: OrderCardProps) {
  return <Link to={`/orders/${order.id}`}>Order Card</Link>;
}
