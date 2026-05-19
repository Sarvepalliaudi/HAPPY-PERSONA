import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertCircle, CheckCircle2, UserCheck, X } from 'lucide-react';
// import { FaceMesh } from '@mediapipe/face_mesh'; // Note: Loading this usually requires a script or dynamic import in some envs

const QUOTES = [
  "Your existence already matters.",
  "You survived your hardest moments.",
  "Peace begins when comparison ends.",
  "Even slow progress is still progress.",
  "One small decision can change years.",
  "A calm mind creates a powerful future.",
  "You are becoming stronger quietly.",
  "Your story is still being written.",
  "Every human carries a story worth hearing.",
  "Small confidence creates big change.",
];

const ScanScreen = ({ onComplete, onCancel }) => {
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [status, setStatus] = useState("Initializing camera..."); // Initializing, Face Not Detected, Face Stable, etc.
  const [isDetected, setIsDetected] = useState(false);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Camera setup
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus("Hold still. Analyzing...");
        }
      } catch (err) {
        console.error(err);
        setError("Camera permission denied or not found.");
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Scanning progress
  useEffect(() => {
    if (status === "Analyzing..." || status === "Face Stable") {
       scanIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(scanIntervalRef.current);
            capturePortrait();
            return 100;
          }
          return prev + 1;
        });
      }, 200); // 100 * 200ms = 20 seconds total
    } else {
        clearInterval(scanIntervalRef.current);
    }

    return () => clearInterval(scanIntervalRef.current);
  }, [status, onComplete]);

  const capturePortrait = useCallback(() => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        // Mirror the image as the video is mirrored
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        const portrait = canvas.toDataURL('image/webp');
        onComplete({ portrait, timestamp: Date.now() });
    }
  }, [onComplete]);

  // Mock Face Detection Logic (In a real app, we'd use MediaPipe FaceMesh here)
  // For this demo/production-ready skeleton, we simulate the stability detection
  useEffect(() => {
    const detectionInterval = setInterval(() => {
        // Randomly simulate face detection states if we don't have the heavy weights loaded yet
        // In a real production app we would integrate the mediapipe loop here
        const roll = Math.random();
        if (roll > 0.1) {
            setIsDetected(true);
            setStatus("Face Stable");
        } else {
            setIsDetected(false);
            setStatus("Face not detected");
            setProgress(p => Math.max(0, p - 5)); // Penalty for losing face
        }
    }, 2000);
    return () => clearInterval(detectionInterval);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center space-y-12 py-10 px-4">
      {/* Header Info */}
      <div className="absolute top-10 left-0 right-0 px-6 flex justify-between items-start z-20">
        <div className="space-y-1">
          <h2 className="text-xl font-bold uppercase italic tracking-tighter">Persona Sync</h2>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{status}</p>
        </div>
        <button onClick={onCancel} className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Main Scanner Visual */}
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        <div className="absolute inset-0 rounded-full border-2 border-white/10 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]">
           <video 
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover grayscale brightness-75 contrast-125 scale-x-[-1]"
           />
           
           {/* Face Mesh Simulation Overlays */}
           <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full opacity-30" viewBox="0 0 100 100">
                    <circle cx="50" cy="45" r="30" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" className="animate-[pulse_4s_infinite]" />
                    <path d="M50 20 L50 70 M30 45 L70 45" stroke="white" strokeWidth="0.2" opacity="0.3" />
                </svg>
           </div>
        </div>

        {/* Scanning Rings */}
        <div className="absolute -inset-4 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
        <div className="absolute -inset-8 rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
        
        {/* Progress HUD */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-2xl">
          {isDetected ? <UserCheck size={12} /> : <AlertCircle size={12} className="text-red-500" />}
          {progress}% Compiled
        </div>
      </div>

      {/* Emotional Quote System */}
      <div className="max-w-xs text-center h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={quoteIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8 }}
            className="text-lg md:text-xl font-medium italic text-white/80 leading-tight"
          >
            "{QUOTES[quoteIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Footnote HUD */}
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-between items-end text-[10px] font-mono text-white/30 uppercase">
          <span>Biometric Extraction</span>
          <span className="text-white/60">Stage {progress > 66 ? 'III' : progress > 33 ? 'II' : 'I'}</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-white shadow-[0_0_10px_white]" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Safety Overlay */}
      {error && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-center items-center justify-center p-10 text-center">
          <div className="space-y-6">
            <AlertCircle size={60} className="text-red-500 mx-auto" />
            <h3 className="text-2xl font-bold uppercase">System Error</h3>
            <p className="text-white/50">{error}</p>
            <button onClick={onCancel} className="bg-white text-black px-8 py-3 rounded-xl font-bold">Restart Session</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanScreen;
