import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      loginEmail = 'allan@quintaldoallan.com';
    } else if (loginEmail.toLowerCase() === 'esquinabar') {
      loginEmail = 'allanbar@quintaldoallan.com';
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
        </div>
      </div>
    </div>
  );
};
