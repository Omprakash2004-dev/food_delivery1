export type Role = 'USER' | 'ADMIN' | 'RESTAURANT' | 'DELIVERY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string; // e.g. "30-40 min"
  minOrder: number;
  image: string;
  address: string;
  isActive: boolean;
}

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO String
  deliveryAddress: string;
}

export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  date: string;
}

// Analytics Types
export interface DailySales {
  date: string;
  amount: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
}
