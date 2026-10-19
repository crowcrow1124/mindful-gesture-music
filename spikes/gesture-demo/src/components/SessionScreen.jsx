import React, { useEffect, useRef, useState } from 'react';
import { useHandGestures } from '../hooks/useHandGestures';
import { AudioEngine } from '../audio/AudioEngine';

export function SessionScreen({ userData, onEnd }) {
  const audioEngineRef = useRef(new AudioEngine());
  const { videoRef, canvasRef, isLoaded, isStarted, isOpenPalm, swipeDirection, errorMsg, startCamera } = useHandGestures();
  
  const [soundscapeName, setSoundscapeName] = useState('');

  // 当手势状态变化时，控制音频
  useEffect(() => {
    if (!isStarted) return;
    
    if (isOpenPalm) {
      audioEngineRef.current.play();
    } else {
      audioEngineRef.current.stop();
    }
  }, [isOpenPalm, isStarted]);

  // 监听挥手动作，切换音景
  useEffect(() => {
    if (!isStarted || !swipeDirection) return;
    
    if (swipeDirection === 'right') {
      audioEngineRef.current.switchSoundscape('next');
    } else if (swipeDirection === 'left') {
      audioEngineRef.current.switchSoundscape('prev');
    }
    setSoundscapeName(audioEngineRef.current.getCurrentSoundscapeName());
  }, [swipeDirection, isStarted]);

  const handleStart = async () => {
    await audioEngineRef.current.init();
    audioEngineRef.current.startAmbience();
    await startCamera();
    setSoundscapeName(audioEngineRef.current.getCurrentSoundscapeName());
  };

  const handleEnd = () => {
    audioEngineRef.current.stopAmbience();
    onEnd(); // 调用父组件传进来的结束函数
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40, fontFamily: 'sans-serif' }}>
      <h2 style={{ fontWeight: 300, color: '#555' }}>正念呼吸</h2>
      
      {userData?.username && (
        <p style={{ color: '#888', marginBottom: '20px' }}>欢迎，{userData.username}</p >
      )}

      {!isLoaded && <p style={{ color: '#888' }}>正在加载 AI 模型...</p >}
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p >}

      {isLoaded && !isStarted && (
        <button 
          onClick={handleStart}
          style={{ padding: '15px 40px', fontSize: '18px', borderRadius: '30px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px' }}
        >
          开始正念
        </button>
      )}

      {isStarted && (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
          
          <p style={{ color: '#007BFF', fontWeight: 'bold', marginBottom: '10px' }}>
            当前音景：{soundscapeName}
          </p >

          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: isOpenPalm ? 'rgba(0, 123, 255, 0.4)' : 'rgba(200, 200, 200, 0.4)',
            transform: isOpenPalm ? 'scale(1.5)' : 'scale(1)',
            transition: 'transform 3s ease-in-out, background-color 3s ease-in-out',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 30px rgba(0,0,0,0.1)'
          }}>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{isOpenPalm ? '吸气' : '呼气'}</span>
          </div>
          
          <p style={{ marginTop: '20px', color: '#666' }}>张开手掌吸气，握拳呼气</p >
          <p style={{ color: '#666', fontSize: '14px' }}>左右挥手切换音景</p >
          
          <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, opacity: 0.01, pointerEvents: 'none' }}>
            <video ref={videoRef} style={{ width: 320, height: 240 }} autoPlay playsInline muted />
            <canvas ref={canvasRef} style={{ width: 320, height: 240 }} />
          </div>

          <button 
            onClick={handleEnd}
            style={{ marginTop: '30px', padding: '10px 20px', borderRadius: '20px', backgroundColor: '#f0f0f0', border: 'none', cursor: 'pointer' }}
          >
            结束本次正念
          </button>
        </div>
      )}
    </div>
  );
}