import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Github, Globe, ArrowLeft, Cpu } from 'lucide-react';

const AboutScreen = ({ onBack }) => {
  return (
    <div className="flex flex-col space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back Home
      </button>

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu size={120} />
        </div>
        
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-white/40">Innovator & Developer</h2>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase whitespace-pre-line leading-none">
              SARVEPALLI AUDI<br/>SIVA BHANUVARDHAN
            </h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Institution</h4>
              <p className="text-lg font-medium">DHANALAKSHMI SRINIVASAN UNIVERSITY</p>
              <p className="text-sm text-white/40 font-mono uppercase tracking-wider">TRICHY – 621112 | India</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">Vision</h4>
              <p className="text-sm text-white/70 italic leading-relaxed max-w-md">
                "Humanizing digital interaction through emotional intelligence and privacy-first AI architecture."
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SocialLink 
              href="https://www.linkedin.com/in/audi-siva-bhanuvardhan-sarvepalli-4598a8289/" 
              icon={<Linkedin size={20} />} 
              label="LinkedIn" 
            />
            <SocialLink 
              href="https://github.com/Sarvepalliaudi/Sarvepalliaudi" 
              icon={<Github size={20} />} 
              label="GitHub" 
            />
            <SocialLink 
              href="https://sarvepalliaudi.github.io/asphenixnewprotofolio/" 
              icon={<Globe size={20} />} 
              label="Portfolio" 
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">
          Project: HAPPYPERSONA Version 1.0.0-PROD
        </p>
      </div>
    </div>
  );
};

const SocialLink = ({ href, icon, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 p-4 rounded-2xl transition-all duration-300 group"
  >
    {icon}
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
  </a>
);

export default AboutScreen;
