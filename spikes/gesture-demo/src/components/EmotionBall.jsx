import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 定义情绪和对应的 HSL 色值
const EMOTIONS = [
  { label: '焦虑', hue: 0 },    // 红
  { label: '疲惫', hue: 30 },   // 橙
  { label: '紧张', hue: 60 },   // 黄
  { label: '平静', hue: 150 },  // 绿
  { label: '放松', hue: 200 },  // 青
  { label: '喜悦', hue: 240 },  // 蓝
];

// 独立的 3D 球体组件
function Sphere({ targetHue, rotationRef }) {
  const meshRef = useRef();

  // 每一帧执行的动画
  useFrame(() => {
    if (!meshRef.current) return;

    // 1. 旋转平滑（阻尼效果）
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      rotationRef.current,
      0.1
    );

    // 2. 颜色平滑过渡
    // 🟢 修改：亮度从 0.5 提高到 0.65，让颜色更明亮
    const targetColor = new THREE.Color().setHSL(targetHue / 360, 0.8, 0.65);
    meshRef.current.material.color.lerp(targetColor, 0.1);
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        roughness={0.15}       // 降低粗糙度，更光滑
        metalness={0.05}       // 🟢 修改：降低金属感，避免暗面发黑
        clearcoat={1}          // 清漆层，模拟果冻/水晶光泽
        clearcoatRoughness={0.1}
        envMapIntensity={1.5}  // 增强环境贴图反射，让亮部更通透
      />
    </mesh>
  );
}

export function EmotionBall({ onChange }) {
  const [emotionIndex, setEmotionIndex] = useState(3); // 默认"平静"
  const [isDragging, setIsDragging] = useState(false);
  
  // 存储旋转状态，供 3D 组件读取
  const rotationRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartRotationRef = useRef(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartRotationRef.current = rotationRef.current;
  };

  // 全局鼠标事件监听
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStartXRef.current;
      
      // 鼠标移动映射到旋转角度
      const rotationDelta = deltaX * 0.005;
      rotationRef.current = dragStartRotationRef.current + rotationDelta;

      // 将角度映射到 0-5 的索引
      const rawIndex = rotationRef.current / (Math.PI * 2);
      let newIndex = Math.floor(rawIndex * EMOTIONS.length) % EMOTIONS.length;
      
      if (newIndex < 0) newIndex += EMOTIONS.length;

      if (newIndex !== emotionIndex) {
        setEmotionIndex(newIndex);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, emotionIndex]);

  // 每次情绪索引变化时，向上层组件传递
  useEffect(() => {
    onChange(EMOTIONS[emotionIndex].label);
  }, [emotionIndex, onChange]);

  const currentEmotion = EMOTIONS[emotionIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      {/* 3D 画布 */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: '240px',
          height: '240px',
          cursor: isDragging ? 'grabbing' : 'grab',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
          {/* 🟢 修改：增强光照，减少暗面 */}
          {/* 1. 环境光：提供基础照明 */}
          <ambientLight intensity={0.8} />
          {/* 2. 半球光：模拟天空和地面的漫反射，极大提升整体亮度 */}
          <hemisphereLight 
            color="#ffffff" 
            groundColor="#e0e0e0" 
            intensity={1.0} 
          />
          {/* 3. 主光源：打出高光和立体感 */}
          <directionalLight position={[5, 5, 5]} intensity={2.5} />
          {/* 4. 补光：从另一侧打光，消除死黑区域 */}
          <directionalLight position={[-3, 3, 2]} intensity={1.0} color="#ffffff" />
          
          {/* 3D 球体 */}
          <Sphere targetHue={currentEmotion.hue} rotationRef={rotationRef} />
        </Canvas>
      </div>

      {/* 情绪文字显示 */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: `hsl(${currentEmotion.hue}, 80%, 45%)`, transition: 'color 0.3s' }}>
          {currentEmotion.label}
        </span>
        <p style={{ color: '#999', fontSize: '13px', marginTop: '8px' }}>
          ← 拖动球体转动，选择情绪 →
        </p >
      </div>
    </div>
  );
}