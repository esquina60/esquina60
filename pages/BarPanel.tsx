import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { Order, Product, OperationType, UserProfile, Staff } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { Howl } from 'howler';
import { Clock, Check, Play, Package, Edit3, Save, X, AlertCircle, Power, PowerOff, Trash2, LogOut, MessageSquare, UserCog, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

const notificationSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'],
  volume: 0.5
});

export const BarPanel: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const ordersRef = React.useRef<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    let unsubs: (() => void) | undefined;
    let isMounted = true;

    const setupDataListeners = () => {
      if (!isMounted) return;

      const fetchInitial = async () => {
        const [
          { data: initialOrders },
          { data: initialProducts },
          { data: initialStaff }
        ] = await Promise.all([
          supabase.from('orders').select('*').order('createdAt', { ascending: false }),
          supabase.from('products').select('*'),
          supabase.from('staff').select('*').eq('isActive', true)
        ]);

        if (!isMounted) return;
        if (initialOrders) setOrders(initialOrders as Order[]);
        if (initialProducts) setProducts(initialProducts as Product[]);
        if (initialStaff) setStaff(initialStaff as Staff[]);
      };
      (window as any).refreshData = fetchInitial;
      fetchInitial();

      const ordersChannel = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT' && payload.new.status === 'new') {
            notificationSound.play();
          }
          const { data } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
          if (data) setOrders(data as Order[]);
        })
        .subscribe();

      const productsChannel = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
          if (!isMounted) return;
          const { data } = await supabase.from('products').select('*');
          if (data) setProducts(data as Product[]);
        })
        .subscribe();

      const staffChannel = supabase
        .channel('public:staff')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, async () => {
          if (!isMounted) return;
          const { data } = await supabase.from('staff').select('*').eq('isActive', true);
          if (data) setStaff(data as Staff[]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(productsChannel);
        supabase.removeChannel(staffChannel);
      };
    };

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        navigate('/login');
        return;
      }

      // Start listening to orders immediately!
      unsubs = setupDataListeners();
      try {
        const { data: userDoc } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (!isMounted) return;

        if (userDoc) {
          const userData = { uid: userDoc.id, ...userDoc } as unknown as UserProfile;
          setUserProfile(userData);
        } else {
          setUserProfile({ uid: user.id, email: user.email || '', role: 'bar' });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({ uid: user.id, email: user.email || '', role: 'bar' });
      } finally {
        if (isMounted) {
          unsubs = setupDataListeners();
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
      if (typeof unsubs === 'function') unsubs();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], camaroteId: string, total: number) => {
    // Optimistic update
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));

    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      
      // If order is done, update camarote total spent
      if (status === 'done') {
        const { data: camaroteData } = await supabase.from('camarotes').select('totalSpent').eq('id', camaroteId).single();
        if (camaroteData) {
          await supabase.from('camarotes').update({ 
            totalSpent: Number(camaroteData.totalSpent) + Number(total) 
          }).eq('id', camaroteId);
        }
      }

      // Sound effect for status change
      new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
        volume: 0.5
      }).play();

    } catch (error) {
      if ((window as any).refreshData) (window as any).refreshData(); // Revert on failure
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const toggleProductAvailability = async (productId: string, current: boolean) => {
    try {
      await supabase.from('products').update({ isAvailable: !current }).eq('id', productId);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
    }
  };

  const openStaffWhatsapp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanNumber}`, '_blank');
  };

  return (
    <div className="min-h-[100dvh] bg-night-950 text-white">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Logo className="w-48" />
            <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight">Painel do Bar</h1>
              <p className="text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Gestão de Pedidos em Tempo Real</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {userProfile?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="px-6 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                <LayoutDashboard size={18} /> Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content: Orders (3 Columns) */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column: NEW */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-6 py-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-white/20" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Solicitados</h2>
                  </div>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold">{orders.filter(o => o.status === 'new').length}</span>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {orders.filter(o => o.status === 'new').map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass p-6 rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-2xl font-display font-bold text-white mb-1">{order.camaroteName}</h3>
                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">#{order.id.slice(-4).toUpperCase()} • {new Date(order.createdAt).toLocaleTimeString('pt-BR')}</p>
                          </div>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing', order.camaroteId, order.total)}
                            className="bg-white text-black px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all"
                          >
                            Preparar
                          </button>
                        </div>
                        <OrderItems items={order.items} notes={order.notes} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Column: PREPARING */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-6 py-4 bg-white text-black rounded-3xl">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="animate-spin" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">Em Preparo</h2>
                  </div>
                  <span className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-bold">{orders.filter(o => o.status === 'preparing').length}</span>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {orders.filter(o => o.status === 'preparing').map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass p-6 rounded-[2.5rem] border border-white"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-2xl font-display font-bold text-white mb-1">{order.camaroteName}</h3>
                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">#{order.id.slice(-4).toUpperCase()}</p>
                          </div>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'done', order.camaroteId, order.total)}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            Finalizar
                          </button>
                        </div>
                        <OrderItems items={order.items} notes={order.notes} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Column: DONE */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-6 py-4 bg-emerald-500/10 text-emerald-500 rounded-3xl border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <Check size={16} />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">Entregues</h2>
                  </div>
                  <span className="bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-bold">{orders.filter(o => o.status === 'done').length}</span>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {orders.filter(o => o.status === 'done').slice(0, 10).map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass p-6 rounded-[2.5rem] border border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-display font-bold text-white">{order.camaroteName}</h3>
                            <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Entregue às {new Date(order.createdAt).toLocaleTimeString('pt-BR')}</p>
                          </div>
                          <Check size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                          {order.items.length} itens • R$ {order.total.toLocaleString('pt-BR')}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Inventory & Staff */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/20 mb-8 flex items-center gap-3">
                <Package size={14} /> Estoque
              </h2>
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id} className="flex items-center justify-between group">
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-white/80 transition-colors">{product.name}</h4>
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{product.category}</p>
                    </div>
                    <button
                      onClick={() => toggleProductAvailability(product.id, product.isAvailable)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                        product.isAvailable 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/20 mb-8 flex items-center gap-3">
                <UserCog size={14} /> Equipe
              </h2>
              <div className="space-y-6">
                {staff.map(member => (
                  <div key={member.id} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-white text-sm">{member.name}</h4>
                      <button
                        onClick={() => openStaffWhatsapp(member.whatsapp)}
                        className="text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{member.role} • {member.responsibility}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for order items
const OrderItems = ({ items, notes }: { items: any[], notes?: string }) => (
  <div className="space-y-3">
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white/90">{item.quantity}x {item.name}</span>
          </div>
          {item.notes && (
            <p className="text-[10px] text-white/30 italic ml-4 border-l border-white/10 pl-2">
              {item.notes}
            </p>
          )}
        </div>
      ))}
    </div>
    {notes && (
      <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/5">
        <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest mb-1">Observação:</p>
        <p className="text-xs text-white/60 font-medium leading-relaxed">{notes}</p>
      </div>
    )}
  </div>
);
