import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';

export default function ConsentPhase({ onAccept, onDecline }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl">
        <div className="bg-purple-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
          <Shield size={32} className="text-purple-400" />
        </div>

        <h2 className="text-3xl font-bold mb-4">Privacy Consent</h2>
        
        <div className="space-y-4 text-zinc-400 text-sm mb-8 leading-relaxed">
          <p>Before we begin, please acknowledge our session-only policy:</p>
          
          <ul className="space-y-3">
            {[
              "Real-time face & voice analysis happens locally.",
              "Biometric data is NEVER stored on any server.",
              "Conversations are processed in session-only memory.",
              "All persona data is deleted immediately upon exit."
            ].map((text, i) => (
              <li key={i} className="flex gap-3">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-200/80 text-xs italic">
            "This session disappears completely after ending."
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onAccept}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors"
          >
            I AGREE & START
          </button>
          <button 
            onClick={onDecline}
            className="w-full py-3 text-zinc-500 hover:text-white transition-colors text-sm"
          >
            DECLINE
          </button>
        </div>
      </div>
    </motion.div>
  );
}
