/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ClientView } from './pages/ClientView';
import { BarPanel } from './pages/BarPanel';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { UpdateOrderStatus } from './pages/UpdateOrderStatus';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-[100dvh] bg-night-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass p-8 rounded-3xl border border-red-500/20 max-w-md">
          <h2 className="text-2xl font-display font-bold text-red-500 mb-4">Configuração Incompleta</h2>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            As chaves do Supabase não foram encontradas. <br />
            Certifique-se de configurar as variáveis de ambiente na Vercel.
          </p>
          <div className="bg-white/5 p-4 rounded-xl text-left text-[10px] font-mono text-white/40 mb-6">
            Pendente: VITE_SUPABASE_URL<br />
            Pendente: VITE_SUPABASE_ANON_KEY
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary w-full py-3"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        handleUserResult(null);
      } else {
        handleUserResult(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserResult(session?.user);
    });

    async function handleUserResult(u: any) {
      try {
        if (u) {
          setUser(u);
          
          const { data: userDoc } = await supabase
            .from('users')
            .select('role')
            .eq('id', u.id)
            .single();

          if (userDoc) {
            setRole(userDoc.role);
          } else {
            setRole('bar'); // Default role if not found in table
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Auth state error:', error);
      } finally {
        setLoading(false);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  // Initial data seeding is now handled via stand-alone script: npm run seed

  if (loading) return <div className="min-h-[100dvh] bg-night-900 flex items-center justify-center text-gold font-display font-bold">CARREGANDO...</div>;

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Client Route */}
          <Route path="/camarote/:slug" element={<ClientView />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/update-order/:orderId/:status" element={user ? <UpdateOrderStatus /> : <Navigate to="/login" />} />
          <Route path="/bar" element={user && (role === 'admin' || role === 'bar') ? <BarPanel /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

