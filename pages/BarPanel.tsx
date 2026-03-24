import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { Order, Product, OperationType, UserProfile, Staff } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { Howl } from 'howler';
import { Clock, Check, Play, Package, Edit3, Save, X, AlertCircle, Power, PowerOff, Trash2, LogOut, MessageSquare, UserCog, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
        } else if (user.email === 'esquina60@esquina60.com') {
          setUserProfile({ uid: user.id, email: user.email || '', role: 'admin' });
        } else {
          setUserProfile({ uid: user.id, email: user.email || '', role: 'bar' });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (isMounted && user.email === 'esquina60@esquina60.com') {
          setUserProfile({ uid: user.id, email: user.email || '', role: 'admin' });
        } else {
          setUserProfile({ uid: user.id, email: user.email || '', role: 'bar' });
        }
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
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
      
      // If order is done, update camarote total spent
      if (status === 'done') {
        const { data: camaroteData } = await supabase.from('camarotes').select('totalSpent').eq('id', camaroteId).single();
        if (camaroteData) {
          await supabase.from('camarotes').update({ 
            totalSpent: Number(camaroteData.totalSpent) + Number(total) 
          }).eq('id', camaroteId);
        }
      }
    } catch (error) {
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
    <div className="min-h-[100dvh] bg-night-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gold font-bold text-xs uppercase tracking-widest">ESQUINA60</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white">Painel do Bar</h1>
            <p className="text-gray-400">Gerencie pedidos e produtos em tempo real.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-night-800 px-4 py-2 rounded-xl border border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pedidos Pendentes</p>
              <p className="text-xl font-display font-bold text-gold">{orders.filter(o => o.status !== 'done').length}</p>
            </div>
            {userProfile?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="w-12 h-12 rounded-xl bg-night-800 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                title="Painel Administrativo"
              >
                <LayoutDashboard size={20} />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-12 h-12 rounded-xl bg-night-800 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Package className="text-gold" /> Pedidos Recentes
            </h2>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {orders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-night-800 p-6 rounded-2xl border ${
                      order.status === 'new' ? 'border-blue-500/30 bg-blue-500/5' : 
                      order.status === 'preparing' ? 'border-yellow-500/30 bg-yellow-500/5' : 
                      'border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{order.camaroteName}</h3>
                        <p className="text-xs text-gray-500">#{order.id.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleTimeString('pt-BR')}</p>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'new' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing', order.camaroteId, order.total)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition-all"
                          >
                            <Play className="w-4 h-4" /> Preparar
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'done', order.camaroteId, order.total)}
                            className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                          >
                            <Check className="w-4 h-4" /> Finalizar
                          </button>
                        )}
                        {order.status === 'done' && (
                          <span className="text-green-500 flex items-center gap-1 text-sm font-bold">
                            <Check className="w-4 h-4" /> Entregue
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col bg-night-900/50 p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">{item.quantity}x {item.name}</span>
                            <span className="text-gray-500 text-sm">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          {item.notes && (
                            <div className="mt-2 flex items-start gap-2 text-gold">
                              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <p className="text-[11px] italic font-medium">Obs: {item.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      {order.notes && (
                        <div className="mt-4 p-3 bg-gold/10 rounded-xl border border-gold/20">
                          <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-1">Observação Geral:</p>
                          <p className="text-sm text-white">{order.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-gray-400 font-bold uppercase text-xs">Total do Pedido</span>
                      <span className="text-xl font-display font-bold text-gold">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Products Column */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Package className="text-gold" /> Estoque
              </h2>
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id} className="bg-night-800 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{product.name}</h4>
                      <p className="text-gold font-bold text-xs">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <button
                      onClick={() => toggleProductAvailability(product.id, product.isAvailable)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${product.isAvailable ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                    >
                      {product.isAvailable ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <UserCog className="text-gold" /> Equipe em Serviço
              </h2>
              <div className="space-y-3">
                {staff.map(member => (
                  <div key={member.id} className="bg-night-800 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{member.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{member.role} • {member.responsibility}</p>
                      </div>
                      <button
                        onClick={() => openStaffWhatsapp(member.whatsapp)}
                        className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500/20 transition-all"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {staff.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4 italic">Nenhum funcionário ativo no momento.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
