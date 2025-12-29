import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store/store';
import { backend } from './services/mockBackend';
import { getAIRecommendation } from './services/geminiService';
import { Restaurant, MenuItem, Role } from './types';
import { Button, Card, Badge, QuantityControl } from './components/Components';
import { AdminDashboard, RestaurantDashboard, DeliveryDashboard } from './pages/Dashboards';
import { ShoppingCart, User as UserIcon, LogOut, Sun, Moon, Search, ChefHat, MapPin, Star, Clock, Home, Menu as MenuIcon, X, Bot, ShoppingBag, Package, BarChart, Truck } from 'lucide-react';

// --- CUSTOMER PAGES ---

const HomePage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    backend.getRestaurants().then(setRestaurants);
  }, []);

  const filtered = restaurants.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.cuisine.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="bg-primary-600 rounded-2xl p-6 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Craving something specific?</h1>
          <p className="text-primary-100 mb-6 text-lg">Order from the best local restaurants with real-time tracking.</p>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for restaurants or cuisine..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover opacity-20 transform skew-x-12 translate-x-20"></div>
      </section>

      {/* Restaurant List */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Top Restaurants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(res => (
          <div key={res.id} onClick={() => navigate(`/restaurant/${res.id}`)} className="group cursor-pointer">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
                <img src={res.image} alt={res.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-md text-sm font-bold shadow-sm">
                  {res.deliveryTime}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{res.name}</h3>
                  <Badge color="green">{res.rating} <Star className="h-3 w-3 inline ml-0.5" fill="currentColor"/></Badge>
                </div>
                <p className="text-sm text-gray-500 mb-2">{res.cuisine.join(', ')}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <MapPin className="h-3 w-3 mr-1" /> {res.address}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

const RestaurantView = () => {
  const { id } = useLocation().pathname.match(/\/restaurant\/([^/]+)/) ? { id: useLocation().pathname.split('/').pop() } : { id: '' };
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const { addToCart, cart } = useStore();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      backend.getRestaurants().then(list => setRestaurant(list.find(r => r.id === id) || null));
      backend.getMenu(id).then(setMenu);
    }
  }, [id]);

  const handleAskAI = async () => {
    if (!menu.length) return;
    setAiLoading(true);
    const recommendation = await getAIRecommendation("I want something spicy and filling", menu);
    setAiResponse(recommendation);
    setAiLoading(false);
  };

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
        <img src={restaurant.image} className="w-full h-full object-cover" alt={restaurant.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <p className="opacity-90">{restaurant.cuisine.join(' • ')} • {restaurant.address}</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Popular', ...new Set(menu.map(m => m.category))].map(cat => (
          <button key={cat} className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-50">
            {cat}
          </button>
        ))}
      </div>

      {/* AI Chef Helper */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
            <Bot className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Not sure what to eat?</h3>
            <p className="text-white/90 text-sm mb-3">Ask our AI Chef to recommend the perfect dish from this restaurant.</p>
            {aiResponse ? (
              <div className="bg-white/10 p-3 rounded-lg text-sm border border-white/20 mb-3 animate-fade-in">
                {aiResponse}
              </div>
            ) : null}
            <Button 
              size="sm" 
              className="bg-white text-purple-600 hover:bg-gray-100 border-none"
              onClick={handleAskAI}
              isLoading={aiLoading}
            >
              Surprise Me
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menu.map(item => {
          const inCart = cart.find(i => i.id === item.id)?.quantity || 0;
          return (
            <Card key={item.id} className="flex p-4 gap-4 hover:border-primary-200 transition-colors">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-primary-600">${item.price}</span>
                  {inCart > 0 ? (
                    <div className="text-sm font-medium text-primary-600">Added ({inCart})</div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => addToCart(item, restaurant.id)}>+</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const CartSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart, user } = useStore();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to checkout");
      return;
    }
    setIsCheckingOut(true);
    // Simulate checkout
    await new Promise(r => setTimeout(r, 1500));
    
    // Create order object
    const orderData = {
      userId: user.id,
      restaurantId: cart[0].restaurantId,
      items: cart,
      total: cartTotal(),
      deliveryAddress: "123 Main St (Default)",
    };
    
    await backend.placeOrder(orderData);
    clearCart();
    setIsCheckingOut(false);
    onClose();
    navigate('/orders');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in">
        <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5"/> Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Your cart is empty.</p>
              <Button className="mt-4" onClick={onClose}>Browse Restaurants</Button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                <img src={item.image} className="w-16 h-16 rounded object-cover" alt="" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500">${item.price}</p>
                </div>
                <QuantityControl 
                  quantity={item.quantity} 
                  onIncrease={() => updateQuantity(item.id, 1)} 
                  onDecrease={() => updateQuantity(item.id, -1)} 
                />
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
             <div className="flex justify-between mb-2 text-sm">
                <span>Subtotal</span>
                <span>${cartTotal().toFixed(2)}</span>
             </div>
             <div className="flex justify-between mb-4 text-sm">
                <span>Delivery Fee</span>
                <span>$2.99</span>
             </div>
             <div className="flex justify-between mb-6 text-xl font-bold">
                <span>Total</span>
                <span>${(cartTotal() + 2.99).toFixed(2)}</span>
             </div>
             <Button className="w-full py-3 text-lg" onClick={handleCheckout} isLoading={isCheckingOut}>
               Checkout
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderTracking = () => {
  const { user } = useStore();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) backend.getMyOrders(user.id).then(setOrders);
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please log in to view orders.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">My Orders</h2>
      {orders.map(order => (
        <Card key={order.id} className="p-6">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="font-bold text-lg">Order #{order.id}</h3>
                <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
             </div>
             <Badge color="blue" className="text-sm px-3 py-1">{order.status}</Badge>
          </div>

          {/* Stepper */}
          <div className="relative flex items-center justify-between mb-8">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10"></div>
            {['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((step, idx) => {
              const statusIdx = ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status);
              const isCompleted = idx <= statusIdx;
              
              return (
                <div key={step} className="flex flex-col items-center bg-white dark:bg-gray-800 px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                    {idx + 1}
                  </div>
                  <span className="text-[10px] mt-1 font-medium hidden sm:block text-gray-500">{step.replace(/_/g, ' ')}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
             <h4 className="font-bold text-sm mb-2">Order Summary</h4>
             {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm mb-1">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
             ))}
             <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2 flex justify-between font-bold">
               <span>Total</span>
               <span>${order.total.toFixed(2)}</span>
             </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// --- LAYOUT & LOGIN ---

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { setUser } = useStore();
  const [email, setEmail] = useState('user@crave.com');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await backend.login(email);
      setUser(user);
      onClose();
    } catch (err) {
      alert("Invalid login. Try 'user@crave.com', 'admin@crave.com', 'rest@crave.com'");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm p-8 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Try: user@crave.com, admin@crave.com, rest@crave.com</p>
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>Cancel</Button>
        </form>
      </Card>
    </div>
  );
};

const Navbar = ({ onOpenCart, onOpenLogin }: any) => {
  const { user, cart, toggleDarkMode, darkMode, setUser } = useStore();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-orange-500">CraveWave</span>
        </Link>

        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="relative cursor-pointer" onClick={onOpenCart}>
            <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3 border-l pl-4 border-gray-200 dark:border-gray-700">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
               </div>
               <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="" />
               <Button variant="ghost" size="sm" onClick={() => setUser(null)}><LogOut className="h-4 w-4"/></Button>
            </div>
          ) : (
            <Button size="sm" onClick={onOpenLogin}>Login</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

const Sidebar = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Orders', icon: Package, path: '/orders' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ name: 'Dashboard', icon: BarChart, path: '/admin' });
  } else if (user?.role === 'RESTAURANT') {
    menuItems.push({ name: 'Restaurant', icon: ChefHat, path: '/partner' });
  } else if (user?.role === 'DELIVERY') {
    menuItems.push({ name: 'Deliveries', icon: Truck, path: '/driver' });
  }

  return (
    <div className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
       <div className="space-y-1">
         {menuItems.map(item => (
           <div 
             key={item.path}
             onClick={() => navigate(item.path)}
             className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${location.pathname === item.path ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'}`}
            >
             <item.icon className="h-5 w-5 mr-3" />
             <span className="font-medium">{item.name}</span>
           </div>
         ))}
       </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const AppContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <Navbar onOpenCart={() => setIsCartOpen(true)} onOpenLogin={() => setIsLoginOpen(true)} />
      
      <div className="flex pt-16"> {/* Spacer for fixed navbar */}
         <div className="hidden lg:block w-64 flex-shrink-0">
            {/* Sidebar Placeholder Space */}
         </div>
         <Sidebar user={user} />
         
         <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurant/:id" element={<RestaurantView />} />
              <Route path="/orders" element={<OrderTracking />} />
              
              {/* Protected Routes Mocking */}
              <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <div className="text-center mt-20">Access Denied</div>} />
              <Route path="/partner" element={user?.role === 'RESTAURANT' ? <RestaurantDashboard /> : <div className="text-center mt-20">Access Denied</div>} />
              <Route path="/driver" element={user?.role === 'DELIVERY' ? <DeliveryDashboard /> : <div className="text-center mt-20">Access Denied</div>} />
            </Routes>
         </main>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;