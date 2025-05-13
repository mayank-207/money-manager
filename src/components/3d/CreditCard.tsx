import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const CreditCard = ({ balance }: { balance: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.getElapsedTime()) * 0.1;
    }
  });

  const { scale } = useSpring({
    from: { scale: 0 },
    to: { scale: 1 },
    config: { tension: 280, friction: 60 }
  });

  return (
    <animated.mesh
      ref={meshRef}
      scale-x={scale}
      scale-y={scale}
      scale-z={scale}
      position={[0, 0, 0]}
    >
      <boxGeometry args={[3, 2, 0.1]} />
      <meshStandardMaterial
        color="#0A84FF"
        metalness={0.8}
        roughness={0.2}
      />
      <Text
        position={[0, 0.2, 0.06]}
        fontSize={0.2}
        color="white"
      >
        Balance
      </Text>
      <Text
        position={[0, -0.2, 0.06]}
        fontSize={0.3}
        color="white"
      >
        ${balance.toLocaleString()}
      </Text>
    </animated.mesh>
  );
};

export default CreditCard;