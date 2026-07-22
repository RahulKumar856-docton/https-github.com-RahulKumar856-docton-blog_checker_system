import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Refrigerator, PackageSearch, Heart } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    fridges: 0,
    inventory: 0,
    donations: 0
  });

  const categoryData = [
    { name: 'Vegetables', value: 400 },
    { name: 'Fruits', value: 300 },
    { name: 'Bakery', value: 300 },
    { name: 'Dairy', value: 200 },
  ];
  
  const COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#3b82f6'];

  useEffect(() => {
    // In a real app, we would fetch real stats from the backend
    const fetchStats = async () => {
      try {
        const [fridges, inventory] = await Promise.all([
          axios.get('/api/fridges'),
          axios.get('/api/inventory')
        ]);
        setStats({
          users: 15, // Mock
          donations: 24, // Mock
          fridges: fridges.data.length,
          inventory: inventory.data.length
        });
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Fridges</p>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Refrigerator className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.fridges}</h3>
          <p className="text-[10px] text-emerald-500 font-medium mt-1">Active locations</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Items</p>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <PackageSearch className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.inventory}</h3>
          <p className="text-[10px] text-blue-500 font-medium mt-1">In stock across network</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Donations</p>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Heart className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.donations}</h3>
          <p className="text-[10px] text-rose-500 font-medium mt-1">Contributions this month</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered Users</p>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.users}</h3>
          <p className="text-[10px] text-indigo-500 font-medium mt-1">Active community members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h4 className="text-sm font-bold text-slate-700 mb-4">Inventory Distribution</h4>
          <div className="h-[250px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
           <div className="flex justify-center gap-4 mt-2">
              {categoryData.map((entry, index) => (
                 <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name}
                 </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h4 className="text-sm font-bold text-slate-700 mb-4">Weekly Donations (kg)</h4>
          <div className="h-[250px] flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                  { name: 'Mon', value: 45 }, { name: 'Tue', value: 52 }, 
                  { name: 'Wed', value: 38 }, { name: 'Thu', value: 65 }, 
                  { name: 'Fri', value: 48 }, { name: 'Sat', value: 85 }, 
                  { name: 'Sun', value: 72 }
               ]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                 <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
