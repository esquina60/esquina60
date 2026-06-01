import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, ArrowLeft, Zap } from 'lucide-react';
import { Logo } from '../components/Logo';

// ⚠️ MODO DE TESTE: Remover antes de subir para produção final
const IS_DEV_MODE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ⚠️ APENAS PARA TESTE LOCAL - Remover antes de produção
  const loginAsTester = async (userEmail: string, destination: string) => {
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: 'teste123@Esquina60',
      });
      if (authError || !data.user) {
        setError(`Não foi possível fazer login de teste. Verifique se a senha padrão de teste foi configurada para ${userEmail}.`);
        setLoading(false);
        return;
      }
      navigate(destination);
    } catch (err) {
      setError('Erro ao tentar login de teste.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      // Note: Redirect happens automatically for OAuth
    } catch (err: any) {
      setError('Falha na autenticação com Google.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let loginEmail = email.trim();
    if (loginEmail.toLowerCase() === 'esquinaadm') {
      loginEmail = 'esquinaadm@esquina60.com';
    } else if (loginEmail.toLowerCase() === 'esquinabar') {
      loginEmail = 'esquinabar@esquina60.com';
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (authError || !data.user) {
        setError('E-mail ou senha incorretos.');
        setLoading(false);
        return;
      }

      const { data: userDoc } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userDoc) {
        const role = userDoc.role;
        const from = new URLSearchParams(window.location.search).get('from');
        navigate(from || (role === 'admin' ? '/admin' : '/bar'));
      } else {
        setError('Usuário não autorizado.');
      }
    } catch (err) {
      setError('E-mail ou senha incorretos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-night-950 flex flex-col items-center justify-center p-6">
      <button 
        onClick={() => navigate('/')}
        className="mb-12 flex items-center gap-2 text-white/40 hover:text-white transition-colors self-start max-w-md mx-auto w-full"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Voltar</span>
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex flex-col items-center mb-12">
          <Logo className="scale-125 mb-8" />
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">ACESSO RESTRITO</h1>
          <p className="text-white/40 text-sm mt-2 uppercase tracking-widest font-medium">Painel de Gestão</p>
        </div>

        <div className="glass p-8 rounded-3xl shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6 mb-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Usuário</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                placeholder="Ex: esquinaadm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-night-900 px-4 text-white/20">Ou acesse com</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full py-4 flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
            <span>GOOGLE</span>
          </button>

          {/* ⚠️ BOTÕES DE TESTE - Apenas em localhost, remover antes de produção */}
          {IS_DEV_MODE && (
            <div className="mt-8 pt-6 border-t border-amber-500/20">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80 mb-4 flex items-center justify-center gap-2">
                <Zap size={12} />
                Acesso Rápido de Teste (Somente Local)
                <Zap size={12} />
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => loginAsTester('esquinaadm@esquina60.com', '/admin')}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  Entrar como ADMIN
                </button>
                <button
                  onClick={() => loginAsTester('esquinabar@esquina60.com', '/bar')}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  Entrar como BAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
