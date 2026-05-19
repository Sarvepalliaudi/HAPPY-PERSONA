import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, LogOut, AlertCircle, RefreshCw } from 'lucide-react';
import ThreeDNAvatar from './ThreeDNAvatar';

const LiveSessionScreen = ({ sessionData, onEnd, onIntentChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("Biometric connection established. I am your Persona. Use your voice to guide me.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rmsVolume, setRmsVolume] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setIsPreview(window.self !== window.top || window.location.hostname.includes('ai.studio'));
  }, []);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioStreamRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState("");

  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      
      const recognition = new SpeechRecognition();
      // Optimization for Mobile: continuous can be buggy on some Android versions
      // but we need it for live session feel.
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const text = event.results[i][0].transcript;
            setTranscript(text);
            handleUserMessage(text);
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) setTranscript(interim);
      };

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg("");
      };

      recognition.onend = () => {
        // Robust re-initialization if mic is supposed to be active
        if (micActive) {
            setTimeout(() => {
                try { 
                    if (micActive) recognition.start(); 
                } catch(e) {
                    console.warn("Speech recognition restart failed:", e);
                }
            }, 300);
        } else {
            setIsListening(false);
        }
      };

      recognition.onerror = (err) => {
        console.error('Recognition Error:', err);
        if (err.error === 'not-allowed') {
          setErrorMsg("Mic blocked. Use Chrome 'Site Settings' to allow.");
          setMicActive(false);
          setIsListening(false);
        } else if (err.error === 'network') {
          setErrorMsg("Link unstable. Retrying...");
        } else if (err.error === 'no-speech') {
          // Normal behavior
        } else if (err.error === 'aborted') {
          // Usually means stop() was called or backgrounded
        } else {
          setErrorMsg("Neural link fault. Tap to reset.");
          setMicActive(false);
        }
      };
      recognitionRef.current = recognition;
    } else {
      setErrorMsg("Neural Vocal Analysis (Chrome) not detected.");
    }
  }, [micActive, sessionData]);

  useEffect(() => {
    initSpeechRecognition();
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthesisRef.current) synthesisRef.current.cancel();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startAudioAnalysis = useCallback(async () => {
    try {
      if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach(t => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      audioStreamRef.current = stream;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 512;
      source.connect(analyzerRef.current);
      
      const bufferLength = analyzerRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyzerRef.current) return;
        
        // Check for muted track
        const currentStream = audioStreamRef.current;
        if (currentStream) {
            const isMuted = currentStream.getAudioTracks().some(t => !t.enabled || t.muted);
            if (isMuted && isListening) {
               setErrorMsg("Microphone appears muted. Please unmute.");
            }
        }

        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArrayRef.current[i];
        const average = (sum / bufferLength) / 128;
        
        if (isSpeaking) {
          setRmsVolume(0.5 + Math.random() * 0.5); 
        } else {
          setRmsVolume(average);
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn("Audio Context init failed:", err);
      if (err.name === 'NotAllowedError') setErrorMsg("Mic permission required for Live Sync.");
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (isListening || isSpeaking) startAudioAnalysis();
  }, [isListening, isSpeaking, startAudioAnalysis]);

  const handleUserMessage = async (text) => {
    if (!text || text.trim().length < 2) return;
    setIsProcessing(true);
    setTranscript("");
    
    try {
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: text,
          context: { sessionData } 
        })
      });
      const data = await chatRes.json();
      
      if (data.text) {
        setAiResponse(data.text);
        speak(data.text);
      }
    } catch (err) {
      console.error('Chat API Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    
    // Fallback if Speech API is weird on mobile
    if (text.length > 500) text = text.slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(text);
    const mode = sessionData?.voice || 'neutral';

    let selectedVoice = null;
    if (mode === 'deep') {
      selectedVoice = voices.find(v => v.name.toLowerCase().includes('male') && v.lang.startsWith('en')) || 
                      voices.find(v => v.name.toLowerCase().includes('male')) || voices[0];
      utterance.pitch = 0.5;
      utterance.rate = 0.85;
    } else if (mode === 'soft') {
      selectedVoice = voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) || 
                      voices.find(v => v.name.toLowerCase().includes('female')) || voices[0];
      utterance.pitch = 1.35;
      utterance.rate = 1.05;
    } else {
      selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
        setIsSpeaking(true);
        // Ensure AudioContext is analyzing simulated AI voice
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    };
    utterance.onend = () => {
        setIsSpeaking(false);
        setRmsVolume(0);
    };
    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      setIsSpeaking(false);
    };
    
    synthesisRef.current.speak(utterance);
  };

  const toggleListening = () => {
    // Explicit user interaction capture for Mobile Chrome
    if (!hasInteracted) {
      setHasInteracted(true);
      // Unlock synthesis and audio context
      if (synthesisRef.current) {
        const silent = new SpeechSynthesisUtterance("");
        synthesisRef.current.speak(silent);
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setMicActive(false);
      setIsListening(false);
    } else {
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
      startAudioAnalysis();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setMicActive(true);
          setIsListening(true);
          setErrorMsg("");
        } catch (e) {
          console.warn("Recognition start catch:", e);
          initSpeechRecognition();
          setTimeout(() => {
            try { 
              recognitionRef.current.start(); 
              setMicActive(true);
            } catch(err) {
              setErrorMsg("Neural link failed. Refreshing...");
            }
          }, 300);
        }
      } else {
        initSpeechRecognition();
        setErrorMsg("Initializing neural stream...");
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-10 px-6 overflow-hidden bg-[#050505]">
      {/* HUD Top-Bar */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center z-20 gap-4">
        <div className="flex items-center gap-3">
            <motion.div 
                animate={{ opacity: [1, 0.4, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" 
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-emerald-500">Live Neural Stream</span>
              {isPreview && (
                <span className="text-[8px] text-orange-400/80 font-mono italic">
                  Preview Mode: Voice works best after deployment.
                </span>
              )}
            </div>
        </div>
        <button 
          onClick={onEnd}
          className="bg-white/5 border border-white/10 text-white/50 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          End Session
        </button>
      </div>

      {/* Main Avatar Canvas Container */}
      <div className="relative flex-1 w-full max-h-[60vh] flex flex-col items-center justify-center">
          <ThreeDNAvatar 
            portrait={sessionData?.portrait} 
            landmarks={sessionData?.landmarks}
            isSpeaking={isSpeaking} 
            rmsVolume={rmsVolume}
            isProcessing={isProcessing} 
          />
      </div>

      {/* Bottom Interface HUD */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-10 z-20 pb-4">
         {/* Dialogue Bubble */}
         <div className="w-full text-center px-4 min-h-[120px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={aiResponse}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                >
                    <p className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-white drop-shadow-2xl">
                         {aiResponse}
                    </p>
                    {isSpeaking && (
                         <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Neural Audio Projection...</div>
                    )}
                </motion.div>
            </AnimatePresence>
         </div>

         <div className="w-full flex flex-col items-center gap-8">
            {/* Status Feedback */}
            <div className="h-6 flex items-center justify-center">
                {errorMsg ? (
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
                        <AlertCircle size={12} /> {errorMsg}
                    </div>
                ) : (
                    <div className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em]">
                        {isListening ? (transcript || "Biometric Cues Awaited...") : "Establishing Link... Tap to activate"}
                    </div>
                )}
            </div>

            {/* Interaction Button */}
            <div className="relative">
                <AnimatePresence>
                    {isListening && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 -m-8 rounded-full border-2 border-white/10" 
                        />
                    )}
                </AnimatePresence>
                <button 
                    onClick={toggleListening}
                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${isListening ? 'bg-white text-black scale-110 ring-[20px] ring-white/5' : 'bg-white/5 text-white border border-white/10 hover:border-white/30'}`}
                >
                    {isListening ? <Mic size={40} /> : <MicOff size={40} className="opacity-30" />}
                </button>
            </div>

            <div className="flex items-center gap-6 text-[8px] font-mono text-white/10 uppercase tracking-[0.6em]">
                <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                    <span>Neural Link</span>
                </div>
                <div>Voice: {sessionData?.voice || 'Neutral'}</div>
                <div className="flex items-center gap-1.5">
                    <RefreshCw size={8} className={isProcessing ? "animate-spin" : ""} />
                    Stability: {isProcessing ? "Sinking" : "Locked"}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LiveSessionScreen;
