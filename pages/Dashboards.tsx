import React, { useEffect, useState } from 'react';
import { backend } from '../services/mockBackend';
import { Order, MenuItem, Restaurant, OrderStatus } from '../types';
import { Button, Card, Badge } from '../components/Components';
import { useStore } from '../store/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Truck, CheckCircle, Clock, MapPin, DollarSign, Edit, Trash, Plus } from 'lucide-react';

// --- ADMIN DASHBOARD ---
export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    backend.getAnalytics().then(setStats);
    backend.getRestaurants().then(setRestaurants);
  }, []);

  if (!stats) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">$12,450</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Restaurants</p>
              <h3 className="text-2xl font-bold">{restaurants.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">1,204</h3>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {stats.categories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#f97316', '#3b82f6', '#10b981', '#f59e0b'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Restaurants List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Partner Restaurants</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {restaurants.map(r => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{r.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={r.isActive ? 'green' : 'gray'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{r.rating} ⭐</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900 cursor-pointer">Manage</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- RESTAURANT PARTNER DASHBOARD ---
export const RestaurantDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  useEffect(() => {
    backend.getAllOrders().then(o => setOrders(o.filter(ord => ord.restaurantId === 'res1'))); // Simulating logged in restaurant 'res1'
    backend.getMenu('res1').then(setMenu);
  }, []);

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    await backend.updateOrderStatus(id, status);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurant Portal</h2>
        <div className="flex space-x-2">
          <Button variant={activeTab === 'orders' ? 'primary' : 'outline'} onClick={() => setActiveTab('orders')}>Orders</Button>
          <Button variant={activeTab === 'menu' ? 'primary' : 'outline'} onClick={() => setActiveTab('menu')}>Menu</Button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-4">
          {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
          {orders.map(order => (
            <Card key={order.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">Order #{order.id}</span>
                  <Badge color={order.status === 'DELIVERED' ? 'green' : order.status === 'PLACED' ? 'yellow' : 'blue'}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mb-2">{new Date(order.createdAt).toLocaleString()}</p>
                <div className="text-sm">
                  {order.items.map(i => <div key={i.id}>{i.quantity}x {i.name}</div>)}
                </div>
                <p className="font-bold mt-2">Total: ${order.total.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                {order.status === 'PLACED' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}>Accept</Button>
                )}
                {order.status === 'ACCEPTED' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'PREPARING')}>Start Preparing</Button>
                )}
                {order.status === 'PREPARING' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}>Ready for Pickup</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
             <Button><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menu.map(item => (
              <Card key={item.id} className="p-4 flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                  <p className="text-primary-600 font-bold mt-1">${item.price}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- DELIVERY PARTNER APP ---
export const DeliveryDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Show orders that are out for delivery
    backend.getAllOrders().then(o => setOrders(o.filter(ord => ['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(ord.status))));
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await backend.updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-4 h-full relative">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="font-bold">Delivery Partner</h2>
          <p className="text-sm text-gray-500">{isOnline ? 'You are Online' : 'You are Offline'}</p>
        </div>
        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input 
              type="checkbox" 
              name="toggle" 
              id="toggle" 
              checked={isOnline} 
              onChange={() => setIsOnline(!isOnline)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6"
            />
            <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`}></label>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/OpenStreetMap_Standard.png')] bg-cover opacity-50"></div>
        <div className="relative z-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg flex items-center gap-2">
          <MapPin className="text-red-500" />
          <span className="font-medium">Live Navigation</span>
        </div>
      </div>

      <h3 className="font-bold text-lg">Assigned Orders</h3>
      <div className="space-y-3 pb-20">
        {orders.map(order => (
          <Card key={order.id} className="p-4">
             <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">#{order.id}</span>
                <span className="text-xs font-bold text-primary-600">${order.total}</span>
             </div>
             <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm truncate">{order.deliveryAddress}</span>
             </div>
             <div className="flex gap-2 mt-4">
               {order.status !== 'DELIVERED' && order.status !== 'OUT_FOR_DELIVERY' && (
                 <Button className="w-full" onClick={() => updateStatus(order.id, 'OUT_FOR_DELIVERY')}>Pick Up</Button>
               )}
               {order.status === 'OUT_FOR_DELIVERY' && (
                 <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => updateStatus(order.id, 'DELIVERED')}>Complete Delivery</Button>
               )}
             </div>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-center text-gray-500 mt-10">No active orders assigned.</p>}
      </div>
    </div>
  );
};
