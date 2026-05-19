import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, LogOut, MessageSquare, Sparkles, Volume2, Globe } from 'lucide-react';

import { chatWithAI } from '../services/aiService.js';

export default function LiveSessionPhase({ sessionData, onEnd, onIntentChange }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [subtitles, setSubtitles] = useState("Hello, I am your Happy Persona. How can I help you find tranquility today?");
  const [chatHistory, setChatHistory] = useState([]);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech APIs
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processUserMessage(text);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Welcoming speech
    speak(subtitles);
  }, []);

  const speak = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => setIsResponding(true);
      utterance.onend = () => setIsResponding(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const processUserMessage = async (message) => {
    setIsResponding(true);
    setSubtitles("Analyzing...");

    try {
      const data = await chatWithAI(message, chatHistory);
      
      if (data.text) {
        setSubtitles(data.text);
        setChatHistory(prev => [...prev, 
          { role: 'user', parts: [{ text: message }] },
          { role: 'model', parts: [{ text: data.text }] }
        ]);

        // Simple intent extraction for background change
        detectIntent(data.text);
        speak(data.text);
      }
    } catch (err) {
      console.error(err);
      setSubtitles("I'm sorry, I'm having trouble connecting to my neural core.");
      speak("I am sorry, I am having trouble connecting to my neural core.");
      setIsResponding(false);
    }
  };

  const detectIntent = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("peace") || lower.includes("forest") || lower.includes("calm")) onIntentChange('calm');
    else if (lower.includes("superbot") || lower.includes("code") || lower.includes("technical")) onIntentChange('technical');
    else if (lower.includes("future") || lower.includes("universe") || lower.includes("galaxy")) onIntentChange('spiritual');
    else if (lower.includes("happy") || lower.includes("fun") || lower.includes("joke")) onIntentChange('funny');
    else if (lower.includes("love") || lower.includes("romantic")) onIntentChange('romantic');
    else if (lower.includes("energy") || lower.includes("power") || lower.includes("motivation")) onIntentChange('motivation');
    else if (lower.includes("sad") || lower.includes("rain") || lower.includes("sorry")) onIntentChange('sad');
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center h-screen relative p-8"
    >
      {/* Session Top Bar */}
      <div className="w-full flex justify-between items-center z-10">
         <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border-white/5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-emerald-400">SESSION ACTIVE</span>
         </div>
         <button onClick={onEnd} className="flex items-center gap-2 glass-button px-4 py-2 rounded-full text-xs text-red-400 border-red-400/20">
            <LogOut size={14} />
            END SESSION
         </button>
      </div>

      {/* Avatar Section */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-12">
        <AIAvatar responding={isResponding} />
      </div>

      {/* Subtitles Overlay */}
      <div className="w-full max-w-2xl text-center mb-24 px-6 min-h-[80px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={subtitles}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-xl md:text-2xl font-medium leading-relaxed drop-shadow-lg"
          >
            {subtitles}
          </motion.p>
        </AnimatePresence>
        {isListening && (
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: [0, 1, 1, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="text-xs text-purple-400/60 mt-4 uppercase tracking-[0.3em]"
           >
             Listening for your voice...
           </motion.p>
        )}
      </div>

      {/* Interaction Controls */}
      <div className="absolute bottom-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-1">
           {isResponding && (
             <div className="flex items-end gap-1 h-8 px-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12 + Math.random() * 20, 4] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-1 bg-purple-500 rounded-full"
                  />
                ))}
             </div>
           )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMic}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'bg-white text-black shadow-2xl'}`}
        >
          {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          {isListening && (
            <div className="absolute inset-0 rounded-full animate-pulse-ring" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

function AIAvatar({ responding }) {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Background Glow */}
      <motion.div 
        animate={{ 
          scale: responding ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: responding ? [0.4, 0.6, 0.4] : [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-full h-full bg-purple-500 rounded-full blur-[80px]"
      />

      {/* Procedural Avatar Shape */}
      <svg width="240" height="240" viewBox="0 0 240 240" className="persona-glow">
        <defs>
          <radialGradient id="avatarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Head Shape */}
        <motion.ellipse
          cx="120" cy="120" rx="60" ry="70"
          fill="url(#avatarGradient)"
          stroke="#fff"
          strokeWidth="0.5"
          animate={{
            ry: [70, 72, 70],
            rx: [60, 61, 60]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Eyes */}
        <motion.circle 
          cx="100" cy="110" r="3" fill="#fff" 
          animate={{ scaleY: [1, 0.1, 1] }} 
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 + Math.random() * 5 }}
        />
        <motion.circle 
          cx="140" cy="110" r="3" fill="#fff" 
          animate={{ scaleY: [1, 0.1, 1] }} 
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 + Math.random() * 5 }}
        />

        {/* Mouth/Voice Line */}
        <motion.path
          d={responding ? "M110 145 Q 120 160 130 145" : "M 110 145 Q 120 148 130 145"}
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={responding ? { 
            d: ["M110 145 Q 120 160 130 145", "M110 145 Q 120 140 130 145", "M110 145 Q 120 160 130 145"]
          } : {}}
          transition={{ duration: 0.2, repeat: Infinity }}
        />

        {/* Floating Particles Around Head */}
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            r="1"
            fill="#fff"
            initial={{ cx: 120, cy: 120 }}
            animate={{ 
              cx: 120 + Math.cos(i * 60 * Math.PI / 180) * 80,
              cy: 120 + Math.sin(i * 60 * Math.PI / 180) * 80,
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </svg>
    </div>
  );
}
