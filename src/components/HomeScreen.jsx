import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Heart, ShieldCheck } from 'lucide-react';

const HomeScreen = ({ onStart, onAbout }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-12">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full"></div>
        <div className="relative bg-white/10 backdrop-blur-2xl p-8 rounded-[40px] border border-white/20 shadow-2xl">
          <BrainCircuit size={80} className="text-white brightness-150 animate-pulse" />
        </div>
      </motion.div>

      <div className="space-y-4">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic"
        >
          HAPPY<span className="text-white/40">PERSONA</span>
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm font-mono tracking-widest text-white/50 uppercase"
        >
          by AS PHENIX
        </motion.p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col space-y-6 w-full"
      >
        <button 
          onClick={onStart}
          className="group relative w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative z-10 flex items-center justify-center gap-2">
            Start Session <Sparkles size={18} />
          </span>
        </button>

        <button 
          onClick={onAbout}
          className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-medium text-white/60 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
           Innovator Profile
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex items-center gap-4 text-xs font-mono text-white/40"
      >
        <div className="flex items-center gap-1"><ShieldCheck size={14} /> Privacy First</div>
        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
        <div className="flex items-center gap-1"><Heart size={14} /> Emotionally Safe</div>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
