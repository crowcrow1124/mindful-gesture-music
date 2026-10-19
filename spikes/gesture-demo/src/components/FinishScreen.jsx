import React, { useState, useCallback } from 'react';
import { EmotionBall } from './EmotionBall';

export function FinishScreen({ userData, sessionStats, onRestart }) {
  const [emotionAfter, setEmotionAfter] = useState(userData.emotionBefore || '平静');

  const handleEmotionChange = useCallback((newEmotion) => {
    setEmotionAfter(newEmotion);
  }, []);

  const handleFinish = () => {
    const record = {
      date: new Date().toISOString(),
      username: userData.username,
      before: userData.emotionBefore || '未记录',
      after: emotionAfter,
      duration: sessionStats?.duration || 0,
      palmCount: sessionStats?.palmCount || 0,
      swipeCount: sessionStats?.swipeCount || 0,
      soundscape: sessionStats?.soundscape || '未知'
    };

    const history = JSON.parse(localStorage.getItem('mindful_history') || '[]');
    history.push(record);
    localStorage.setItem('mindful_history', JSON.stringify(history));
    console.log("保存本次正念记录:", record);

    onRestart();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <h2 style={{ fontWeight: 300, color: '#333' }}>正念结束</h2>
      <p style={{ color: '#888' }}>感谢你，{userData.username}。</p >
      
      {sessionStats && (
        <div style={{ display: 'flex', gap: '20px', margin: '20px 0', color: '#555', fontSize: '14px' }}>
          <span>正念时长：<b>{sessionStats.duration}秒</b></span>
          <span>深呼吸次数：<b>{sessionStats.palmCount}次</b></span>
          <span>切音景次数：<b>{sessionStats.swipeCount}次</b></span>
        </div>
      )}

      <p style={{ color: '#aaa', fontSize: '14px', marginTop: '20px', marginBottom: '10px' }}>
        开始时你感到「{userData.emotionBefore}」，现在呢？
      </p >

      <EmotionBall onChange={handleEmotionChange} />

      <button 
        onClick={handleFinish}
        style={{ marginTop: '40px', padding: '12px 40px', borderRadius: '25px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}
      >
        保存记录并返回
      </button>
    </div>
  );
}