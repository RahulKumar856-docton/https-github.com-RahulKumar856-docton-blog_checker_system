import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface Fridge {
  _id: string;
  name: string;
  location: string;
}

export default function DonationsPage() {
  const { user } = useAuth();
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Produce');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [expiryDate, setExpiryDate] = useState('');
  const [targetFridge, setTargetFridge] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFridges = async () => {
      try {
        const res = await axios.get('/api/fridges');
        setFridges(res.data);
        if (res.data.length > 0) {
          setTargetFridge(res.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching fridges', error);
        toast.error('Failed to load fridges');
      }
    };
    fetchFridges();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFridge) {
      toast.error('Please select a fridge');
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('fridge', targetFridge);
      formData.append('itemName', itemName);
      formData.append('category', category);
      formData.append('quantity', quantity);
      formData.append('unit', unit);
      formData.append('expiryDate', expiryDate);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post('/api/donations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Donation created successfully!');
      
      // Reset form
      setItemName('');
      setCategory('Produce');
      setQuantity('');
      setUnit('kg');
      setExpiryDate('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating donation', error);
      toast.error('Failed to create donation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Donate Food</h1>
          <p className="text-sm text-slate-500 font-medium">Contribute to a community fridge</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Target Location</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select a Fridge</label>
              <select
                required
                value={targetFridge}
                onChange={(e) => setTargetFridge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium"
              >
                {fridges.map(fridge => (
                  <option key={fridge._id} value={fridge._id}>{fridge.name} - {fridge.location}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Item Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Item Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Fresh Apples"
                  value={itemName} onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  required
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="Produce">Produce</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Meals">Prepared Meals</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-2">
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity</label>
                   <input
                     type="number" required min="1" step="0.1"
                     placeholder="0"
                     value={quantity} onChange={(e) => setQuantity(e.target.value)}
                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                   />
                 </div>
                 <div className="w-24">
                   <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit</label>
                   <select
                     required
                     value={unit} onChange={(e) => setUnit(e.target.value)}
                     className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                   >
                     <option value="kg">kg</option>
                     <option value="items">items</option>
                     <option value="liters">liters</option>
                   </select>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
                <input
                  type="date" required
                  min={new Date().toISOString().split('T')[0]}
                  value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Photo (Optional)</label>
              
              <div className="mt-1 flex items-center justify-center w-full">
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          if(fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="mb-1 text-sm text-slate-500 font-medium">Click to upload photo</p>
                      <p className="text-xs text-slate-400">PNG, JPG or WEBP</p>
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isLoading ? 'Submitting...' : 'Submit Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
