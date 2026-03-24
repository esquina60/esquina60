import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, User, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Layout } from '../components/Layout';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout showNav={false}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-16 animate-in fade-in zoom-in duration-700">
          <Logo className="scale-150 mb-12" />
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tighter">
            EXPERIÊNCIA <span className="text-white/40">PREMIUM</span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
            Gestão inteligente para o melhor bar da região. Sofisticação e agilidade na palma da sua mão.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
          <button
            onClick={() => navigate('/admin')}
            className="glass p-8 rounded-2xl text-left group transition-all hover:bg-white/10"
          >
            <div className="flex justify-between items-start mb-6">
              <ShieldCheck className="w-10 h-10 text-white" />
              <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Administração</h3>
            <p className="text-sm text-gray-400">Controle total de camarotes, faturamento e produtos.</p>
          </button>

          <button
            onClick={() => navigate('/bar')}
            className="glass p-8 rounded-2xl text-left group transition-all hover:bg-white/10"
          >
            <div className="flex justify-between items-start mb-6">
              <LayoutDashboard className="w-10 h-10 text-white" />
              <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Painel do Bar</h3>
            <p className="text-sm text-gray-400">Gestão ágil de pedidos e estoque em tempo real.</p>
          </button>

          <div className="glass p-8 rounded-2xl md:col-span-2 text-left relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white rounded-xl">
                  <User className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white">Área do Cliente</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-xl">
                O acesso é exclusivo via QR Code ou link direto do camarote. 
                Garanta a melhor experiência para seus convidados.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-xs font-mono text-white/60">
                ais-bar.app/camarote/[nome]
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </Layout>
  );
};
