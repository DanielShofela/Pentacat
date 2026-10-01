import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOption?: string;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}
