import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Info, User } from 'lucide-react';

export default function WelcomePhase({ onStart, onShowManual, onShowProfile }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-screen p-6 text-center"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 relative"
      >
        <div className="absolute -inset-4 bg-purple-500/20 blur-2xl rounded-full" />
        <Sparkles size={64} className="text-purple-400 relative" />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-5xl md:text-7xl font-bold tracking-tighter mb-4"
      >
        HAPPYPERSONA
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-purple-200/60 font-mono tracking-widest text-sm mb-12 uppercase"
      >
        By AS PHENIX
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <button 
          onClick={onStart}
          className="glass-button py-4 px-8 rounded-full flex items-center justify-center gap-2 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Play size={20} className="fill-white" />
          <span className="font-semibold tracking-wide">START SESSION</span>
        </button>

        <div className="flex gap-4">
          <button 
            onClick={onShowManual}
            className="glass-button flex-1 py-3 rounded-full flex items-center justify-center gap-2 text-sm"
          >
            <Info size={16} />
            MANUAL
          </button>
          <button 
            onClick={onShowProfile}
            className="glass-button flex-1 py-3 rounded-full flex items-center justify-center gap-2 text-sm"
          >
            <User size={16} />
            ABOUT
          </button>
        </div>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-zinc-500 text-xs max-w-xs"
      >
        Session-only AI emotional intelligence. <br/>
        No data storage. Privacy by design.
      </motion.p>
    </motion.div>
  );
}
