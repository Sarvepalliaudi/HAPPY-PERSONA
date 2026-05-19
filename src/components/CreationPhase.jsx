import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Cpu, Database } from 'lucide-react';

export default function CreationPhase({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const steps = [
    { icon: <Brain size={24} />, text: "Analyzing Neural Patterns" },
    { icon: <Database size={24} />, text: "Synthesizing Emotional Cues" },
    { icon: <Cpu size={24} />, text: "Initializing Happy Persona" },
    { icon: <Sparkles size={24} />, text: "Opening Session Bridge" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
    >
      <div className="relative mb-16">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-32 h-32 border-4 border-t-purple-500 border-r-blue-500 border-b-emerald-500 border-l-transparent rounded-full shadow-[0_0_50px_rgba(139,92,246,0.3)]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={40} className="text-white animate-pulse" />
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-12 tracking-tighter uppercase italic">Persona Creation In Progress</h2>

      <div className="space-y-6 w-full max-w-xs">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 1 }}
            className="flex items-center gap-4 p-4 glass-panel rounded-2xl border border-white/5"
          >
            <div className="text-purple-400">{step.icon}</div>
            <span className="text-sm font-medium tracking-wide text-zinc-400">{step.text}</span>
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="ml-auto w-2 h-2 bg-emerald-400 rounded-full"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
