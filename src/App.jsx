import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HomeScreen from './components/HomeScreen';
import ConsentScreen from './components/ConsentScreen';
import ScanScreen from './components/ScanScreen';
import LoadingScreen from './components/LoadingScreen';
import LiveSessionScreen from './components/LiveSessionScreen';
import EndScreen from './components/EndScreen';
import AboutScreen from './components/AboutScreen';
import UserManual from './components/UserManual';

import VoiceSelectionScreen from './components/VoiceSelectionScreen';

const App = () => {
  const [screen, setScreen] = useState('home'); // home, consent, voice, scan, loading, live, end, about, manual
  const [sessionData, setSessionData] = useState({
    portrait: null,
    voice: 'neutral',
    timestamp: null
  });
  const [intent, setIntent] = useState('calm'); // dynamic background state
  const [showManual, setShowManual] = useState(false);

  // Transitions for screens
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const handleStart = useCallback(() => setScreen('consent'), []);
  const handleConsent = useCallback(() => setScreen('voice'), []);
  const handleVoiceSelect = useCallback((voice) => {
    setSessionData(prev => ({ ...prev, voice }));
    setScreen('scan');
  }, []);
  const handleScanComplete = useCallback((data) => {
    setSessionData(prev => ({ ...prev, ...data }));
    setScreen('loading');
    // Simulate persona generation
    setTimeout(() => {
      setScreen('live');
    }, 4500);
  }, []);
  const handleEndSession = useCallback(() => {
    setScreen('end');
    // We delay the data reset to allow the EndScreen to show the "purge" animation
    setTimeout(() => {
      setSessionData({ portrait: null, voice: 'neutral', timestamp: null });
      setScreen('home');
    }, 5000); // 5 seconds duration for EndScreen
  }, []);

  const toggleManual = useCallback(() => setShowManual(prev => !prev), []);
  const showAbout = useCallback(() => setScreen('about'), []);
  const goHome = useCallback(() => setScreen('home'), []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-sans">
      {/* Dynamic Cinematic Background */}
      <BackgroundEngine intent={intent} />

      {/* Main Content */}
      <main className="relative z-10 flex h-full min-h-screen flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md">
              <HomeScreen onStart={handleStart} onAbout={showAbout} />
            </motion.div>
          )}

          {screen === 'consent' && (
            <motion.div key="consent" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md">
              <ConsentScreen onAccept={handleConsent} onDecline={goHome} />
            </motion.div>
          )}

          {screen === 'voice' && (
            <motion.div key="voice" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md">
              <VoiceSelectionScreen onSelect={handleVoiceSelect} />
            </motion.div>
          )}

          {screen === 'scan' && (
            <motion.div key="scan" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full flex items-center justify-center">
              <ScanScreen onComplete={handleScanComplete} onCancel={goHome} />
            </motion.div>
          )}

          {screen === 'loading' && (
            <motion.div key="loading" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md">
              <LoadingScreen portrait={sessionData.portrait} />
            </motion.div>
          )}

          {screen === 'live' && (
            <motion.div key="live" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full flex flex-col items-center justify-center">
              <LiveSessionScreen 
                sessionData={sessionData} 
                onEnd={handleEndSession} 
                onIntentChange={setIntent}
              />
            </motion.div>
          )}

          {screen === 'end' && (
            <motion.div key="end" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-md text-center">
              <EndScreen portrait={sessionData.portrait} />
            </motion.div>
          )}

          {screen === 'about' && (
            <motion.div key="about" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-lg">
              <AboutScreen onBack={goHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Manual Trigger */}
      <button 
        onClick={toggleManual}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-white/10 p-3 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
        title="User Manual"
      >
        <span className="text-xs font-bold font-mono">?</span>
      </button>

      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl border border-white/20 bg-white/5 p-8 glass-morphism shadow-2xl">
              <UserManual onClose={toggleManual} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Footer Attributes */}
      <footer className="fixed bottom-0 left-0 right-0 z-0 p-4 text-center opacity-30 text-[10px] pointer-events-none uppercase tracking-widest">
        HAPPYPERSONA by AS PHENIX | SARVEPALLI AUDI SIVA BHANUVARDHAN
      </footer>
    </div>
  );
};

const BackgroundEngine = ({ intent }) => {
  const getGradient = () => {
    switch (intent) {
      case 'motivation': return 'from-orange-600/40 via-yellow-600/20 to-black';
      case 'sad': return 'from-blue-900/40 via-cyan-900/20 to-black';
      case 'technical': return 'from-blue-600/40 via-indigo-900/40 to-black';
      case 'calm': return 'from-green-900/40 via-emerald-900/20 to-black';
      case 'funny': return 'from-pink-600/40 via-purple-600/20 to-black';
      case 'romantic': return 'from-rose-900/40 via-fuchsia-900/20 to-black';
      case 'spiritual': return 'from-purple-900/40 via-amber-900/20 to-black';
      default: return 'from-gray-900/40 via-black to-black';
    }
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} transition-colors duration-[2000ms] ease-in-out`} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      
      {/* Floating particles simulation */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20 blur-xl"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
