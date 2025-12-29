import { User, Restaurant, MenuItem, Order, OrderStatus, DailySales, CategoryDistribution } from '../types';

// --- SEED DATA ---

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', email: 'user@crave.com', role: 'USER', avatar: 'https://picsum.photos/id/1005/100/100' },
  { id: 'a1', name: 'Admin User', email: 'admin@crave.com', role: 'ADMIN', avatar: 'https://picsum.photos/id/1025/100/100' },
  { id: 'r1', name: 'Pasta House Mgr', email: 'rest@crave.com', role: 'RESTAURANT', avatar: 'https://picsum.photos/id/1074/100/100' },
  { id: 'd1', name: 'Speedy Driver', email: 'driver@crave.com', role: 'DELIVERY', avatar: 'https://picsum.photos/id/1011/100/100' },
];

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'res1',
    name: 'Bella Italia',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    rating: 4.8,
    deliveryTime: '25-35 min',
    minOrder: 15,
    image: 'https://picsum.photos/id/1080/400/300',
    address: '123 Olive St, Food City',
    isActive: true,
  },
  {
    id: 'res2',
    name: 'Sushi Zen',
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    rating: 4.6,
    deliveryTime: '40-50 min',
    minOrder: 20,
    image: 'https://picsum.photos/id/292/400/300',
    address: '456 Bamboo Rd, Food City',
    isActive: true,
  },
  {
    id: 'res3',
    name: 'Burger Kingpin',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    rating: 4.3,
    deliveryTime: '20-30 min',
    minOrder: 10,
    image: 'https://picsum.photos/id/163/400/300',
    address: '789 Grill Ave, Food City',
    isActive: true,
  },
];

const MOCK_MENU: MenuItem[] = [
  { id: 'm1', restaurantId: 'res1', name: 'Margherita Pizza', description: 'Tomato sauce, fresh mozzarella, basil.', price: 14, image: 'https://picsum.photos/id/703/200/200', category: 'Pizza', isAvailable: true },
  { id: 'm2', restaurantId: 'res1', name: 'Spaghetti Carbonara', description: 'Creamy sauce with pancetta and black pepper.', price: 16, image: 'https://picsum.photos/id/601/200/200', category: 'Pasta', isAvailable: true },
  { id: 'm3', restaurantId: 'res2', name: 'Dragon Roll', description: 'Eel, cucumber, topped with avocado.', price: 18, image: 'https://picsum.photos/id/250/200/200', category: 'Sushi', isAvailable: true },
  { id: 'm4', restaurantId: 'res2', name: 'Miso Soup', description: 'Traditional soybean soup with tofu.', price: 5, image: 'https://picsum.photos/id/534/200/200', category: 'Appetizer', isAvailable: true },
  { id: 'm5', restaurantId: 'res3', name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, lettuce, tomato.', price: 12, image: 'https://picsum.photos/id/112/200/200', category: 'Burgers', isAvailable: true },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord1',
    userId: 'u1',
    restaurantId: 'res1',
    items: [{ ...MOCK_MENU[0], quantity: 1 }],
    total: 14,
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deliveryAddress: '101 User Ln',
  }
];

// --- SERVICE CLASS ---

class MockBackendService {
  private users: User[] = [...MOCK_USERS];
  private restaurants: Restaurant[] = [...MOCK_RESTAURANTS];
  private menuItems: MenuItem[] = [...MOCK_MENU];
  private orders: Order[] = [...MOCK_ORDERS];

  constructor() {
    // Attempt to load from localStorage to persist across reloads in the preview
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedOrders = localStorage.getItem('crave_orders');
    if (storedOrders) this.orders = JSON.parse(storedOrders);
    
    // We keep restaurants and menu items in memory for this demo to ensure they reset if code changes, 
    // but in a real app these would be in DB.
  }

  private saveOrders() {
    localStorage.setItem('crave_orders', JSON.stringify(this.orders));
  }

  // --- AUTH ---
  async login(email: string): Promise<User> {
    const user = this.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    return user;
  }

  // --- PUBLIC DATA ---
  async getRestaurants(): Promise<Restaurant[]> {
    await new Promise(r => setTimeout(r, 600)); // Simulate latency
    return this.restaurants;
  }

  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    await new Promise(r => setTimeout(r, 400));
    return this.menuItems.filter(m => m.restaurantId === restaurantId);
  }

  // --- USER ACTIONS ---
  async placeOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: `ord${Date.now()}`,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder); // Add to top
    this.saveOrders();
    return newOrder;
  }

  async getMyOrders(userId: string): Promise<Order[]> {
    return this.orders.filter(o => o.userId === userId);
  }

  // --- RESTAURANT / ADMIN / DELIVERY ACTIONS ---
  async getAllOrders(): Promise<Order[]> {
    return this.orders;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.status = status;
    this.saveOrders();
    return order;
  }

  async updateMenuItem(item: MenuItem): Promise<void> {
    const idx = this.menuItems.findIndex(m => m.id === item.id);
    if (idx >= 0) {
      this.menuItems[idx] = item;
    } else {
      this.menuItems.push(item);
    }
  }

  async getAnalytics(): Promise<{ daily: DailySales[], categories: CategoryDistribution[] }> {
    // Generate dummy analytics data
    const daily: DailySales[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
      amount: Math.floor(Math.random() * 500) + 100
    })).reverse();

    const categories: CategoryDistribution[] = [
      { name: 'Pizza', value: 400 },
      { name: 'Asian', value: 300 },
      { name: 'Burgers', value: 300 },
      { name: 'Dessert', value: 100 },
    ];

    return { daily, categories };
  }
}

export const backend = new MockBackendService();
