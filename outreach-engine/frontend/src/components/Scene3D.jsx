import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Dynamic glowing network node orbit scene
function InteractiveNetwork() {
  const coreRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);
  const particlesRef = useRef(null);
  const lightRef = useRef(null);

  const { mouse, viewport } = useThree();

  // Generate random particles (representing lead nodes)
  const particleCount = 60;
  const positions = new Float32Array(particleCount * 3);
  const randomSpeeds = [];
  
  for (let i = 0; i < particleCount; i++) {
    // Distribute particles in a spherical volume around the core
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 1.2 + Math.random() * 1.5; // Radius between 1.2 and 2.7
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    randomSpeeds.push({
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05,
      z: (Math.random() - 0.5) * 0.05,
    });
  }

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();

    // 1. Tilt and move the entire group based on mouse movement
    if (coreRef.current) {
      // Rotate the core sphere
      coreRef.current.rotation.y = elapsedTime * 0.3;
      coreRef.current.rotation.x = elapsedTime * 0.15;
      
      // Pulse the core scale slightly
      const pulse = 1.0 + Math.sin(elapsedTime * 2.5) * 0.06;
      coreRef.current.scale.setScalar(pulse);
    }

    // 2. Rotate orbiting rings in opposite directions
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = elapsedTime * 0.4;
      ring1Ref.current.rotation.y = elapsedTime * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -elapsedTime * 0.5;
      ring2Ref.current.rotation.z = elapsedTime * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = -elapsedTime * 0.3;
      ring3Ref.current.rotation.x = -elapsedTime * 0.4;
    }

    // 3. Move the light based on the mouse to create shifting reflections
    if (lightRef.current) {
      const lightX = mouse.x * viewport.width * 0.5;
      const lightY = mouse.y * viewport.height * 0.5;
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, lightX, 0.08);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, lightY, 0.08);
    }

    // 4. Subtle rotation on particles group
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsedTime * 0.05;
      particlesRef.current.rotation.x = elapsedTime * 0.02;
    }
  });

  return (
    <group>
      {/* Light following mouse cursor */}
      <pointLight
        ref={lightRef}
        intensity={10}
        distance={15}
        color="#c5a880"
        position={[0, 0, 3]}
      />

      {/* Ambient environment light */}
      <ambientLight intensity={0.2} />
      
      {/* Directional backlight for high contrast cyber/network shadows */}
      <directionalLight position={[5, 5, -5]} intensity={1.5} color="#c5a880" />
      <directionalLight position={[-5, -5, 5]} intensity={1.0} color="#ffffff" />

      {/* 1. Core Data Hub Sphere */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          color="#c5a880"
          emissive="#735123"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </mesh>
      
      {/* Glowing inner core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* 2. Orbiting Torus Rings */}
      {/* Torus 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.2, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#c5a880"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Torus 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.5, 0.012, 16, 100]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Torus 3 */}
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[1.8, 0.01, 16, 100]} />
        <meshStandardMaterial
          color="#c5a880"
          transparent
          opacity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* 3. Orbiting Data Lead Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.8}
        />
      </points>

      {/* Decorative connection links (subtle line structures) */}
      <group rotation={[0, 0, 0]}>
        <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
          <ringGeometry args={[1.48, 1.5, 6]} />
          <meshBasicMaterial color="#c5a880" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, -Math.PI / 6, Math.PI / 2]}>
          <ringGeometry args={[1.18, 1.2, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export default function Scene3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="scene3d-container">
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <InteractiveNetwork />
      </Canvas>
    </div>
  );
}
