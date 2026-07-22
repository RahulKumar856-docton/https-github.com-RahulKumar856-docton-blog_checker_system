import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { PackagePlus, Search, Filter, AlertCircle, ShoppingBag } from 'lucide-react';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  status: string;
  fridge: { _id: string; name: string };
  image?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [fridges, setFridges] = useState<any[]>([]);
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fridge: '', itemName: '', category: 'Vegetables', quantity: '', unit: 'items', expiryDate: '' });

  useEffect(() => {
    fetchItems();
    fetchFridges();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/inventory');
      setItems(res.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    }
  };

  const fetchFridges = async () => {
    try {
      const res = await axios.get('/api/fridges');
      setFridges(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({...prev, fridge: res.data[0]._id}));
      }
    } catch (error) { }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/inventory', formData, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('Item added');
      setShowModal(false);
      fetchItems();
    } catch (error) {
      toast.error('Error adding item');
    }
  };

  const handleReserve = async (itemId: string) => {
    try {
      await axios.post('/api/reservations', { inventoryItem: itemId, quantity: 1 }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('Item reserved!');
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error reserving item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Food Inventory</h1>
        {(user?.role === 'admin' || user?.role === 'volunteer') && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
          >
            <PackagePlus className="w-4 h-4" /> Add Food
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Search food items..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-4 py-2 text-left">Item Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Expiry Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600">
              {items.map((item) => (
                <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{item.itemName}</td>
                  <td className="px-4 py-2.5">
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {item.category}
                     </span>
                  </td>
                  <td className="px-4 py-2.5">{item.fridge?.name}</td>
                  <td className="px-4 py-2.5">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-2.5">
                     {new Date(item.expiryDate) < new Date() ? (
                        <span className="flex items-center gap-1.5 text-red-600 font-bold uppercase text-[10px]">
                           <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Expired
                        </span>
                     ) : (
                        format(new Date(item.expiryDate), 'MMM d, yyyy')
                     )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 font-bold uppercase text-[10px] ${
                       item.status === 'available' ? 'text-emerald-600' :
                       item.status === 'reserved' ? 'text-orange-600' :
                       'text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                         item.status === 'available' ? 'bg-emerald-600' :
                         item.status === 'reserved' ? 'bg-orange-600' :
                         'bg-slate-500'
                      }`}></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {user?.role === 'member' && item.status === 'available' && (
                       <button onClick={() => handleReserve(item._id)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-slate-800 transition-colors">
                          <ShoppingBag className="w-3 h-3" /> Reserve
                       </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* Add Modal */}
       {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Food Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700">Fridge Location</label>
                  <select required value={formData.fridge} onChange={e => setFormData({...formData, fridge: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
                     {fridges.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
               </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Item Name</label>
                <input required type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
                     {['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Bakery', 'Cooked Food', 'Drinks', 'Others'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                  <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Quantity</label>
                  <input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Unit</label>
                  <input required type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="e.g. kg, items" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
