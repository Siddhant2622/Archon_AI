"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

const GlobeMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#8b5cf6" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#22d3ee" />
      
      <Sphere ref={meshRef} args={[2, 32, 32]}>
        <meshStandardMaterial 
          color="#0a0e17"
          wireframe={true}
          transparent={true}
          opacity={0.5}
        />
      </Sphere>
      
      {/* Inner glowing core */}
      <Sphere args={[1.9, 16, 16]}>
        <meshBasicMaterial 
          color="#8b5cf6" 
          transparent={true} 
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
};

export default function InteractiveGlobe() {
  return (
    <div className="w-full h-[400px] relative flex items-center justify-center">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-accent-violet/5 rounded-full blur-[100px] pointer-events-none" />
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <GlobeMesh />
        </Suspense>
      </Canvas>
    </div>
  );
}
