import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Home, ShoppingBag, User, LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '../supabase';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showNav?: boolean;
  role?: string | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, showNav = true, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Início', path: '/', roles: ['all'] },
    { icon: ShoppingBag, label: 'Pedidos', path: '/bar', roles: ['bar', 'admin'] },
    { icon: LayoutDashboard, label: 'Painel', path: '/admin', roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => 
    item.roles.includes('all') || (role && item.roles.includes(role))
  );

  return (
    <div className="min-h-[100dvh] bg-night-950 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3" onClick={() => navigate('/')}>
          <div className="scale-75 origin-left">
            <Logo />
          </div>
          {title && <h1 className="text-lg font-display font-bold tracking-tight">{title}</h1>}
        </div>
        
        {currentUser && (
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <LogOut size={20} className="text-white/60" />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      {showNav && currentUser && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/5 px-6 py-3 flex justify-around items-center">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-white scale-110' : 'text-white/40'
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
