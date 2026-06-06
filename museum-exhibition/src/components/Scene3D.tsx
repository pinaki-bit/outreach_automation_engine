"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Interactive statue plane component that floats and tilts on mouse move
function InteractiveStatue() {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  // Load the AI generated statue texture
  const texture = useTexture("/greek_statue.png");

  const { mouse, viewport } = useThree();

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();

    // 1. Smoothly tilt the statue based on mouse coordinates
    if (meshRef.current) {
      const targetRotationY = mouse.x * 0.25;
      const targetRotationX = -mouse.y * 0.15;
      const targetPositionX = mouse.x * 0.4;
      const targetPositionY = mouse.y * 0.2;

      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotationY,
        0.05
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotationX,
        0.05
      );
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        targetPositionX,
        0.05
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetPositionY,
        0.05
      );

      // Subtle natural float animation
      meshRef.current.position.y += Math.sin(elapsedTime * 1.5) * 0.003;
    }

    // 2. Pulse the halo ring
    if (haloRef.current) {
      const scalePulse = 1 + Math.sin(elapsedTime * 1.2) * 0.025;
      haloRef.current.scale.setScalar(scalePulse);
      haloRef.current.rotation.z = elapsedTime * 0.08;
    }

    // 3. Move the light based on the mouse to create shifting reflections
    if (lightRef.current) {
      const lightX = mouse.x * viewport.width * 0.5;
      const lightY = mouse.y * viewport.height * 0.5;
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, lightX, 0.08);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, lightY, 0.08);
    }
  });

  return (
    <group>
      {/* Light following mouse cursor */}
      <pointLight
        ref={lightRef}
        intensity={15}
        distance={10}
        color="#c5a880"
        position={[0, 0, 2]}
      />

      {/* Ambient environment light */}
      <ambientLight intensity={0.15} />
      
      {/* Directional backlight for volumetric glow */}
      <directionalLight position={[0, 5, -5]} intensity={2} color="#ffffff" />

      {/* Glowing Halo Ring */}
      <mesh ref={haloRef} position={[0, 0, -0.6]}>
        <ringGeometry args={[1.7, 1.72, 80]} />
        <meshBasicMaterial
          color="#c5a880"
          side={THREE.DoubleSide}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Subtle outer secondary halo for bloom effect */}
      <mesh position={[0, 0, -0.62]}>
        <ringGeometry args={[1.68, 1.74, 80]} />
        <meshBasicMaterial
          color="#c5a880"
          side={THREE.DoubleSide}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Statue Centerpiece Mesh */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[2.7, 3.4]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.15}
          metalness={0.1}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
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
    <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <InteractiveStatue />
      </Canvas>
    </div>
  );
}
