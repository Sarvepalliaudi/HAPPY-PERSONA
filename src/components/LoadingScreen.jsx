import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Cpu, Fingerprint } from 'lucide-react';

const LoadingScreen = ({ portrait }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    { title: "Aligning Neural Pathways", icon: <Cpu /> },
    { title: "Synthesizing Emotional Vibe", icon: <Sparkles /> },
    { title: "Calibrating Vocal Texture", icon: <Zap /> },
    { title: "Identity Encryption Completed", icon: <Fingerprint /> },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <div className="relative group">
        {/* Cinematic Loading Orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-48 h-48 rounded-[3rem] border border-white/20 flex items-center justify-center relative overflow-hidden bg-white/5 backdrop-blur-xl"
        >
          {portrait ? (
             <motion.img 
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: stepIndex / 4, scale: 1 }}
                src={portrait} 
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
             />
          ) : (
            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_40px_white,0_0_80px_white]" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        </motion.div>
        
        {/* Orbiting particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[-20px] pointer-events-none"
          >
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full absolute top-0 left-1/2 -translate-x-1/2 blur-[1px]" />
          </motion.div>
        ))}
      </div>

      <div className="space-y-6 text-center w-full max-w-[280px]">
        <h2 className="text-xl font-bold uppercase italic tracking-tighter animate-pulse">
            Generating Persona
        </h2>
        
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 justify-center text-white/50 text-xs font-mono uppercase tracking-[0.2em]"
            >
              <span className="text-white/20">{steps[stepIndex].icon}</span>
              {steps[stepIndex].title}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1 justify-center">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-0.5 w-8 rounded-full transition-all duration-500 ${i <= stepIndex ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-white/20 font-mono italic">
        "Creating a safe space for your digital self..."
      </div>
    </div>
  );
};

export default LoadingScreen;
