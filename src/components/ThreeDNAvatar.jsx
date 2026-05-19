import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Center, Float, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

const NeuralFace = ({ landmarks, isSpeaking, rmsVolume, isProcessing }) => {
  const pointsRef = useRef();
  const groupRef = useRef();

  // Initial neutral positions for a face-like shape
  // We'll use these to "pull" the points toward if landmarks are missing
  const initialPositions = useMemo(() => {
    const pos = new Float32Array(478 * 3);
    for (let i = 0; i < 478; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 2;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.getElapsedTime();

    if (landmarks && landmarks.length > 0) {
      // Scale and offset constants to center and size the face correctly in 3D space
      const scaleX = 4;
      const scaleY = 4;
      const scaleZ = 3;
      const offsetX = 0.5;
      const offsetY = 0.5;

      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        
        // Map 0-1 range from MediaPipe to -2 to 2 range roughly
        let targetX = (lm.x - offsetX) * -scaleX; // Mirror X
        let targetY = (offsetY - lm.y) * scaleY;
        let targetZ = (lm.z) * -scaleZ;

        // Apply some "breathing" and "jitter" for cinematic feel
        targetY += Math.sin(time + i * 0.1) * 0.01;
        
        // Lip sync effect on mouth landmarks
        // Mouth indices are roughly 0-20, 61-91, etc. simplified here
        if (isSpeaking && lm.y > 0.55 && Math.abs(lm.x - 0.5) < 0.2) {
          targetY -= rmsVolume * 0.15;
        }

        // Smoothly interpolate to target
        positions[i * 3] += (targetX - positions[i * 3]) * 0.2;
        positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * 0.2;
        positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * 0.2;
      }
    } else {
      // Floating animation when no face detected
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.001;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Head motion
    if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
        groupRef.current.rotation.x = Math.cos(time * 0.3) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <Points ref={pointsRef} positions={initialPositions}>
        <PointMaterial
          transparent
          vertexColors={false}
          color="#ffffff"
          size={0.035}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Cinematic Aura Glow (Inner) */}
      <mesh scale={[1, 1.2, 0.5]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial 
            color="#4f46e5" 
            transparent 
            opacity={isSpeaking ? 0.2 + rmsVolume * 0.2 : 0.1} 
            wireframe
        />
      </mesh>
    </group>
  );
};

export default function ThreeDNAvatar({ portrait, isSpeaking, rmsVolume, isProcessing }) {
  const videoRef = useRef();
  const faceMeshRef = useRef();
  const [landmarks, setLandmarks] = React.useState(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    let activeStream = null;
    let requestID;
    let faceMesh = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          activeStream = stream;
          video.srcObject = stream;
          video.play().catch(err => console.warn("Video auto-play failed:", err));
        })
        .catch((err) => {
          console.warn("Webcam access denied or unavailable in this environment:", err);
        });
    } else {
      console.warn("navigator.mediaDevices or getUserMedia not available in this browser environment.");
    }

    const FaceMeshClass = window.FaceMesh;
    if (FaceMeshClass) {
      faceMesh = new FaceMeshClass({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
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
        } else {
          setLandmarks(null);
        }
      });

      faceMeshRef.current = faceMesh;

      const sendVideoFrame = async () => {
        if (video.readyState === 4 && faceMesh) {
          try {
            await faceMesh.send({ image: video });
          } catch (e) {
            console.warn("Failed to process frame with FaceMesh:", e);
          }
        }
        requestID = requestAnimationFrame(sendVideoFrame);
      };
      sendVideoFrame();
    } else {
      console.warn("FaceMesh global not found. Please enable direct internet connection.");
    }

    return () => {
      if (requestID) cancelAnimationFrame(requestID);
      if (faceMesh) {
        try {
          faceMesh.close();
        } catch (e) {
          console.warn("FaceMesh close error:", e);
        }
      }
      if (activeStream) {
         activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* Background Cinematic Aura */}
      <div className={`absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full transition-opacity duration-1000 ${isSpeaking ? 'opacity-60' : 'opacity-20'}`} />
      
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
        
        <Center>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <NeuralFace 
                landmarks={landmarks} 
                isSpeaking={isSpeaking} 
                rmsVolume={rmsVolume} 
                isProcessing={isProcessing} 
            />
          </Float>
        </Center>

        <Sparkles 
            count={100} 
            scale={4} 
            size={1.5} 
            speed={0.2} 
            opacity={0.3} 
            color="#ffffff" 
        />
        
        <Environment preset="night" />
      </Canvas>

      {/* Neural Link Status HUD Overlay */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end pointer-events-none">
          <div className="space-y-1">
              <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">Face Sync</div>
              <div className="flex gap-1 h-1 items-center">
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-4 h-full rounded-full ${landmarks ? 'bg-emerald-500' : 'bg-white/10'} transition-colors delay-${i*50}`} />
                  ))}
              </div>
          </div>
          <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">Biometric ID: {portrait ? portrait.slice(-10) : 'TEMP_USER_V1'}</div>
      </div>
    </div>
  );
}
