import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShieldCheck, Sparkles } from 'lucide-react';

const EndScreen = ({ portrait }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-12">
       <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="absolute -inset-10 bg-white/5 blur-[100px] rounded-full animate-pulse"></div>
        
        {/* Memory Purge Visualizer */}
        <div className="relative w-48 h-48 rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
            {portrait && (
                <motion.img 
                    src={portrait}
                    animate={{ 
                        opacity: [1, 0],
                        scale: [1, 1.2],
                        filter: ["grayscale(1) brightness(1)", "grayscale(1) brightness(3) blur(20px)"]
                    }}
                    transition={{ duration: 4, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="relative z-10"
            >
                <Trash2 size={48} className="text-white/40" />
            </motion.div>

           <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 3, type: "spring" }}
            className="absolute -top-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-black"
           >
             <ShieldCheck size={20} className="text-black" />
           </motion.div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase">
            Session Purged
        </h2>
        <div className="flex flex-col items-center gap-2">
            <p className="text-white/50 text-sm font-medium">Session Deleted Successfully</p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                <Sparkles size={12} /> Volatile data cleared
            </div>
        </div>
      </div>

      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2.5, ease: "linear" }}
        className="h-1 w-48 bg-white/20 rounded-full relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white shadow-[0_0_15px_white]" />
      </motion.div>

      <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.3em]">
        Restarting Environment...
      </p>
    </div>
  );
};

export default EndScreen;
