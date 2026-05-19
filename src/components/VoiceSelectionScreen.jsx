import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Volume1, Volume } from 'lucide-react';

const VoiceSelectionScreen = ({ onSelect }) => {
  const voices = [
    { id: 'deep', label: 'Deep', icon: <Volume2 size={24} />, desc: 'Resonant and commanding' },
    { id: 'soft', label: 'Soft', icon: <Volume1 size={24} />, desc: 'Gentle and soothing' },
    { id: 'neutral', label: 'Neutral', icon: <Volume size={24} />, desc: 'Balanced and natural' },
  ];

  return (
    <div className="flex flex-col items-center space-y-12 w-full max-w-md">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase">Vocal Identity</h2>
        <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Select your persona's acoustic texture</p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full">
        {voices.map((v, i) => (
          <motion.button
            key={v.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(v.id)}
            className="group relative flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all text-left"
          >
            <div className="p-4 rounded-2xl bg-white/10 group-hover:bg-black/10 transition-colors">
              {v.icon}
            </div>
            <div>
              <h4 className="text-lg font-bold uppercase tracking-tight">{v.label}</h4>
              <p className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">{v.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-[10px] text-white/20 font-mono italic">
        "Your persona's voice will reflect this selection throughout the session."
      </p>
    </div>
  );
};

export default VoiceSelectionScreen;
