import React from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Mic, Shield, HelpCircle, AlertCircle, Info } from 'lucide-react';

export default function UserManual({ onClose }) {
  const sections = [
    {
      title: "Welcome",
      icon: <Info size={18} />,
      content: "HappyPersona is an emotional AI companion designed for mental well-being. It creates a temporary AI persona based on your current emotional state."
    },
    {
      title: "How To Start",
      icon: <HelpCircle size={18} />,
      content: "Ensure you are in a quiet, well-lit room. Grant camera and microphone permissions when prompted."
    },
    {
      title: "Face Scan Guide",
      icon: <Camera size={18} />,
      content: "Keep your face centered. Only one face should be visible. Avoid sudden movements during the 20-second analysis."
    },
    {
      title: "AI Session",
      icon: <Mic size={18} />,
      content: "Speak naturally. The AI uses Gemini Pro to understand your emotions and adapts its persona and background accordingly."
    },
    {
      title: "Privacy",
      icon: <Shield size={18} />,
      content: "We use memory-only processing. No biometric data or conversation history is ever stored or transmitted permanently."
    },
    {
      title: "Troubleshooting",
      icon: <AlertCircle size={18} />,
      content: "If detection fails, check your lighting. If the voice is robotic, ensure your internet connection is stable."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-panel w-full max-w-2xl max-h-[80vh] rounded-[40px] flex flex-col overflow-hidden"
      >
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">User Manual</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-400">
                {section.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{section.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-zinc-900/50 text-center text-xs text-zinc-500 tracking-widest uppercase">
          Version 1.0.0 — ASPHENIX
        </div>
      </motion.div>
    </motion.div>
  );
}
