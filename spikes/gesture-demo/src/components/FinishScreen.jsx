import React, { useState, useCallback } from 'react';
import { EmotionBall } from './EmotionBall';
import { supabase } from '../supabaseClient'; 

export function FinishScreen({ userData, sessionStats, onRestart }) {
  const [emotionAfter, setEmotionAfter] = useState(userData.emotionBefore || '平静');
  const [isSaving, setIsSaving] = useState(false);

  const handleEmotionChange = useCallback((newEmotion) => {
    setEmotionAfter(newEmotion);
  }, []);

  const handleFinish = async () => {
    setIsSaving(true);
    
    // 数据库字段映射
    const recordToCloud = {
      username: userData.username,
      before_emotion: userData.emotionBefore || '未记录',
      after_emotion: emotionAfter,
      duration: sessionStats?.duration || 0,
      palm_count: sessionStats?.palmCount || 0,   // 确认这里对应数据库的列名
      swipe_count: sessionStats?.swipeCount || 0, // 确认这里对应数据库的列名
      soundscape: sessionStats?.soundscape || '未知'
    };

    // 本地备份
    const localRecord = { ...recordToCloud, date: new Date().toISOString() };
    const history = JSON.parse(localStorage.getItem('mindful_history') || '[]');
    history.push(localRecord);
    localStorage.setItem('mindful_history', JSON.stringify(history));

    // 云端入库
    try {
      const { error } = await supabase.from('mindful_records').insert([recordToCloud]);

      if (error) {
        console.error("云端保存失败:", error);
        alert("数据已保存在本地，但云端同步失败，请检查网络或字段名。");
      } else {
        console.log("云端保存成功！");
      }
    } catch (err) {
      console.error("请求异常:", err);
    }

    setIsSaving(false);
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
        disabled={isSaving}
        style={{ 
          marginTop: '40px', padding: '12px 40px', borderRadius: '25px', 
          backgroundColor: isSaving ? '#ccc' : '#007BFF', 
          color: 'white', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '16px' 
        }}
      >
        {isSaving ? '保存中...' : '保存记录并返回'}
      </button>
    </div>
  );
}