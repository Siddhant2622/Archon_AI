"use client";

import { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Icosahedron, Text } from "@react-three/drei";
import * as THREE from "three";

// 1. Neural Network Background
const NeuralNetwork = ({ isMobile }: { isMobile: boolean }) => {
  const nodeCount = isMobile ? 60 : 150;
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const [positions, lines, colors] = useMemo(() => {
    const pos = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }

    const lineIndices = [];
    const lineColors = [];
    const baseColor = new THREE.Color("#22d3ee").multiplyScalar(0.1);

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 15) {
          lineIndices.push(i, j);
          lineColors.push(baseColor.r, baseColor.g, baseColor.b);
          lineColors.push(baseColor.r, baseColor.g, baseColor.b);
        }
      }
    }

    return [pos, new Uint16Array(lineIndices), new Float32Array(lineColors)];
  }, [nodeCount]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05;
      
      // Pulsate nodes
      const sizes = pointsRef.current.geometry.attributes.size;
      if (sizes) {
        for (let i = 0; i < nodeCount; i++) {
          sizes.setX(i, 0.08 + Math.sin(time * 2 + i) * 0.03);
        }
        sizes.needsUpdate = true;
      }
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = time * 0.05;

      // Random signals (flashes on lines)
      const colorAttr = linesRef.current.geometry.attributes.color;
      if (colorAttr && Math.random() > 0.95) {
        const randLine = Math.floor(Math.random() * (lines.length / 2));
        const activeColor = new THREE.Color("#22d3ee");
        colorAttr.setXYZ(randLine * 2, activeColor.r, activeColor.g, activeColor.b);
        colorAttr.setXYZ(randLine * 2 + 1, activeColor.r, activeColor.g, activeColor.b);
        colorAttr.needsUpdate = true;
      }

      // Decay line colors back to base
      if (colorAttr) {
        for (let i = 0; i < colorAttr.count; i++) {
          colorAttr.setX(i, THREE.MathUtils.lerp(colorAttr.getX(i), 0.022, 0.05));
          colorAttr.setY(i, THREE.MathUtils.lerp(colorAttr.getY(i), 0.082, 0.05));
          colorAttr.setZ(i, THREE.MathUtils.lerp(colorAttr.getZ(i), 0.093, 0.05));
        }
        colorAttr.needsUpdate = true;
      }
    }
  });

  const nodeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(new Float32Array(nodeCount).fill(0.08), 1));
    return geo;
  }, [positions, nodeCount]);

  return (
    <group>
      <points ref={pointsRef} geometry={nodeGeometry}>
        <shaderMaterial
          transparent
          depthWrite={false}
          fragmentShader={`
            void main() {
              float d = distance(gl_PointCoord, vec2(0.5));
              if (d > 0.5) discard;
              gl_FragColor = vec4(0.13, 0.83, 0.93, 1.0 - (d * 2.0));
            }
          `}
          vertexShader={`
            attribute float size;
            void main() {
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="index" args={[lines, 1]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
};

// 2. Floating Code Particles
const CodeParticles = () => {
  const count = 50;
  const symbols = ["{", "}", ";", "=>", "async", "await", "const", "import", "()", "[]"];
  
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 5 - 2
      ),
      speed: Math.random() * 0.01 + 0.005,
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y += particles[i].speed;
        if (child.position.y > 8) {
          child.position.y = -8;
          child.position.x = (Math.random() - 0.5) * 15;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <Text
          key={i}
          position={p.position}
          color="rgba(34, 211, 238, 0.3)"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
        >
          {p.symbol}
        </Text>
      ))}
    </group>
  );
};

// 3. Central Hologram
const CentralHologram = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
      
      const targetScale = hovered ? 1.3 : 1.2;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <pointLight color="#22d3ee" intensity={hovered ? 3 : 1.5} distance={5} />
      <Icosahedron
        ref={meshRef}
        args={[1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial 
          color="#22d3ee" 
          wireframe 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending} 
        />
      </Icosahedron>
    </group>
  );
};

// Main Scene Component
const SceneContent = () => {
  const { size } = useThree();
  const isMobile = size.width < 768;

  useFrame((state) => {
    // Camera slowly orbits
    state.camera.position.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 2;
    state.camera.position.z = Math.cos(state.clock.getElapsedTime() * 0.1) * 2 + 5;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <NeuralNetwork isMobile={isMobile} />
      {!isMobile && <CodeParticles />}
      <CentralHologram />
    </>
  );
};

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        dpr={[1, 1.5]} // Optimize for performance while keeping sharpness
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }} // Disable pointer events to prevent blocking UI
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
