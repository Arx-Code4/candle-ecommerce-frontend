import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';

interface ShippingFields {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
}

interface CheckoutResponse {
  chapaCheckoutUrl: string;
  txRef: string;
}

export function useCheckout() {
  return useMutation<CheckoutResponse, AxiosError, ShippingFields>({
    mutationFn: async (data: ShippingFields) => {
      const response = await api.post('/checkout', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Chapa's hosted checkout is a full page redirect, not an SPA route —
      // window.location.href (not react-router's navigate) is correct here.
      window.location.href = data.chapaCheckoutUrl;
    },
  });
}
