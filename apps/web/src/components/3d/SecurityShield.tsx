"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron } from "@react-three/drei";
import * as THREE from "three";

const ShieldMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.rotation.z = time * 0.2;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = -time * 0.3;
      outerRef.current.rotation.x = time * 0.1;
      
      // Pulse effect
      const scale = 1.2 + Math.sin(time * 2) * 0.05;
      outerRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} color="#34d399" />
      <directionalLight position={[-5, -5, -5]} intensity={1} color="#059669" />
      
      {/* Core */}
      <Icosahedron ref={meshRef} args={[1, 0]}>
        <meshStandardMaterial 
          color="#34d399"
          roughness={0.2}
          metalness={0.8}
        />
      </Icosahedron>
      
      {/* Force Field */}
      <Icosahedron ref={outerRef} args={[1.2, 1]}>
        <meshBasicMaterial 
          color="#10b981" 
          wireframe={true} 
          transparent={true} 
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </Icosahedron>
    </group>
  );
};

export default function SecurityShield() {
  return (
    <div className="w-full h-[200px] relative flex items-center justify-center">
      {/* Glow behind the shield */}
      <div className="absolute inset-0 bg-accent-emerald/10 rounded-full blur-[60px] pointer-events-none" />
      
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ShieldMesh />
        </Suspense>
      </Canvas>
    </div>
  );
}
