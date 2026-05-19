import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, LogOut, MessageSquare, Waves, Volume2 } from 'lucide-react';
import ThreeDNAvatar from './ThreeDNAvatar';

const LiveSessionScreen = ({ sessionData, onEnd, onIntentChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("Scan complete. I have successfully synthesized your Happy Persona. How can I assist your well-being today?");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rmsVolume, setRmsVolume] = useState(0);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioStreamRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState("");

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.results[event.resultIndex];
        const text = current[0].transcript;
        setTranscript(text);
        setErrorMsg(""); 
        
        if (current.isFinal) {
          handleUserMessage(text);
        }
      };

      recognitionRef.current.onerror = (err) => {
        console.error('Speech Recognition Error:', err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          setErrorMsg("Microphone access denied. Please check site permissions.");
        } else if (err.error === 'network') {
          setErrorMsg("Network error. Checking connection...");
        } else if (err.error === 'no-speech') {
           // Common in continuous mode if quiet
        } else {
          setErrorMsg("Microphone link failed. Tap to retry.");
        }
      };
    } else {
      setErrorMsg("Web Speech API not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthesisRef.current) synthesisRef.current.cancel();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Audio Analyzer for User and AI Voice Visualization
  const startAudioAnalysis = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Audio recording is not supported on this browser or under this iframe context.");
      return;
    }
    try {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        } 
      });
      audioStreamRef.current = stream;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 512;
      source.connect(analyzerRef.current);
      
      const bufferLength = analyzerRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyzerRef.current) return;
        
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = (sum / bufferLength) / 128; // 0 to 2 range roughly
        
        // Use real audio volume when listening, simulated when AI speaks
        if (isSpeaking) {
          // Add some organic variation to AI's simulated volume
          setRmsVolume(0.4 + Math.random() * 0.6);
        } else if (isListening) {
          setRmsVolume(average);
        } else {
          setRmsVolume(0);
        }
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn("Audio analysis failed:", err);
      // Don't show error immediately as user might only want to listen
    }
  }, [isSpeaking, isListening]);

  useEffect(() => {
    if (isListening || isSpeaking) {
      startAudioAnalysis();
    }
  }, [isListening, isSpeaking, startAudioAnalysis]);

  const handleUserMessage = async (text) => {
    if (!text || text.trim().length === 0) return;
    
    setIsProcessing(true);
    try {
      // 1. Analyze Sentiment/Intent for Background
      const intentRes = await fetch('/api/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const inviteData = await intentRes.json();
      if (inviteData.intent) onIntentChange(inviteData.intent);

      // 2. Get AI Response from Gemini
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: text,
          context: { sessionData } 
        })
      });
      const chatData = await chatRes.json();
      
      if (chatData.text) {
        setAiResponse(chatData.text);
        speak(chatData.text);
      }
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    
    // Ensure we have voices loaded
    const voices = synthesisRef.current.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice Selection & Tuning Logic
    const voiceMode = sessionData?.voice || 'neutral';
    
    // Try to find a fitting voice based on mode
    if (voiceMode === 'deep') {
      utterance.voice = voices.find(v => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('male')) || 
                      voices.find(v => v.name.toLowerCase().includes('male')) || voices[0];
      utterance.pitch = 0.5;
      utterance.rate = 1.0;
    } else if (voiceMode === 'soft') {
      utterance.voice = voices.find(v => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female')) || 
                      voices.find(v => v.name.toLowerCase().includes('female')) || voices[0];
      utterance.pitch = 1.4;
      utterance.rate = 1.1;
    } else {
      utterance.voice = voices[0];
      utterance.pitch = 1.0;
      utterance.rate = 1.1;
    }

    utterance.onstart = () => {
        setIsSpeaking(true);
    };
    utterance.onend = () => {
        setIsSpeaking(false);
        setRmsVolume(0);
    };
    utterance.onerror = (e) => {
        console.error("Speech Synthesis Error:", e);
        setIsSpeaking(false);
        setRmsVolume(0);
    };

    synthesisRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setTranscript("");
    } else {
      try {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
            setErrorMsg("");
        } else {
            setErrorMsg("Neural link component missing.");
        }
      } catch (err) {
        console.error("Start recognition failed", err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-12 px-6 overflow-hidden bg-[#0a0a0a]">
      {/* Cinematic Background Ambient Motion */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
         <motion.div 
            animate={{ 
                scale: [1, 1.4, 1],
                rotate: [0, 45, 0],
                opacity: [0.1, 0.4, 0.1],
                filter: ["blur(100px)", "blur(150px)", "blur(100px)"]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(79,70,229,0.15)_0%,transparent_70%)]"
         />
         <motion.div 
            animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [0, -30, 0],
                opacity: [0.05, 0.2, 0.05]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[20%] w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_60%)]"
         />
      </div>

      {/* Top Bar */}
      <div className="w-full flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                {isSpeaking && <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-50" />}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50">Neural Stream Establised</span>
        </div>
        <button 
          onClick={onEnd}
          className="group flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-black"
        >
          Purge Session <LogOut size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* AI AVATAR AREA - 3D Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full max-h-[60vh]">
         {/* Replacement with 3D Avatar */}
         <ThreeDNAvatar 
            portrait={sessionData?.portrait} 
            isSpeaking={isSpeaking} 
            rmsVolume={rmsVolume}
            isProcessing={isProcessing} 
         />
         
         {/* Live Audio Waveform (Cinematic) */}
         <div className="absolute bottom-4 flex items-center gap-1.5 h-16 pointer-events-none">
            {[...Array(48)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1 bg-white/10 rounded-full"
                    animate={{ 
                        height: (isListening || isSpeaking) ? Math.max(2, rmsVolume * 60 * (1 - Math.abs(i - 24) / 24) * (0.8 + Math.random() * 0.4)) : 2,
                        opacity: (isListening || isSpeaking) ? 0.8 : 0.1,
                        backgroundColor: isSpeaking ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                />
            ))}
         </div>
      </div>

      {/* Bottom Area: AI Dialogue and Interaction */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-10 z-20 pb-4">
         {/* AI Dialogue */}
         <div className="w-full text-center px-4 relative min-h-[100px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={aiResponse}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                >
                    <p className="text-2xl md:text-4xl font-black tracking-tight leading-none drop-shadow-2xl text-white uppercase italic text-balance">
                         {aiResponse}
                    </p>
                    {isSpeaking && (
                         <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Transmitting Voice Data</div>
                    )}
                </motion.div>
            </AnimatePresence>
         </div>

         {/* Interaction Controls */}
         <div className="w-full flex flex-col items-center gap-8">
            {/* User Feedback (Transcript) */}
            <div className="h-4 text-center px-6">
                {errorMsg ? (
                    <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-[10px] font-mono uppercase tracking-[0.3em] font-bold"
                    >
                        {errorMsg}
                    </motion.span>
                ) : (
                    <motion.span 
                        animate={{ opacity: isListening ? 1 : 0.4 }}
                        className="text-white text-[10px] font-mono uppercase tracking-[0.3em]"
                    >
                        {isListening ? (transcript || "Biometric Cues Awaited...") : "Tap to activate neural link"}
                    </motion.span>
                )}
            </div>

            {/* Main Mic Button */}
            <div className="relative group">
                <AnimatePresence>
                    {isListening && (
                        <>
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                className="absolute inset-0 -m-8 rounded-full border-2 border-white/10" 
                            />
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 2.5, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5, ease: "easeOut" }}
                                className="absolute inset-0 -m-12 rounded-full border border-white/5" 
                            />
                        </>
                    )}
                </AnimatePresence>

                <button 
                    onClick={toggleListening}
                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${isListening ? 'bg-white text-black scale-110 rotate-12 ring-[24px] ring-white/5' : 'bg-white/5 text-white backdrop-blur-3xl border border-white/10 hover:border-white/30 hover:scale-110'}`}
                >
                    {isListening ? <Mic size={40} strokeWidth={2} /> : <MicOff size={40} className="opacity-40" />}
                </button>
            </div>

            <div className="flex items-center gap-6 text-[8px] font-mono text-white/10 uppercase tracking-[0.6em]">
                <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                    <span>Neural Link</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                    <span>Voice: {sessionData?.voice || 'Neutral'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                    <span>Encrypted</span>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LiveSessionScreen;
