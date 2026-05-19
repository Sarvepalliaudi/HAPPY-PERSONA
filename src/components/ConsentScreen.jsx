import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Trash2, EyeOff, Lock } from 'lucide-react';

const ConsentScreen = ({ onAccept, onDecline }) => {
  const points = [
    { icon: <Trash2 size={20} />, title: "No Data Storage", desc: "Biometric and voice data processed solely in memory." },
    { icon: <Lock size={20} />, title: "Encrypted Session", desc: "Your session is volatile and ends when you close the app." },
    { icon: <EyeOff size={20} />, title: "Private Analysis", desc: "AI persona generation happens on secure production servers." },
  ];

  return (
    <div className="flex flex-col space-y-8 max-w-sm">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="text-orange-500" />
          Trust Disclosure
        </h2>
        <p className="text-white/60 text-sm leading-relaxed">
          HAPPYPERSONA is designed for absolute privacy. Before we analyze your face and voice, please confirm your understanding of our session-only policy.
        </p>
      </div>

      <div className="space-y-4">
        {points.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 * i }}
            className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="text-orange-400">{p.icon}</div>
            <div>
              <h4 className="text-sm font-bold">{p.title}</h4>
              <p className="text-xs text-white/40">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <button 
          onClick={onAccept}
          className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95"
        >
          Confirm & Begin
        </button>
        <button 
          onClick={onDecline}
          className="text-white/40 text-xs hover:text-white transition-colors"
        >
          I'm not ready yet. Take me back.
        </button>
      </div>

      <p className="text-[10px] text-center text-white/30 font-mono tracking-tighter">
        BY CONTINUING, YOU AGREE TO VOLATILE PROCESSING OF YOUR CAMERA FEED AND AUDIO.
      </p>
    </div>
  );
};

export default ConsentScreen;
