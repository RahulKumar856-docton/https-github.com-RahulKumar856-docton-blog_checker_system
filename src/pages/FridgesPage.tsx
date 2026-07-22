import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, MapPin, Trash2, Edit2 } from 'lucide-react';

interface Fridge {
  _id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  description: string;
}

export default function FridgesPage() {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', latitude: '', longitude: '', capacity: '', description: '' });

  useEffect(() => {
    fetchFridges();
  }, []);

  const fetchFridges = async () => {
    try {
      const res = await axios.get('/api/fridges');
      setFridges(res.data);
    } catch (error) {
      toast.error('Failed to load fridges');
    }
  };

  const handleAddFridge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/fridges', formData, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('Fridge added');
      setShowModal(false);
      setFormData({ name: '', location: '', latitude: '', longitude: '', capacity: '', description: '' });
      fetchFridges();
    } catch (error) {
      toast.error('Error adding fridge');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/fridges/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('Fridge deleted');
      fetchFridges();
    } catch (error) {
      toast.error('Failed to delete fridge');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Community Fridges</h1>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Fridge
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {fridges.map(fridge => (
          <div key={fridge._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <h3 className="font-bold text-sm text-slate-900">{fridge.name}</h3>
            <div className="mt-3 flex-1 space-y-2 text-[11px] text-slate-600">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
                <span>{fridge.location}</span>
              </p>
              <p><strong>Capacity:</strong> {fridge.capacity} kg</p>
              <p className="text-slate-500 italic mt-2 line-clamp-2">{fridge.description}</p>
            </div>
            {user?.role === 'admin' && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => handleDelete(fridge._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Fridge</h2>
            <form onSubmit={handleAddFridge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Address Location</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Latitude</label>
                  <input required type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Longitude</label>
                  <input required type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Capacity (kg)</label>
                <input required type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Save Fridge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
