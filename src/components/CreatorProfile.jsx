import React from 'react';
import { motion } from 'framer-motion';
import { X, Linkedin, Github, Globe, Award, MapPin, School } from 'lucide-react';

export default function CreatorProfile({ onClose }) {
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
        className="glass-panel w-full max-w-lg rounded-[40px] overflow-hidden"
      >
        <div className="relative h-32 bg-gradient-to-r from-purple-600 to-blue-600">
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 text-white">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-12 -mt-16 relative">
          <div className="w-32 h-32 rounded-[2rem] bg-zinc-900 border-4 border-black overflow-hidden mb-6 shadow-2xl group flex items-center justify-center">
             <div className="text-4xl font-bold bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">AB</div>
          </div>

          <h2 className="text-3xl font-bold mb-1 tracking-tight">SARVEPALLI AUDI SIVA BHANUVARDHAN</h2>
          <p className="text-purple-400 font-medium mb-6">Product Designer & Full-stack Architect</p>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <School size={16} className="shrink-0" />
              <span>DHANALAKSHMI SRINIVASAN UNIVERSITY, TRICHY</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <MapPin size={16} className="shrink-0" />
              <span>Tamil Nadu, India</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <Award size={16} className="shrink-0" />
              <span>Founder of AS PHENIX</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <a 
              href="https://www.linkedin.com/in/audi-siva-bhanuvardhan-sarvepalli-4598a8289/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-button py-4 rounded-2xl flex items-center justify-center text-blue-400"
            >
              <Linkedin size={24} />
            </a>
            <a 
              href="https://github.com/Sarvepalliaudi/Sarvepalliaudi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-button py-4 rounded-2xl flex items-center justify-center text-white"
            >
              <Github size={24} />
            </a>
            <a 
              href="https://sarvepalliaudi.github.io/asphenixnewprotofolio/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-button py-4 rounded-2xl flex items-center justify-center text-purple-400"
            >
              <Globe size={24} />
            </a>
          </div>
        </div>

        <div className="px-8 py-6 bg-white/5 border-t border-white/5 text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Innovation Beyond Limits</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
