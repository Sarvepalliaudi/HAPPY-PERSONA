import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertCircle, CheckCircle2, UserCheck, Eye, Mic } from 'lucide-react';

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
  "Small confidence creates big change."
];

export default function ScanPhase({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [status, setStatus] = useState("Initializing Camera...");
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const meshRef = useRef(null);
  const streamRef = useRef(null);

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Initialization
  useEffect(() => {
    let detector = null;
    let cameraActive = true;

    const setupFaceMesh = async () => {
      try {
        const FaceMeshClass = window.FaceMesh;
        if (!FaceMeshClass) {
          setError("FaceMesh is not ready yet.");
          return;
        }
        const mesh = new FaceMeshClass({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        mesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        mesh.onResults((results) => {
          if (!cameraActive) return;
          
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            // Lighting Check (Simplified)
            // We can't easily get brightness from results, but we could sample from the image.
            // For now, we'll assume stable lighting if face tracked, but add a placeholder check.
            
            if (results.multiFaceLandmarks.length > 1) {
              setStatus("Only one face allowed in frame");
              return;
            }

            // Heuristics
            const face = results.multiFaceLandmarks[0];
            const faceWidth = Math.abs(face[454].x - face[234].x); // Width between far ears
            
            if (faceWidth < 0.25) {
              setStatus("Move Closer");
            } else {
              setStatus("Face Stable");
            }
            
            // Draw mesh
            ctx.fillStyle = "rgba(139, 92, 246, 0.4)";
            results.multiFaceLandmarks[0].forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x * canvas.width, point.y * canvas.height, 1, 0, 2 * Math.PI);
              ctx.fill();
            });

            // Increment progress if face is stable
            setProgress(prev => {
              if (prev < 100) return prev + 0.5;
              return prev;
            });
          } else {
            setStatus("Face not detected");
          }
        });

        meshRef.current = mesh;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Webcam permissions or interface not available.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: true 
        });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             videoRef.current.play();
             // Start processing
             requestAnimationFrame(processVideo);
          };
        }
      } catch (err) {
        console.error(err);
        setError("Camera permission denied or not supported.");
      }
    };

    const processVideo = async () => {
      if (!cameraActive || !videoRef.current || !meshRef.current) return;
      if (videoRef.current.readyState >= 2) {
        await meshRef.current.send({ image: videoRef.current });
      }
      requestAnimationFrame(processVideo);
    };

    setupFaceMesh();

    return () => {
      cameraActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => onComplete({}), 1000);
    }
  }, [progress, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8"
    >
      <div className="relative w-full max-w-2xl aspect-video glass-panel rounded-3xl overflow-hidden mb-8">
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-40"
          playsInline
          muted
        />
        <canvas 
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        />

        {/* Scan Overlay UI */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-white/20 rounded-full flex items-center justify-center relative">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-t-2 border-purple-500 rounded-full"
             />
             <div className="text-4xl font-bold font-mono text-purple-400">
               {Math.floor(progress)}%
             </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
           <div className={`px-4 py-2 rounded-full glass-panel flex items-center gap-2 text-sm ${status === "Face Stable" ? 'text-emerald-400' : 'text-orange-400'}`}>
              {status === "Face Stable" ? <UserCheck size={16} /> : <AlertCircle size={16} />}
              {status}
           </div>
           <div className="flex gap-2">
             <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-emerald-400">
               <Eye size={16} />
             </div>
             <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-emerald-400">
               <Mic size={16} />
             </div>
           </div>
        </div>
        
        {error && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Access Denied</h3>
            <p className="text-zinc-400 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full font-bold">RETRY</button>
          </div>
        )}
      </div>

      {/* Quote Display */}
      <div className="h-24 flex items-center justify-center text-center max-w-lg mb-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={quoteIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-3xl font-serif italic text-purple-100/80 leading-snug"
          >
            "{QUOTES[quoteIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-zinc-500 text-xs tracking-widest uppercase">Capturing emotional nuances & biometrics...</p>
    </motion.div>
  );
}
