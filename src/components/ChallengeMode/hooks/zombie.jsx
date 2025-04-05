import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export const Zombie = ({ charge }) => {
  const { scene } = useGLTF("/zombie.glb");
  const modelRef = useRef();

  // 模型加載後調整位置和尺寸
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.set(0, -Math.PI/2, 0);
      
      // 調整模型尺寸使其完全可見
      modelRef.current.scale.set(1, 1, 1);
    }
  }, []);

  return (
    <primitive object={scene} ref={modelRef} />
  );
}

useGLTF.preload('/zombie.glb')