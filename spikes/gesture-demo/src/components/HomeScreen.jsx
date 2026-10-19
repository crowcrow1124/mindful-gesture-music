import React, { useState, useCallback } from 'react';
import { EmotionBall } from './EmotionBall';

export function HomeScreen({ onStartSession, onOpenDeveloperMode }) {
  const [username, setUsername] = useState('');
  const [emotion, setEmotion] = useState('平静');

  const handleEmotionChange = useCallback((newEmotion) => {
    setEmotion(newEmotion);
  }, []);

  const handleStart = () => {
    onStartSession(username || '匿名用户', emotion);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <h1 style={{ fontWeight: 200, color: '#333', letterSpacing: '2px' }}>手势正念空间</h1>
      <p style={{ color: '#888', marginBottom: '40px' }}>用最简单的手势，回归内心的平静。</p >

      <input 
        type="text" 
        placeholder="输入你的名字（选填）" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: '12px 20px', borderRadius: '20px', border: '1px solid #ddd',
          outline: 'none', fontSize: '16px', width: '240px', marginBottom: '40px',
          textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.8)'
        }}
      />

      <EmotionBall onChange={handleEmotionChange} />

      <button 
        onClick={handleStart}
        style={{ 
          marginTop: '40px', padding: '15px 50px', fontSize: '18px', borderRadius: '30px', 
          backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        进入正念空间
      </button>

      <button 
        onClick={onOpenDeveloperMode}
        style={{
          marginTop: '60px', padding: '8px 16px', fontSize: '12px', 
          backgroundColor: 'transparent', color: '#bbb', border: '1px solid #eee', 
          borderRadius: '15px', cursor: 'pointer'
        }}
      >
        开发者模式
      </button>
    </div>
  );
}