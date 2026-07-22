import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Map, LayoutDashboard, Refrigerator, PackageSearch, HeartHandshake, Bell, Search, Users } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getLinks = () => {
    const links = [
      { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/', label: 'Fridge Map', icon: <Map className="w-4 h-4" /> },
      { to: '/inventory', label: 'Inventory', icon: <PackageSearch className="w-4 h-4" /> },
      { to: '/fridges', label: 'Fridges', icon: <Refrigerator className="w-4 h-4" /> },
      { to: '/donations', label: 'Donations', icon: <HeartHandshake className="w-4 h-4" /> },
    ];

    if (user.role === 'admin') {
      links.push({ to: '/volunteers', label: 'Volunteers', icon: <Users className="w-4 h-4" /> });
    }

    return links;
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-emerald-900 text-emerald-50 flex flex-col border-r border-emerald-800 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-emerald-800/50">
          <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center text-emerald-900 font-bold text-xl">C</div>
          <span className="font-bold text-lg tracking-tight">FridgeTrack</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {getLinks().map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-emerald-800 text-white' 
                    : 'hover:bg-emerald-800/50'
                }`}
              >
                {link.icon}
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-emerald-800">
          <div className="flex items-center gap-3 p-2 bg-emerald-950/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-emerald-300 overflow-hidden flex items-center justify-center text-emerald-900 font-bold uppercase">
               {user.name.charAt(0)}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-xs font-bold truncate">{user.name}</span>
              <span className="text-[10px] opacity-60 capitalize truncate">{user.role} User</span>
            </div>
            <button onClick={logout} className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-md transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0">
          <h1 className="text-lg font-bold text-slate-800 capitalize">
            {location.pathname === '/' ? 'Fridge Map' : location.pathname.substring(1)}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center bg-slate-100 rounded-full px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search inventory..." className="bg-transparent text-xs outline-none ml-2 w-48" />
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
              <div className="relative cursor-pointer hover:text-slate-700">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
