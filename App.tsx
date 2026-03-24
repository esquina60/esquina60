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
import { supabase } from './supabase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          
          if (u.email === 'lcstransportes.lucas@gmail.com') {
            setRole('admin');
          }

          const { data: userDoc } = await supabase
            .from('users')
            .select('role')
            .eq('id', u.id)
            .single();

          if (userDoc) {
            setRole(userDoc.role);
          } else if (u.email !== 'lcstransportes.lucas@gmail.com') {
            setRole('bar');
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Auth state error:', error);
        if (u && u.email === 'lcstransportes.lucas@gmail.com') {
          setRole('admin');
        }
      } finally {
        setLoading(false);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  // Seed initial products if none exist (Only for master admin)
  useEffect(() => {
    const seedProducts = async () => {
      if (!user || user.email !== 'lcstransportes.lucas@gmail.com') return;
      
      try {
        const { data: snapshot, error: prodErr } = await supabase.from('products').select('id').limit(1);
        if (!prodErr && (!snapshot || snapshot.length === 0)) {
          const initialProducts = [
            // COMBOS DE WHISKY
            { name: "JACK DANIEL'S", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "BLACK LABEL", description: "4 GELO DE SABOR + 4 RED BULL", price: 350.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "GOLD LABEL", description: "4 GELO DE SABOR + 4 RED BULL", price: 450.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "BUCHANAN'S", description: "4 GELO DE SABOR + 4 RED BULL", price: 350.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "JACK GENTLEMAN", description: "4 GELO DE SABOR + 4 RED BULL", price: 350.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "JACK MAÇA VERDE", description: "4 GELO DE SABOR + 4 RED BULL", price: 320.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "OLD PAR", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "BALLANTINES 12 ANOS", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "CHIVAS 12 ANOS", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "WHITE HORSE", description: "4 GELO DE SABOR + 4 RED BULL", price: 200.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "RED LABEL", description: "4 GELO DE SABOR + 4 RED BULL", price: 200.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },
            { name: "BALLANTINES 8 ANOS", description: "4 GELO DE SABOR + 4 RED BULL", price: 200.0, category: "combos de whisky", isAvailable: true, imageUrl: "" },

            // DOSES DE WHISKY
            { name: "JACK DANIEL'S", description: "", price: 45.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "BLACK LABEL", description: "", price: 50.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "BUCHANAN'S", description: "", price: 50.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "JACK MAÇA VERDE", description: "", price: 50.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "RED LABEL", description: "", price: 40.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "BALLANTINES 8 ANOS", description: "", price: 40.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "OLD PAR", description: "", price: 45.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "BALLANTINES 12 ANOS", description: "", price: 45.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "CHIVAS 12 ANOS", description: "", price: 45.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },
            { name: "WHITE HORSE", description: "", price: 35.0, category: "doses de whisky", isAvailable: true, imageUrl: "" },

            // COMBOS DE GIN
            { name: "TANQUERAY", description: "4 GELO DE SABOR + 4 RED BULL", price: 280.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
            { name: "TANQUERAY ROYALE", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
            { name: "BOMBAY", description: "4 GELO DE SABOR + 4 RED BULL", price: 260.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
            { name: "BEEFEATER", description: "4 GELO DE SABOR + 4 RED BULL", price: 280.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
            { name: "BEEFEATER PINK", description: "4 GELO DE SABOR + 4 RED BULL", price: 300.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
            { name: "ROCKS C/ RED BULL", description: "4 GELO DE SABOR + 4 RED BULL", price: 150.0, category: "combos de gin", isAvailable: true, imageUrl: "" },
            { name: "ROCKS", description: "4 GELO DE SABOR + ENERGÉTICO 2L", price: 120.0, category: "combos de gin", isAvailable: true, imageUrl: "" },

            // DOSES DE GIN
            { name: "TANQUERAY", description: "", price: 40.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
            { name: "TANQUERAY ROYALE", description: "", price: 45.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
            { name: "BOMBAY", description: "", price: 40.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
            { name: "BEEFEATER", description: "", price: 40.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
            { name: "BEEFEATER PINK", description: "", price: 45.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
            { name: "ROCKS C/ RED BULL", description: "", price: 30.0, category: "doses de gin", isAvailable: true, imageUrl: "" },
            { name: "ROCKS", description: "", price: 25.0, category: "doses de gin", isAvailable: true, imageUrl: "" },

            // COMBOS DE VODKA
            { name: "CIROC", description: "4 GELO DE SABOR + 4 RED BULL", price: 350.0, category: "combos de vodka", isAvailable: true, imageUrl: "" },
            { name: "GREY GOOSE", description: "4 GELO DE SABOR + 4 RED BULL", price: 320.0, category: "combos de vodka", isAvailable: true, imageUrl: "" },
            { name: "ABSOLUT", description: "4 GELO DE SABOR + 4 RED BULL", price: 250.0, category: "combos de vodka", isAvailable: true, imageUrl: "" },
            
            // DOSES DE VODKA
            { name: "CIROC", description: "", price: 50.0, category: "doses de vodka", isAvailable: true, imageUrl: "" },
            { name: "GREY GOOSE", description: "", price: 45.0, category: "doses de vodka", isAvailable: true, imageUrl: "" },
            { name: "ABSOLUT", description: "", price: 40.0, category: "doses de vodka", isAvailable: true, imageUrl: "" },

            // CERVEJAS 600ML
            { name: "HEINEKEN", description: "", price: 16.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
            { name: "BECKS", description: "", price: 13.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
            { name: "BUDWEISER", description: "", price: 11.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
            { name: "ORIGINAL", description: "", price: 14.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
            { name: "SPATEN", description: "", price: 12.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
            { name: "STELLA ARTOIS", description: "", price: 12.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
            { name: "SKOL", description: "", price: 10.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },
            { name: "IMPÉRIO", description: "", price: 9.0, category: "cervejas 600ml", isAvailable: true, imageUrl: "" },

            // CERVEJAS LONG NECK
            { name: "HEINEKEN", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
            { name: "BECKS", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
            { name: "BUDWEISER", description: "", price: 11.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
            { name: "SPATEN", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
            { name: "STELLA ARTOIS", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" },
            { name: "CORONA", description: "", price: 12.0, category: "cervejas long neck", isAvailable: true, imageUrl: "" }
          ];
          await supabase.from('products').insert(initialProducts);
          console.log('Produtos iniciais semeados com sucesso.');
        }

        const { data: promoSnapshot, error: promoErr } = await supabase.from('promotions').select('id').limit(1);
        if (!promoErr && (!promoSnapshot || promoSnapshot.length === 0)) {
          await supabase.from('promotions').insert({
            title: 'QUARTA + JOGO + CHURRASCO',
            description: 'Promoções válidas a noite toda! Aproveite nossos combos e baldes.',
            active: true
          });
          console.log('Promoção inicial semeada com sucesso.');
        }
      } catch (error) {
        console.error('Erro ao semear produtos:', error);
      }
    };
    seedProducts();
  }, [user]);

  if (loading) return <div className="min-h-[100dvh] bg-night-900 flex items-center justify-center text-gold font-display font-bold">CARREGANDO...</div>;

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Client Route */}
          <Route path="/camarote/:slug" element={<ClientView />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes (Bypassed Login) */}
          <Route path="/update-order/:orderId/:status" element={<UpdateOrderStatus />} />
          <Route path="/bar" element={<BarPanel />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

