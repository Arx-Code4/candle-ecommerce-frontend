import type { FC } from 'react';

interface CartSummaryProps {
  total: string;
  itemCount: number;
  readOnly?: boolean;
  onCheckout?: () => void;
}

const CartSummary: FC<CartSummaryProps> = () => null;

export default CartSummary;
