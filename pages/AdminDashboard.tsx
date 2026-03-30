import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { Camarote, Order, Product, Promotion, OperationType, Staff } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { 
  Users, 
  Menu as MenuIcon, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  Package, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Calendar,
  AlertCircle,
  Trophy,
  Megaphone,
  Zap,
  BarChart3,
  ExternalLink,
  Copy,
  Power,
  Moon,
  History,
  Edit3,
  Eye,
  EyeOff,
  Key,
  UserCog,
  MessageSquare,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

export const AdminDashboard: React.FC = () => {
  const [camarotes, setCamarotes] = useState<Camarote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [newCamaroteName, setNewCamaroteName] = useState('');
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Product Management State
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number>(0);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('combos de whisky');
  const [newProductImage, setNewProductImage] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editImage, setEditImage] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [closingCamarote, setClosingCamarote] = useState<Camarote | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [camaroteToDelete, setCamaroteToDelete] = useState<Camarote | null>(null);
  const [promoToDelete, setPromoToDelete] = useState<Promotion | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isNightClosureModalOpen, setIsNightClosureModalOpen] = useState(false);
  const [showClosureSuccess, setShowClosureSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'camarotes' | 'menu' | 'rosh' | 'promotions' | 'staff' | 'reports' | 'settings'>('overview');
  const [reportDate, setReportDate] = useState<string>(new Date().toLocaleString("en-CA", {year: "numeric", month: "2-digit", day: "2-digit"}));
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappRosh, setWhatsappRosh] = useState('');
  const [challengesEnabled, setChallengesEnabled] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Staff Management State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffWhatsapp, setNewStaffWhatsapp] = useState('');
  const [newStaffResponsibility, setNewStaffResponsibility] = useState('');
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // Manager Token
  const [managerToken, setManagerToken] = useState('LCS-' + Math.random().toString(36).substring(2, 8).toUpperCase());

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    let unsubs: (() => void) | undefined;
    let isMounted = true;

    const setupDataListeners = () => {
      if (!isMounted) return;

      const fetchInitial = async () => {
        const [
          { data: initialCamarotes },
          { data: initialOrders },
          { data: initialProducts },
          { data: initialPromos },
          { data: initialStaff },
          { data: initialSettings }
        ] = await Promise.all([
          supabase.from('camarotes').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('products').select('*'),
          supabase.from('promotions').select('*'),
          supabase.from('staff').select('*'),
          supabase.from('settings').select('*').eq('id', 'general').single()
        ]);

        if (!isMounted) return;
        if (initialCamarotes) setCamarotes(initialCamarotes as Camarote[]);
        if (initialOrders) setOrders(initialOrders as Order[]);
        if (initialProducts) setProducts(initialProducts as Product[]);
        if (initialPromos) setPromotions(initialPromos as Promotion[]);
        if (initialStaff) setStaff(initialStaff as Staff[]);
        if (initialSettings) {
          if (initialSettings.whatsappNumber) setWhatsappNumber(initialSettings.whatsappNumber);
          if (initialSettings.whatsappRosh) setWhatsappRosh(initialSettings.whatsappRosh);
          if (initialSettings.challengesEnabled !== undefined) setChallengesEnabled(initialSettings.challengesEnabled);
        }
      };

      fetchInitial();

      const camarotesChannel = supabase.channel('public:camarotes').on('postgres_changes', { event: '*', schema: 'public', table: 'camarotes' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('camarotes').select('*');
        if (data) setCamarotes(data as Camarote[]);
      }).subscribe();

      const ordersChannel = supabase.channel('public:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('orders').select('*');
        if (data) setOrders(data as Order[]);
      }).subscribe();

      const productsChannel = supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('products').select('*');
        if (data) setProducts(data as Product[]);
      }).subscribe();

      const promosChannel = supabase.channel('public:promotions').on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('promotions').select('*');
        if (data) setPromotions(data as Promotion[]);
      }).subscribe();

      const staffChannel = supabase.channel('public:staff').on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('staff').select('*');
        if (data) setStaff(data as Staff[]);
      }).subscribe();

      const settingsChannel = supabase.channel('public:settings').on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
        if (!isMounted) return;
        const { data } = await supabase.from('settings').select('*').eq('id', 'general').single();
        if (data) {
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
          if (data.whatsappRosh) setWhatsappRosh(data.whatsappRosh);
          if (data.challengesEnabled !== undefined) setChallengesEnabled(data.challengesEnabled);
        }
      }).subscribe();

      return () => {
        supabase.removeChannel(camarotesChannel);
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(productsChannel);
        supabase.removeChannel(promosChannel);
        supabase.removeChannel(staffChannel);
        supabase.removeChannel(settingsChannel);
      };
    };

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      unsubs = setupDataListeners();
    };

    init();

    return () => {
      isMounted = false;
      if (typeof unsubs === 'function') unsubs();
    };
  }, [navigate]);

  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'done').reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate most consumed product
    const productCounts: { [key: string]: { name: string, quantity: number } } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = { name: item.name, quantity: 0 };
        }
        productCounts[item.productId].quantity += item.quantity;
      });
    });

    const mostConsumed = Object.values(productCounts).sort((a, b) => b.quantity - a.quantity)[0] || null;

    return { totalRevenue, totalOrders, avgTicket, mostConsumed };
  }, [orders]);

  const reportStats = useMemo(() => {
    const startOfDate = new Date(reportDate + 'T00:00:00');
    const endOfDate = new Date(reportDate + 'T23:59:59.999');
    
    const dayOrders = orders.filter(o => {
      if (o.status !== 'done') return false;
      const orderDate = new Date(o.createdAt);
      return orderDate >= startOfDate && orderDate <= endOfDate;
    });

    const totalRevenue = dayOrders.reduce((s, o) => s + o.total, 0);
    const totalOrders = dayOrders.length;
    const barRevenue = dayOrders.filter(o => o.department === 'bar' || !o.department).reduce((s, o) => s + o.total, 0);
    const roshRevenue = dayOrders.filter(o => o.department === 'rosh').reduce((s, o) => s + o.total, 0);
    
    const camaroteRev: Record<string, number> = {};
    dayOrders.forEach(o => {
      camaroteRev[o.camaroteName] = (camaroteRev[o.camaroteName] || 0) + o.total;
    });
    const camaroteRanking = Object.entries(camaroteRev)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    return { totalRevenue, totalOrders, barRevenue, roshRevenue, camaroteRanking };
  }, [orders, reportDate]);

  const createCamarote = async () => {
    if (!newCamaroteName) return;
    const slug = newCamaroteName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    try {
      await supabase.from('camarotes').insert([{
        name: newCamaroteName,
        slug,
        totalSpent: 0,
        isActive: true
      }]);
      setNewCamaroteName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'camarotes');
    }
  };

  const closeCamarote = async (id: string) => {
    const camaroteToClose = camarotes.find(c => c.id === id);
    if (!camaroteToClose) return;
    
    try {
      await supabase.from('camarotes').update({ isActive: false }).eq('id', id);
      alert(`Camarote ${camaroteToClose.name} fechado com sucesso!\nTotal Consumido: R$ ${camaroteToClose.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      setClosingCamarote(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `camarotes/${id}`);
    }
  };

  const nightClosure = async () => {
    setIsResetting(true);
    try {
      const deleteCollection = async (table: string) => {
        const { data } = await supabase.from(table).select('id');
        if (data && data.length > 0) {
          const ids = data.map(d => d.id);
          for (let i = 0; i < ids.length; i += 500) {
            const chunk = ids.slice(i, i + 500);
            await supabase.from(table).delete().in('id', chunk);
          }
        }
      };

      await deleteCollection('orders');
      await deleteCollection('challenges');
      await deleteCollection('camarotes');

      setIsNightClosureModalOpen(false);
      setShowClosureSuccess(true);
      
      // Force local state reset to ensure UI updates immediately
      setOrders([]);
      setCamarotes([]);
    } catch (error) {
      console.error("Erro no fechamento:", error);
      handleFirestoreError(error, OperationType.DELETE, 'bulk-reset');
    } finally {
      setIsResetting(false);
    }
  };

  const createPromotion = async () => {
    if (!newPromoTitle) return;
    try {
      await supabase.from('promotions').insert([{
        title: newPromoTitle,
        description: newPromoDesc,
        active: true
      }]);
      setNewPromoTitle('');
      setNewPromoDesc('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'promotions');
    }
  };

  const togglePromotion = async (id: string, current: boolean) => {
    try {
      await supabase.from('promotions').update({ active: !current }).eq('id', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `promotions/${id}`);
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      await supabase.from('promotions').delete().eq('id', id);
      setPromoToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `promotions/${id}`);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem. Verifique o bucket "products" no Supabase.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await supabase.from('settings').upsert({
        id: 'general',
        whatsappNumber,
        whatsappRosh,
        challengesEnabled
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/general');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Product Management Functions
  const createProduct = async () => {
    if (!newProductName || newProductPrice <= 0) return;
    try {
      await supabase.from('products').insert([{
        name: newProductName,
        price: newProductPrice,
        category: newProductCategory,
        imageUrl: newProductImage || `https://picsum.photos/seed/${newProductName}/400/400`,
        isAvailable: true,
        description: newProductDescription,
        department: activeTab === 'rosh' ? 'rosh' : 'bar'
      }]);
      setNewProductName('');
      setNewProductPrice(0);
      setNewProductImage('');
      setNewProductDescription('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await supabase.from('products').update(updates).eq('id', id);
      setEditingProductId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const toggleProductAvailability = async (id: string, current: boolean) => {
    try {
      await supabase.from('products').update({ isAvailable: !current }).eq('id', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await supabase.from('products').delete().eq('id', id);
      setProductToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const createStaff = async () => {
    if (!newStaffName || !newStaffRole || !newStaffWhatsapp || !newStaffResponsibility) return;
    try {
      await supabase.from('staff').insert([{
        name: newStaffName,
        role: newStaffRole,
        whatsapp: newStaffWhatsapp,
        responsibility: newStaffResponsibility,
        isActive: true,
        establishmentId: 'default'
      }]);
      setNewStaffName('');
      setNewStaffRole('');
      setNewStaffWhatsapp('');
      setNewStaffResponsibility('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'staff');
    }
  };

  const toggleStaffStatus = async (id: string, current: boolean) => {
    try {
      await supabase.from('staff').update({ isActive: !current }).eq('id', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `staff/${id}`);
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await supabase.from('staff').delete().eq('id', id);
      setStaffToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `staff/${id}`);
    }
  };

  const openStaffWhatsapp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanNumber}`, '_blank');
  };

  const copyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/camarote/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteCamarote = async (id: string) => {
    try {
      await supabase.from('camarotes').delete().eq('id', id);
      setCamaroteToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `camarotes/${id}`);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-[100dvh] bg-night-950 text-white pb-24">
      <header className="p-6 border-b border-white/5 bg-night-950/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white"
            >
              <MenuIcon size={20} />
            </button>
            <Logo className="scale-75 origin-left" />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/bar')}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Package size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Painel do Bar</span>
            </button>
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Painel Administrativo</p>
              <p className="text-sm font-medium">Gerente Geral</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-night-900 border-r border-white/10 z-[101] p-8 md:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                <Logo className="scale-75 origin-left" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'camarotes', label: 'Camarotes', icon: Users },
                  { id: 'menu', label: 'Cardápio Bar', icon: Package },
                  { id: 'rosh', label: 'Cardápio ROSH', icon: Zap },
                  { id: 'staff', label: 'Funcionários', icon: UserCog },
                  { id: 'promotions', label: 'Promoções', icon: Megaphone },
                  { id: 'reports', label: 'Relatórios', icon: Calendar },
                  { id: 'settings', label: 'Configurações', icon: Settings },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white text-black shadow-lg shadow-white/10' 
                        : 'text-white/40 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="text-sm uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="absolute bottom-8 left-8 right-8">
                <button
                  onClick={() => navigate('/bar')}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-white/60 hover:bg-white/5 transition-all mb-2"
                >
                  <Package size={20} />
                  <span className="text-sm uppercase tracking-widest">Painel do Bar</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={20} />
                  <span className="text-sm uppercase tracking-widest">Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto p-6">
        {/* Night Closure Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setIsNightClosureModalOpen(true)}
            disabled={isResetting}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all border ${
              isResetting 
              ? 'opacity-50 cursor-not-allowed border-white/5 text-white/20' 
              : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Moon size={20} className={isResetting ? 'animate-spin' : ''} />
            {isResetting ? 'Limpando...' : 'Fechamento da Noite'}
          </button>
        </div>

        {/* Tabs - Hidden on Mobile */}
        <div className="hidden md:flex gap-2 mb-12 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'camarotes', label: 'Camarotes', icon: Users },
            { id: 'menu', label: 'Cardápio Bar', icon: Package },
            { id: 'rosh', label: 'Cardápio ROSH', icon: Zap },
            { id: 'staff', label: 'Funcionários', icon: UserCog },
            { id: 'promotions', label: 'Promoções', icon: Megaphone },
            { id: 'reports', label: 'Relatórios', icon: Calendar },
            { id: 'settings', label: 'Configurações', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                activeTab === tab.id 
                ? 'bg-white border-white text-black shadow-xl shadow-white/10' 
                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <BarChart3 className="text-white/40" size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Faturamento</p>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Package className="text-white/40" size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Pedidos</p>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">{stats.totalOrders}</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <TrendingUp className="text-white/40" size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Ticket Médio</p>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">{formatCurrency(stats.avgTicket)}</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Trophy className="text-white/40" size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Mais Consumido</p>
                  </div>
                  <p className="text-xl font-bold tracking-tight truncate">
                    {stats.mostConsumed ? stats.mostConsumed.name : 'Nenhum'}
                  </p>
                  {stats.mostConsumed && (
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">
                      {stats.mostConsumed.quantity} unidades
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center backdrop-blur-xl">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <LayoutDashboard className="text-white/20" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Painel</h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-8">Selecione uma das abas acima para gerenciar camarotes, produtos ou promoções da noite.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'camarotes' && (
            <motion.div
              key="camarotes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Gestão de Camarotes</h2>
                  <p className="text-white/40 text-sm">Controle de acesso e consumo em tempo real.</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nome do Camarote"
                    value={newCamaroteName}
                    onChange={(e) => setNewCamaroteName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all w-full md:w-64"
                  />
                  <button
                    onClick={createCamarote}
                    className="bg-white text-black px-8 py-3 rounded-2xl font-bold hover:bg-white/90 transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={20} /> Criar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {camarotes
                  .filter(c => c.isActive !== false)
                  .sort((a, b) => b.totalSpent - a.totalSpent)
                  .map((camarote) => (
                    <div key={camarote.id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl hover:border-white/20 transition-all group">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Users className="text-white/40" size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{camarote.name}</h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">ID: {camarote.id.slice(0, 4)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyLink(camarote.slug, camarote.id)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                              copiedId === camarote.id 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                            }`}
                          >
                            {copiedId === camarote.id ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                          <button
                            onClick={() => setClosingCamarote(camarote)}
                            className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => setCamaroteToDelete(camarote)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-red-500 flex items-center justify-center transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Consumo</p>
                          <p className="text-lg font-bold">{formatCurrency(camarote.totalSpent || 0)}</p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Status</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.1em]">Ativo</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Closed Camarotes Section */}
              {camarotes.some(c => c.isActive === false) && (
                <div className="pt-12 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <History className="text-white/20" size={20} />
                    <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Histórico da Noite</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {camarotes
                      .filter(c => c.isActive === false)
                      .map(camarote => (
                        <div key={camarote.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
                          <span className="text-sm font-bold">{camarote.name}</span>
                          <span className="text-sm font-bold text-white/40">{formatCurrency(camarote.totalSpent)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(activeTab === 'menu' || activeTab === 'rosh') && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6">{activeTab === 'rosh' ? 'Adicionar Novo Rosh' : 'Adicionar Novo Produto'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">Nome</p>
                    <input
                      type="text"
                      placeholder="Ex: Combo Gin"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">Preço (R$)</p>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newProductPrice || ''}
                      onChange={(e) => setNewProductPrice(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">Descrição</p>
                    <input
                      type="text"
                      placeholder="Ex: 1 Garrafa + 4 Tônicas"
                      value={newProductDescription}
                      onChange={(e) => setNewProductDescription(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">Categoria</p>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all appearance-none"
                    >
                      {activeTab === 'rosh' ? (
                        <>
                          <option className="bg-night-900 text-white" value="tradicional">Tradicional</option>
                          <option className="bg-night-900 text-white" value="premium">Premium</option>
                          <option className="bg-night-900 text-white" value="especial da casa">Especial da Casa</option>
                        </>
                      ) : (
                        <>
                          <option className="bg-night-900 text-white" value="combos de whisky">Combos de Whisky</option>
                          <option className="bg-night-900 text-white" value="combos de gin">Combos de Gin</option>
                          <option className="bg-night-900 text-white" value="combos de vodka">Combos de Vodka</option>
                          <option className="bg-night-900 text-white" value="doses de whisky">Doses de Whisky</option>
                          <option className="bg-night-900 text-white" value="doses de gin">Doses de Gin</option>
                          <option className="bg-night-900 text-white" value="doses de vodka">Doses de Vodka</option>
                          <option className="bg-night-900 text-white" value="cervejas 600ml">Cervejas 600ml</option>
                          <option className="bg-night-900 text-white" value="cervejas long neck">Cervejas Long Neck</option>
                          <option className="bg-night-900 text-white" value="energeticos">Energéticos</option>
                          <option className="bg-night-900 text-white" value="refrigerantes">Refrigerantes</option>
                          <option className="bg-night-900 text-white" value="diversos">Diversos</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">Imagem do Produto</p>
                    <div className="flex gap-4">
                      {newProductImage || uploadPreview ? (
                        <div className="w-[46px] h-[46px] rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                          <img src={uploadPreview || newProductImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-[46px] h-[46px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/20">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 h-[46px]">
                          {isUploading ? <Clock className="animate-spin" size={18} /> : <Upload size={18} />}
                          <span className="truncate">{isUploading ? 'Subindo...' : 'Upload Imagem'}</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              setUploadPreview(previewUrl);
                              const uploadedUrl = await handleImageUpload(file);
                              if (uploadedUrl) setNewProductImage(uploadedUrl);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        createProduct();
                        setUploadPreview(null);
                      }}
                      disabled={isUploading}
                      className="w-full bg-white text-black h-[46px] rounded-2xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus size={20} /> Adicionar
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(p => activeTab === 'rosh' ? p.department === 'rosh' : (p.department === 'bar' || !p.department))
                  .map((product) => (
                  <div key={product.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl group overflow-hidden">
                    {product.imageUrl && (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                        {editingProductId === product.id ? (
                          <div className="space-y-4 mt-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="space-y-1">
                              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-2">Preço (R$)</p>
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-2">Descrição</p>
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white h-24 resize-none focus:outline-none focus:border-white/20"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-2">Imagem</p>
                              <div className="flex gap-2">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                  <img src={editImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <label className="flex-1 cursor-pointer">
                                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-1 h-10 font-bold uppercase tracking-widest">
                                    {isUploading ? <Clock className="animate-spin" size={12} /> : <Upload size={12} />}
                                    {isUploading ? '...' : 'Trocar'}
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const uploadedUrl = await handleImageUpload(file);
                                        if (uploadedUrl) setEditImage(uploadedUrl);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button 
                                onClick={() => updateProduct(product.id, { price: editPrice, description: editDescription, imageUrl: editImage })} 
                                className="flex-1 bg-white text-black py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                              >
                                Salvar
                              </button>
                              <button 
                                onClick={() => setEditingProductId(null)} 
                                className="flex-1 bg-white/5 text-white/40 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-lg font-bold text-white/60">{formatCurrency(product.price)}</p>
                            <p className="text-xs text-white/40 uppercase tracking-wider leading-relaxed">{product.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => { 
                            setEditingProductId(product.id); 
                            setEditPrice(product.price); 
                            setEditImage(product.imageUrl || '');
                            setEditDescription(product.description || '');
                          }}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => toggleProductAvailability(product.id, product.isAvailable)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                            product.isAvailable 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                              : 'bg-red-500/10 border-red-500/20 text-red-500'
                          }`}
                        >
                          {product.isAvailable ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-red-500 flex items-center justify-center transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{product.category || 'Geral'}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${product.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${product.isAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                          {product.isAvailable ? 'Em Estoque' : 'Esgotado'}
                        </span>
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="glass p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <UserCog className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Gestão de Funcionários</h2>
                    <p className="text-white/40 text-sm">Cadastre e gerencie a equipe da casa</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nome</label>
                    <input
                      type="text"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-white transition-all"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Função</label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-white transition-all appearance-none"
                    >
                      <option className="bg-night-900 text-white" value="" disabled>Selecione a função</option>
                      <option className="bg-night-900 text-white" value="Bar">Bar</option>
                      <option className="bg-night-900 text-white" value="Garçom">Garçom</option>
                      <option className="bg-night-900 text-white" value="Atendimento">Atendimento</option>
                      <option className="bg-night-900 text-white" value="Caixa">Caixa</option>
                      <option className="bg-night-900 text-white" value="Segurança">Segurança</option>
                      <option className="bg-night-900 text-white" value="Limpeza">Limpeza</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input
                      type="text"
                      value={newStaffWhatsapp}
                      onChange={(e) => setNewStaffWhatsapp(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-white transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Responsabilidade</label>
                    <input
                      type="text"
                      value={newStaffResponsibility}
                      onChange={(e) => setNewStaffResponsibility(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-white transition-all"
                      placeholder="Ex: Bar principal, Camarotes"
                    />
                  </div>
                </div>

                <button
                  onClick={createStaff}
                  className="w-full mt-6 bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Cadastrar Funcionário
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {staff.map((member) => (
                    <motion.div
                      key={member.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`glass p-6 rounded-3xl border transition-all ${
                        member.isActive ? 'border-white/10' : 'border-red-500/20 opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                            <UserCog className={member.isActive ? 'text-white' : 'text-white/20'} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{member.name}</h3>
                            <p className="text-white/40 text-xs uppercase tracking-widest">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleStaffStatus(member.id, member.isActive)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                              member.isActive 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => setStaffToDelete(member)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-red-500 flex items-center justify-center transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <MessageSquare size={16} className="text-white/20" />
                            <span className="text-sm font-medium">{member.whatsapp}</span>
                          </div>
                          <button
                            onClick={() => openStaffWhatsapp(member.whatsapp)}
                            className="text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                          >
                            Abrir Conversa
                          </button>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Área de Responsabilidade</p>
                          <p className="text-sm text-white/80">{member.responsibility}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'promotions' && (
            <motion.div
              key="promotions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6">Lançar Nova Promoção</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">Título do Alerta</p>
                      <input
                        type="text"
                        placeholder="Ex: Rodada Dupla de Gin!"
                        value={newPromoTitle}
                        onChange={(e) => setNewPromoTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">Mensagem Detalhada</p>
                      <textarea
                        placeholder="Descreva a oferta para os clientes..."
                        value={newPromoDesc}
                        onChange={(e) => setNewPromoDesc(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all h-32 resize-none"
                      />
                    </div>
                    <button
                      onClick={createPromotion}
                      className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap size={20} /> Ativar Promoção Agora
                    </button>
                  </div>
                  <div className="hidden md:flex items-center justify-center bg-white/5 rounded-[2rem] border border-white/5 p-8 text-center">
                    <div className="max-w-xs">
                      <Megaphone className="text-white/10 mx-auto mb-6" size={48} />
                      <p className="text-sm text-white/40 leading-relaxed">As promoções ativadas aqui aparecerão instantaneamente para todos os clientes conectados, com um alerta sonoro.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promotions.map((promo) => (
                  <div key={promo.id} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-40 h-40 -mr-20 -mt-20 rounded-full blur-[80px] transition-opacity ${promo.active ? 'bg-white/10 opacity-100' : 'bg-white/5 opacity-0'}`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${promo.active ? 'bg-white text-black border-white' : 'bg-white/5 text-white/20 border-white/5'}`}>
                            <Zap size={32} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold mb-1">{promo.title}</h3>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${promo.active ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${promo.active ? 'text-emerald-500' : 'text-white/20'}`}>
                                {promo.active ? 'Ativa no Momento' : 'Pausada'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePromotion(promo.id, promo.active)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
                              promo.active 
                                ? 'bg-white text-black border-white' 
                                : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                            }`}
                          >
                            <Power size={20} />
                          </button>
                          <button
                            onClick={() => setPromoToDelete(promo)}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-red-500 flex items-center justify-center transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                      <p className="text-white/40 leading-relaxed text-lg">{promo.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Relatório Diário</h2>
                    <p className="text-white/40 text-sm">Controle de faturamento por data específica.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                    <Calendar className="text-white/40 ml-3" size={20} />
                    <input
                      type="date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="bg-transparent text-white border-none focus:outline-none p-2 font-bold cursor-pointer [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Faturamento Total</p>
                    <p className="text-3xl font-bold">{formatCurrency(reportStats.totalRevenue)}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Total Pedidos</p>
                    <p className="text-3xl font-bold">{reportStats.totalOrders}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Faturamento Bar</p>
                    <p className="text-3xl font-bold text-blue-400">{formatCurrency(reportStats.barRevenue)}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Faturamento Rosh</p>
                    <p className="text-3xl font-bold text-zap-400">{formatCurrency(reportStats.roshRevenue)}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Faturamento por Camarote</h3>
                  </div>
                  <div className="p-0">
                    {reportStats.camaroteRanking.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {reportStats.camaroteRanking.map((c, i) => (
                          <div key={i} className="flex justify-between items-center p-6 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                              <span className="text-white/20 font-bold w-6">{i + 1}º</span>
                              <span className="font-bold">{c.name}</span>
                            </div>
                            <span className="font-bold">{formatCurrency(c.total)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center text-white/40 flex flex-col items-center">
                        <BarChart3 size={32} className="mb-4 opacity-20" />
                        <p>Nenhum faturamento registrado nesta data.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6">Configurações do Sistema</h2>
                <div className="max-w-md space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">WhatsApp do Bar (Bebidas)</p>
                    <input
                      type="text"
                      placeholder="Ex: 5511999999999"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                    />
                    <p className="text-[10px] text-white/30 ml-4">Inclua o código do país (55 para Brasil) e o DDD.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-4">WhatsApp do Rosh (Narguilé)</p>
                    <input
                      type="text"
                      placeholder="Ex: 5511988888888"
                      value={whatsappRosh}
                      onChange={(e) => setWhatsappRosh(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all"
                    />
                    <p className="text-[10px] text-white/30 ml-4">Número exclusivo para pedidos de Narguilé/Rosh.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-sm">Desafios entre Camarotes</p>
                      <button
                        onClick={() => setChallengesEnabled(prev => !prev)}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors p-1 ${challengesEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${challengesEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest font-bold">Quando ativo, clientes podem enviar desafios pela plataforma.</p>
                  </div>
                  
                  <button
                    onClick={saveSettings}
                    disabled={isSavingSettings}
                    className="w-full bg-white text-black h-[56px] rounded-2xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Modal for Closing Camarote */}
      <AnimatePresence>
        {closingCamarote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-night-950 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Power className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Fechar Camarote?</h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                Deseja encerrar o camarote <span className="text-white font-bold">{closingCamarote.name}</span>? 
                O cliente não poderá mais fazer pedidos.
              </p>
              
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 mb-8">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Total Consumido</p>
                <p className="text-3xl font-bold">{formatCurrency(closingCamarote.totalSpent)}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => closeCamarote(closingCamarote.id)}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-500/20"
                >
                  Confirmar Encerramento
                </button>
                <button
                  onClick={() => setClosingCamarote(null)}
                  className="w-full py-4 rounded-2xl font-bold text-white/20 hover:text-white transition-colors"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Deleting Product */}
      <AnimatePresence>
        {productToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-night-950 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Excluir Produto?</h3>
              <p className="text-white/40 text-sm mb-10 leading-relaxed">
                Deseja excluir permanentemente o produto <span className="text-white font-bold">{productToDelete.name}</span>? 
                Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => deleteProduct(productToDelete.id)}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-500/20"
                >
                  Sim, Excluir
                </button>
                <button
                  onClick={() => setProductToDelete(null)}
                  className="w-full py-4 rounded-2xl font-bold text-white/20 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Deleting Camarote */}
      <AnimatePresence>
        {camaroteToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-night-950 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Excluir Camarote?</h3>
              <p className="text-white/40 text-sm mb-10 leading-relaxed">
                Deseja excluir permanentemente o camarote <span className="text-white font-bold">{camaroteToDelete.name}</span>? 
                Todos os dados vinculados serão perdidos.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => deleteCamarote(camaroteToDelete.id)}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-500/20"
                >
                  Sim, Excluir
                </button>
                <button
                  onClick={() => setCamaroteToDelete(null)}
                  className="w-full py-4 rounded-2xl font-bold text-white/20 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Deleting Promotion */}
      <AnimatePresence>
        {promoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-night-950 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Excluir Promoção?</h3>
              <p className="text-white/40 text-sm mb-10 leading-relaxed">
                Deseja excluir permanentemente a promoção <span className="text-white font-bold">{promoToDelete.title}</span>?
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => deletePromotion(promoToDelete.id)}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-500/20"
                >
                  Sim, Excluir
                </button>
                <button
                  onClick={() => setPromoToDelete(null)}
                  className="w-full py-4 rounded-2xl font-bold text-white/20 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Deleting Staff */}
      <AnimatePresence>
        {staffToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-night-950 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Remover Funcionário?</h3>
              <p className="text-white/40 text-sm mb-10 leading-relaxed">
                Deseja remover <span className="text-white font-bold">{staffToDelete.name}</span> da equipe? 
                Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => deleteStaff(staffToDelete.id)}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-500/20"
                >
                  Sim, Remover
                </button>
                <button
                  onClick={() => setStaffToDelete(null)}
                  className="w-full py-4 rounded-2xl font-bold text-white/20 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Night Closure Confirmation Modal */}
      <AnimatePresence>
        {isNightClosureModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[110] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-night-950 w-full max-w-md rounded-[3rem] border border-red-500/20 p-12 text-center shadow-2xl shadow-red-500/10"
            >
              <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Moon className="text-red-500" size={40} />
              </div>
              <h3 className="text-3xl font-bold mb-6">Fechamento da Noite</h3>
              <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[2rem] mb-8 text-left">
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <AlertCircle size={14} /> Ação Irreversível
                </p>
                <ul className="text-white/40 text-sm space-y-3">
                  <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-red-500" /> Todos os pedidos serão apagados</li>
                  <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-red-500" /> Todos os camarotes serão removidos</li>
                  <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-red-500" /> Todos os desafios serão limpos</li>
                  <li className="flex items-center gap-3"><div className="w-1 h-1 rounded-full bg-red-500" /> O faturamento voltará a zero</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={nightClosure}
                  disabled={isResetting}
                  className="w-full bg-red-500 text-white py-5 rounded-2xl font-bold shadow-2xl shadow-red-500/30 flex items-center justify-center gap-3"
                >
                  {isResetting ? (
                    <>
                      <Moon className="animate-spin" size={20} />
                      Limpando Sistema...
                    </>
                  ) : (
                    'Confirmar Reset Geral'
                  )}
                </button>
                <button
                  onClick={() => setIsNightClosureModalOpen(false)}
                  disabled={isResetting}
                  className="w-full py-4 rounded-2xl font-bold text-white/20 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showClosureSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-night-800 w-full max-w-sm rounded-3xl border border-green-500/20 p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Sistema Resetado!</h3>
              <p className="text-gray-400 text-sm mb-8">
                Tudo pronto para o próximo dia. O faturamento foi zerado com sucesso.
              </p>
              <button
                onClick={() => setShowClosureSuccess(false)}
                className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-500/20"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
