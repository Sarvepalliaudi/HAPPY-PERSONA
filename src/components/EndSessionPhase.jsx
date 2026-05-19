import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

export default function EndSessionPhase({ onFinish }) {
  const [cleaning, setCleaning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCleaning(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
    >
      <div className="glass-panel p-12 rounded-[40px] max-w-sm w-full">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          {cleaning ? (
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"
            />
          ) : (
            <CheckCircle2 size={40} className="text-emerald-400" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold mb-4">
          {cleaning ? "Cleaning Session Data..." : "Session Deleted Successfully"}
        </h2>
        
        <p className="text-zinc-500 text-sm mb-12 leading-relaxed">
          {cleaning 
            ? "Your temporary Happy Persona and all biometric cues are being purged from memory." 
            : "Everything has been wiped. Your privacy remains intact. We hope you feel better."}
        </p>

        {!cleaning && (
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={onFinish}
            className="w-full py-4 glass-button rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-white hover:text-black transition-all"
          >
            <LogOut size={20} />
            RETURN TO HOME
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
