import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Camarote } from '../types';
import { Trophy, Crown, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Ranking: React.FC = () => {
  const [ranking, setRanking] = useState<Camarote[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchRanking = async () => {
      const { data } = await supabase.from('camarotes').select('*').eq('isActive', true).order('totalSpent', { ascending: false }).limit(3);
      if (isMounted && data) {
        setRanking(data as Camarote[]);
      }
    };

    fetchRanking();

    const channel = supabase.channel('ranking_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'camarotes' }, () => {
      if (isMounted) fetchRanking();
    }).subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (ranking.length === 0) return null;

  return (
    <div className="glass-dark border-b border-white/5 p-4 sticky top-0 z-50">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-white/40" />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Ranking de Consumo</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {ranking.map((camarote, index) => (
            <motion.div
              key={camarote.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-shrink-0 min-w-[160px] glass p-3 rounded-xl flex items-center gap-3 relative overflow-hidden"
            >
              <div className="flex-shrink-0 z-10">
                {index === 0 && <Crown className="w-6 h-6 text-white" />}
                {index === 1 && <Medal className="w-6 h-6 text-white/60" />}
                {index === 2 && <Medal className="w-6 h-6 text-white/30" />}
              </div>
              <div className="min-w-0 z-10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5 truncate">{camarote.name}</p>
                <p className="text-lg font-display font-bold text-white leading-none">
                  R$ {Math.floor(camarote.totalSpent)}
                </p>
              </div>
              {index === 0 && (
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
