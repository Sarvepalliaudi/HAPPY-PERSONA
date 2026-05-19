import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Float, Sparkles, Environment, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { FaceMesh } from '@mediapipe/face_mesh';
import { motion } from 'framer-motion';

// This component warps a 3D Plane that has the user's portrait as a texture
const NeuralPortraitMesh = ({ portrait, landmarks, isSpeaking, rmsVolume }) => {
  const meshRef = useRef();
  const texture = useMemo(() => {
    if (!portrait) return null;
    const loader = new THREE.TextureLoader();
    return loader.load(portrait);
  }, [portrait]);

  const planeSize = [3, 3.5];
  const segments = 32;

  useFrame((state) => {
    if (!meshRef.current || !landmarks) return;
    const { geometry } = meshRef.current;
    const pos = geometry.attributes.position;
    const time = state.clock.getElapsedTime();

    // Subtle breathing/floating of the whole portrait
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.05;
    meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;

    // Apply distortion based on landmarks (simple warp)
    // Landmarks 0..477. We use key areas to warp the mesh.
    // For a real warped mesh, we'd map all landmarks, but for 2.5D, we warp the plane.
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        
        // Find nearest landmark to this vertex? (expensive for R3F frame)
        // Alternative: Use a few key points for global warp
        const noseLm = landmarks[1];
        const mouthLm = landmarks[13]; // Center of lower lip
        const eyeLLm = landmarks[33];
        const eyeRLm = landmarks[263];

        // Normalized relative coordinates of the plane vertex (-1.5 to 1.5) -> (0 to 1)
        const u = (x + 1.5) / 3;
        const v = (1.75 - y) / 3.5;

        // Distort mesh based on head orientation (nose LM vs center)
        const shiftX = (0.5 - noseLm.x) * 1.5;
        const shiftY = (0.5 - noseLm.y) * 1.5;

        // Lip sync warp
        let mouthWarp = 0;
        if (isSpeaking && Math.abs(x) < 0.5 && y < 0) {
            mouthWarp = rmsVolume * 0.2 * Math.exp(-(x*x + (y+0.5)*(y+0.5)) * 10);
        }

        pos.setZ(i, Math.sin(u * 10 + time) * 0.02 + Math.cos(v * 10 + time) * 0.02 + mouthWarp);
    }
    pos.needsUpdate = true;
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeSize[0], planeSize[1], segments, segments]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={0.8} 
        side={THREE.DoubleSide} 
        toneMapped={false}
      />
      {/* Glitchy/Dreamy overlay */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[planeSize[0] * 1.1, planeSize[1] * 1.1]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.1} />
      </mesh>
    </mesh>
  );
};

const Particles = () => {
    const pointsRef = useRef();
    const count = 100;
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            p[i*3] = (Math.random() - 0.5) * 6;
            p[i*3+1] = (Math.random() - 0.5) * 6;
            p[i*3+2] = (Math.random() - 0.5) * 2;
        }
        return p;
    }, []);

    useFrame((state) => {
        if(!pointsRef.current) return;
        pointsRef.current.rotation.y += 0.001;
        pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    });

    return (
        <Points ref={pointsRef} positions={positions}>
            <PointMaterial size={0.02} color="#ffffff" transparent opacity={0.4} sizeAttenuation />
        </Points>
    );
};

export default function ThreeDNAvatar({ portrait, isSpeaking, rmsVolume, isProcessing }) {
  const videoRef = useRef();
  const faceMeshRef = useRef();
  const [landmarks, setLandmarks] = useState(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.play();
    }).catch(err => console.warn("Avatar camera access failed:", err));

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        setLandmarks(results.multiFaceLandmarks[0]);
      }
    });

    let requestID;
    const sendVideoFrame = async () => {
      if (video.readyState === 4) {
        await faceMesh.send({ image: video });
      }
      requestID = requestAnimationFrame(sendVideoFrame);
    };
    sendVideoFrame();

    return () => {
      cancelAnimationFrame(requestID);
      faceMesh.close();
      if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="w-full h-full relative cursor-none">
      {/* Background Cinematic Aura */}
      <div className={`absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full transition-opacity duration-1000 ${isSpeaking ? 'opacity-70' : 'opacity-30'}`} />
      <div className={`absolute inset-0 bg-purple-600/10 blur-[150px] rounded-full transition-opacity duration-1000 animate-pulse`} />

      <Canvas camera={{ position: [0, 0, 5], fov: 35 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        
        <Center>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <NeuralPortraitMesh 
                portrait={portrait} 
                landmarks={landmarks} 
                isSpeaking={isSpeaking} 
                rmsVolume={rmsVolume} 
            />
          </Float>
        </Center>

        <Particles />
        <Sparkles count={50} scale={6} size={1} speed={0.3} opacity={0.2} color="#ffffff" />
        <Environment preset="night" />
      </Canvas>

      {/* Cinematic Overlays */}
      <div className="absolute inset-x-0 bottom-10 px-10 flex justify-between items-end pointer-events-none">
          <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${landmarks ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                 <span className="text-[7px] font-mono text-white/40 uppercase tracking-[0.4em]">Biometric Link: {landmarks ? 'STABLE' : 'SEARCHING'}</span>
              </div>
              <div className="w-32 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: landmarks ? '100%' : '20%' }}
                    className="h-full bg-white shadow-[0_0_10px_white]" 
                />
              </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             <div className="text-[7px] font-mono text-white/20 uppercase tracking-[0.4em]">Persona Frame: Active</div>
             <div className="text-[7px] font-mono text-white/20 uppercase tracking-[0.4em]">Render: 2.5D Neural Warp</div>
          </div>
      </div>

      {/* Scanline Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.5)_100%)] border-[20px] border-black/20" />
    </div>
  );
}

