import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Order, OperationType } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

export const UpdateOrderStatus: React.FC = () => {
  const { orderId, status } = useParams<{ orderId: string, status: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateStatus = async () => {
      if (!orderId || !status) return;
      
      try {
        const { data: orderData, error: snapErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        
        if (snapErr || !orderData) {
          setError('Pedido não encontrado.');
          setLoading(false);
          return;
        }
        
        // Update order status
        await supabase.from('orders').update({ status }).eq('id', orderId);

        // If status is 'done', update camarote total
        if (status === 'done' && orderData.status !== 'done') {
          const { data: camaroteData } = await supabase
            .from('camarotes')
            .select('totalSpent')
            .eq('id', orderData.camaroteId)
            .single();

          if (camaroteData) {
            await supabase.from('camarotes').update({
              totalSpent: Number(camaroteData.totalSpent) + Number(orderData.total)
            }).eq('id', orderData.camaroteId);
          }
        }

        setSuccess(true);
      } catch (err) {
        console.error('Error updating order status:', err);
        setError('Erro ao atualizar o status do pedido.');
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      } finally {
        setLoading(false);
      }
    };

    updateStatus();
  }, [orderId, status]);

  return (
    <div className="min-h-[100dvh] bg-night-950 flex flex-col items-center justify-center p-6 text-center">
      <Logo className="scale-125 mb-12" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-[2.5rem] w-full max-w-sm border border-white/10"
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-white/20 animate-spin mb-6" />
            <h2 className="text-xl font-display font-bold text-white">Atualizando Pedido...</h2>
            <p className="text-white/40 text-sm mt-2">Aguarde um momento.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">Ops! Algo deu errado</h2>
            <p className="text-white/40 text-sm mt-2 mb-8">{error}</p>
            <button
              onClick={() => navigate('/bar')}
              className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              Voltar ao Painel
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">Status Atualizado!</h2>
            <p className="text-white/40 text-sm mt-2 mb-8">
              O pedido foi marcado como <span className="text-white font-bold uppercase tracking-widest">{status === 'preparing' ? 'Em Preparo' : 'Finalizado'}</span>.
            </p>
            <button
              onClick={() => navigate('/bar')}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-white/90 transition-all"
            >
              Ir para o Painel
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
