import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Product, Camarote, Order, OrderItem, OperationType, Challenge, Promotion } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { Ranking } from '../components/Ranking';
import { Howl } from 'howler';
import { ShoppingCart, Package, Check, Clock, Plus, Minus, X, AlertCircle, Swords, Trophy, Send, Bell, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

const promoSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'],
  volume: 0.6
});

export const ClientView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [camarote, setCamarote] = useState<Camarote | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [activePromotion, setActivePromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [otherCamarotes, setOtherCamarotes] = useState<Camarote[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);
  const [selectedCamarote, setSelectedCamarote] = useState<Camarote | null>(null);
  const [challengeType, setChallengeType] = useState<'value' | 'product'>('value');
  const [challengeValue, setChallengeValue] = useState<number>(50);
  const [challengeProduct, setChallengeProduct] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Fetch all initial data
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    let isMounted = true;

    const init = async () => {
      if (!slug) return;

      // 1. Fetch camarote by slug
      const { data: camaroteData } = await supabase.from('camarotes').select('*').eq('slug', slug).single();
      if (!isMounted) return;
      if (camaroteData) {
        setCamarote(camaroteData as Camarote);
      } else {
        setLoading(false);
        return; // handle not found
      }

      const camaroteId = camaroteData.id;

      // 2. Fetch everything else now that we have camaroteId
      const [
        { data: settingsData },
        { data: productsData },
        { data: ordersData },
        { data: otherCamarotesData },
        { data: challengesData },
        { data: promotionsData }
      ] = await Promise.all([
        supabase.from('settings').select('*').eq('id', 'general').maybeSingle(),
        supabase.from('products').select('*').eq('isAvailable', true),
        supabase.from('orders').select('*').eq('camaroteId', camaroteId).order('createdAt', { ascending: false }),
        supabase.from('camarotes').select('*').eq('isActive', true).neq('id', camaroteId),
        supabase.from('challenges').select('*').eq('toId', camaroteId).eq('status', 'pending'),
        supabase.from('promotions').select('*').eq('active', true).order('createdAt', { ascending: false })
      ]);

      if (!isMounted) return;

      if (settingsData && settingsData.whatsappNumber) setWhatsappNumber(settingsData.whatsappNumber);
      if (productsData) setProducts(productsData as Product[]);
      if (ordersData) setOrders(ordersData as Order[]);
      if (otherCamarotesData) setOtherCamarotes(otherCamarotesData as Camarote[]);
      if (challengesData) setIncomingChallenges(challengesData as Challenge[]);
      
      if (promotionsData && promotionsData.length > 0) {
        const promo = promotionsData[0] as Promotion;
        setActivePromotion((prev: any) => {
          if (!prev || prev.id !== promo.id) {
            promoSound.play();
          }
          return promo;
        });
      } else {
        setActivePromotion(null);
      }

      setLoading(false);

      // Now set up realtime listeners
      const settingsChannel = supabase.channel('client_settings').on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `id=eq.general` }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('settings').select('*').eq('id', 'general').maybeSingle();
        if (data && data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
      }).subscribe();
      unsubs.push(() => supabase.removeChannel(settingsChannel));

      const camaroteChannel = supabase.channel('client_camarote').on('postgres_changes', { event: '*', schema: 'public', table: 'camarotes', filter: `id=eq.${camaroteId}` }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('camarotes').select('*').eq('id', camaroteId).single();
        if (data) setCamarote(data as Camarote);
      }).subscribe();
      unsubs.push(() => supabase.removeChannel(camaroteChannel));

      const productsChannel = supabase.channel('client_products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('products').select('*').eq('isAvailable', true);
        if (data) setProducts(data as Product[]);
      }).subscribe();
      unsubs.push(() => supabase.removeChannel(productsChannel));

      const ordersChannel = supabase.channel('client_orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `camaroteId=eq.${camaroteId}` }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('orders').select('*').eq('camaroteId', camaroteId).order('createdAt', { ascending: false });
        if (data) setOrders(data as Order[]);
      }).subscribe();
      unsubs.push(() => supabase.removeChannel(ordersChannel));

      const otherCamarotesChannel = supabase.channel('client_other_camarotes').on('postgres_changes', { event: '*', schema: 'public', table: 'camarotes' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('camarotes').select('*').eq('isActive', true).neq('id', camaroteId);
        if (data) setOtherCamarotes(data as Camarote[]);
      }).subscribe();
      unsubs.push(() => supabase.removeChannel(otherCamarotesChannel));

      const challengesChannel = supabase.channel('client_challenges').on('postgres_changes', { event: '*', schema: 'public', table: 'challenges', filter: `toId=eq.${camaroteId}` }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('challenges').select('*').eq('toId', camaroteId).eq('status', 'pending');
        if (data) setIncomingChallenges(data as Challenge[]);
      }).subscribe();
      unsubs.push(() => supabase.removeChannel(challengesChannel));

      const promotionsChannel = supabase.channel('client_promotions').on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('promotions').select('*').eq('active', true).order('createdAt', { ascending: false });
        if (data && data.length > 0) {
          const promo = data[0] as Promotion;
          setActivePromotion((prev: any) => {
            if (!prev || prev.id !== promo.id) {
              promoSound.play();
            }
            return promo;
          });
        } else {
          setActivePromotion(null);
        }
      }).subscribe();
      unsubs.push(() => supabase.removeChannel(promotionsChannel));

    };

    init();

    return () => {
      isMounted = false;
      unsubs.forEach(unsub => unsub());
    };
  }, [slug]);

  const sendChallenge = async () => {
    if (!camarote || !selectedCamarote) return;
    try {
      await supabase.from('challenges').insert([{
        fromId: camarote.id,
        fromName: camarote.name,
        toId: selectedCamarote.id,
        toName: selectedCamarote.name,
        type: challengeType,
        value: challengeType === 'value' ? challengeValue : null,
        productName: challengeType === 'product' ? challengeProduct : null,
        status: 'pending'
      }]);
      setIsChallengeModalOpen(false);
      setSelectedCamarote(null);
      alert('Desafio enviado com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'challenges');
    }
  };

  const respondToChallenge = async (id: string, status: 'accepted' | 'declined') => {
    try {
      await supabase.from('challenges').update({ status }).eq('id', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `challenges/${id}`);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && !item.notes);
      if (existing) {
        return prev.map(item => (item.productId === product.id && !item.notes) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, notes: '' }];
    });
  };

  const updateItemNotes = (productId: string, notes: string, index: number) => {
    setCart(prev => prev.map((item, idx) => idx === index ? { ...item, notes } : item));
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, idx) => {
      if (idx === index) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const placeOrder = async () => {
    if (!camarote || cart.length === 0) return;
    try {
      const orderData = {
        camaroteId: camarote.id,
        camaroteName: camarote.name,
        items: cart,
        status: 'new',
        total: cartTotal,
        notes: orderNotes
      };
      
      const { data: docRef, error } = await supabase.from('orders').insert([orderData]).select().single();
      
      if (error) throw error;
      
      // WhatsApp Notification
      if (whatsappNumber && docRef) {
        const cleanWhatsapp = whatsappNumber.replace(/\D/g, '');
        const itemsText = cart.map(item => `• ${item.quantity}x ${item.name}${item.notes ? ` (Obs: ${item.notes})` : ''}`).join('\n');
        const totalText = cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const message = `*NOVO PEDIDO - ESQUINA60*\n\n` +
                        `*Camarote:* ${camarote.name}\n` +
                        `*Pedido:* #${docRef.id.slice(-6).toUpperCase()}\n\n` +
                        `*Itens:*\n${itemsText}\n\n` +
                        `*Total:* ${totalText}\n` +
                        `${orderNotes ? `*Obs Geral:* ${orderNotes}\n` : ''}\n` +
                        `-------------------\n` +
                        `*Atualizar Status:*\n` +
                        `👉 Preparar: ${window.location.origin}/update-order/${docRef.id}/preparing\n` +
                        `👉 Finalizar: ${window.location.origin}/update-order/${docRef.id}/done`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      }

      setCart([]);
      setOrderNotes('');
      setIsCartOpen(false);
      setIsOrdersOpen(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  if (loading) return <div className="min-h-[100dvh] flex items-center justify-center bg-night-950 text-white font-logo tracking-widest">CARREGANDO...</div>;
  if (!camarote) return <div className="min-h-[100dvh] flex items-center justify-center bg-night-950 text-white font-logo tracking-widest">NÃO ENCONTRADO</div>;

  if (camarote.isActive === false) {
    return (
      <div className="min-h-[100dvh] bg-night-950 flex flex-col items-center justify-center p-6 text-center">
        <Logo className="scale-125 mb-12" />
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <X className="w-10 h-10 text-white/40" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-4">CONTA ENCERRADA</h1>
        <p className="text-white/40 max-w-xs mx-auto mb-12">
          Esperamos que tenha aproveitado a experiência. Até a próxima!
        </p>
        <div className="glass p-8 rounded-3xl w-full max-w-sm">
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2 font-bold">Total Consumido</p>
          <p className="text-4xl font-display font-bold text-white">R$ {camarote.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-night-950 pb-32">
      <Ranking />

      {/* Promotion Banner */}
      <AnimatePresence>
        {activePromotion && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white text-black p-4 flex items-center gap-4 relative overflow-hidden"
          >
            <div className="p-2 bg-black rounded-lg text-white">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-0.5">
                Promoção Ativa
              </h3>
              <p className="text-sm font-bold leading-tight">{activePromotion.title}</p>
              <p className="text-[10px] opacity-70 mt-1">{activePromotion.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <Logo className="scale-75 origin-left mb-6" />
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Olá, {camarote.name}</h1>
            <p className="text-white/40 text-sm font-medium">Sua experiência premium começa aqui.</p>
          </div>
          <button
            onClick={() => setIsChallengeModalOpen(true)}
            className="glass p-4 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <Swords className="w-6 h-6 text-white" />
          </button>
        </header>

        {/* Incoming Challenges Alert */}
        <AnimatePresence>
          {incomingChallenges.map(challenge => (
            <motion.div
              key={challenge.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="mb-8 glass p-6 rounded-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-white" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-black">
                    <Swords size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-1">Desafio Recebido!</p>
                    <p className="text-sm text-white font-medium">
                      <span className="font-bold">{challenge.fromName}</span> desafiou você
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToChallenge(challenge.id, 'accepted')}
                    className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                  >
                    Aceitar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {['Todos', ...Array.from(new Set(products.map(p => p.category || 'Outros')))].map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === category 
                  ? 'bg-white text-black shadow-lg shadow-white/20' 
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="space-y-10">
          {Object.entries(
            products
              .filter(p => activeCategory === 'Todos' || (p.category || 'Outros') === activeCategory)
              .reduce((acc, product) => {
              const cat = product.category || 'Outros';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(product);
              return acc;
            }, {} as Record<string, Product[]>)
          ).map(([category, items]) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">{category}</h2>
                <div className="h-px flex-1 bg-white/5 ml-4" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {items.map(product => (
                  <motion.div
                    key={product.id}
                    whileTap={{ scale: 0.98 }}
                    className="glass rounded-2xl overflow-hidden flex flex-col p-5 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-lg text-white leading-tight mb-1">{product.name}</h3>
                        <p className="text-xs text-white/40 uppercase tracking-wider font-medium leading-relaxed">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold text-lg block">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-white text-black px-6 py-2 rounded-xl hover:bg-neutral-200 transition-all shadow-lg flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                      >
                        <Plus size={16} /> Adicionar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/5 p-6 flex justify-around items-center z-40 pb-8">
        <button
          onClick={() => setIsOrdersOpen(true)}
          className={`flex flex-col items-center gap-2 transition-all ${isOrdersOpen ? 'text-white' : 'text-white/40'}`}
        >
          <div className="relative">
            <Package size={24} />
            {orders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">
                {orders.length}
              </span>
            )}
          </div>
          <span className="text-[8px] uppercase font-bold tracking-[0.2em]">Pedidos</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center gap-2 transition-all ${isCartOpen ? 'text-white' : 'text-white/40'}`}
        >
          <div className="relative">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-[8px] uppercase font-bold tracking-[0.2em]">Carrinho</span>
        </button>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-night-950 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold tracking-tight">CARRINHO</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors"><X /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                  <ShoppingCart size={64} className="mb-6 opacity-10" />
                  <p className="font-logo text-xl tracking-widest uppercase">Vazio</p>
                </div>
              ) : (
                <>
                  {cart.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="glass p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white">{item.name}</h4>
                          <p className="text-white/40 text-xs font-bold mt-1">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1 border border-white/10">
                            <button onClick={() => updateQuantity(idx, -1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Minus size={14} /></button>
                            <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(idx, 1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => removeFromCart(idx)} className="text-white/20 hover:text-red-500 transition-colors"><X size={20} /></button>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <input
                          type="text"
                          placeholder="Instruções especiais..."
                          value={item.notes || ''}
                          onChange={(e) => updateItemNotes(item.productId, e.target.value, idx)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3 block ml-1">Observação Geral</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Alguma instrução adicional para o bar?"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-white/20 h-32 resize-none placeholder:text-white/10"
                    />
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 glass border-t border-white/10">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-white/40 font-bold uppercase tracking-widest text-xs">Total</span>
                  <span className="text-3xl font-display font-bold text-white tracking-tight">R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="btn-primary w-full py-5 text-lg shadow-2xl shadow-white/10"
                >
                  CONFIRMAR PEDIDO
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      <AnimatePresence>
        {isChallengeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-display font-bold flex items-center gap-3 tracking-tight">
                  <Swords className="text-white" /> DESAFIAR
                </h2>
                <button onClick={() => setIsChallengeModalOpen(false)} className="text-white/40 hover:text-white"><X /></button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Selecione o Oponente</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {otherCamarotes.length === 0 ? (
                      <p className="col-span-2 text-center py-8 text-white/20 text-xs italic font-medium">Nenhum outro camarote ativo.</p>
                    ) : (
                      otherCamarotes.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCamarote(c)}
                          className={`p-4 rounded-xl border text-xs font-bold transition-all uppercase tracking-widest ${selectedCamarote?.id === c.id ? 'bg-white border-white text-black' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
                        >
                          {c.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {selectedCamarote && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Tipo de Desafio</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setChallengeType('value')}
                          className={`flex-1 py-4 rounded-xl border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${challengeType === 'value' ? 'bg-white border-white text-black' : 'bg-white/5 border-white/5 text-white/40'}`}
                        >
                          Valor
                        </button>
                        <button
                          onClick={() => setChallengeType('product')}
                          className={`flex-1 py-4 rounded-xl border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${challengeType === 'product' ? 'bg-white border-white text-black' : 'bg-white/5 border-white/5 text-white/40'}`}
                        >
                          Item
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {challengeType === 'value' ? (
                        <>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Valor (R$)</label>
                          <input
                            type="number"
                            value={challengeValue}
                            onChange={(e) => setChallengeValue(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white transition-all"
                          />
                        </>
                      ) : (
                        <>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Qual item?</label>
                          <select
                            value={challengeProduct}
                            onChange={(e) => setChallengeProduct(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white transition-all appearance-none"
                          >
                            <option value="">Selecione...</option>
                            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        </>
                      )}
                    </div>

                    <button
                      onClick={sendChallenge}
                      className="btn-primary w-full py-5 flex items-center justify-center gap-3"
                    >
                      <Send size={20} />
                      <span>ENVIAR DESAFIO</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Drawer */}
      <AnimatePresence>
        {isOrdersOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-night-950 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold tracking-tight">MEUS PEDIDOS</h2>
              <button onClick={() => setIsOrdersOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors"><X /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                  <Package size={64} className="mb-6 opacity-10" />
                  <p className="font-logo text-xl tracking-widest uppercase">Sem Pedidos</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-1">Pedido #{order.id.slice(-4).toUpperCase()}</p>
                        <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">{new Date(order.createdAt || new Date()).toLocaleTimeString('pt-BR')}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${
                        order.status === 'new' ? 'bg-white/5 text-white/60' :
                        order.status === 'preparing' ? 'bg-white text-black' :
                        'bg-white/10 text-white'
                      }`}>
                        {order.status === 'new' && <Clock size={10} />}
                        {order.status === 'preparing' && <Clock size={10} className="animate-spin" />}
                        {order.status === 'done' && <Check size={10} />}
                        {order.status === 'new' ? 'Pendente' : order.status === 'preparing' ? 'Preparando' : 'Entregue'}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">{item.quantity}x {item.name}</span>
                            <span className="text-xs text-white/40 font-medium">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[10px] text-white/30 italic mt-1 ml-4 border-l border-white/10 pl-2">Obs: {item.notes}</p>
                          )}
                        </div>
                      ))}
                      {order.notes && (
                        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                          <p className="text-[8px] text-white/20 uppercase font-bold mb-1 tracking-widest">Observação Geral:</p>
                          <p className="text-xs text-white/60 font-medium">{order.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total</span>
                      <span className="text-lg font-display font-bold text-white">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
