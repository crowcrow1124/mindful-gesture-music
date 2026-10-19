import React, { useState, useEffect } from 'react';

export function HistoryScreen({ onBack }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('mindful_history') || '[]');
    // 按时间倒序排列（最新的在最上面）
    setHistory(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const handleClear = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可逆。')) {
      localStorage.removeItem('mindful_history');
      setHistory([]);
      alert('数据已清空');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 300, color: '#333', fontSize: '20px' }}>开发者模式：用户数据面板</h2>
        <div>
          <button 
            onClick={handleClear}
            style={{ marginRight: '10px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}
          >
            清空数据
          </button>
          <button 
            onClick={onBack}
            style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}
          >
            返回首页
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '50px', fontSize: '14px' }}>暂无历史记录。去完成一次正念吧！</p >
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontSize: '13px', color: '#444' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', textAlign: 'left', color: '#666', fontSize: '12px' }}>
              <th style={{ padding: '10px', fontWeight: 500 }}>记录时间</th>
              <th style={{ padding: '10px', fontWeight: 500 }}>用户名</th>
              <th style={{ padding: '10px', fontWeight: 500 }}>情绪变化</th>
              <th style={{ padding: '10px', fontWeight: 500 }}>时长(秒)</th>
              <th style={{ padding: '10px', fontWeight: 500 }}>深呼吸次数</th>
              <th style={{ padding: '10px', fontWeight: 500 }}>切音景次数</th>
              <th style={{ padding: '10px', fontWeight: 500 }}>最终音景</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 10px', color: '#888' }}>
                  {new Date(record.date).toLocaleString()}
                </td>
                <td style={{ padding: '8px 10px' }}>{record.username}</td>
                
                {/* 🟢 恢复情绪变化列 */}
                <td style={{ padding: '8px 10px' }}>
                  <span style={{ color: '#ff7875' }}>{record.before}</span>
                  <span style={{ margin: '0 4px', color: '#ccc' }}>→</span>
                  <span style={{ color: '#52c41a', fontWeight: 500 }}>{record.after}</span>
                </td>
                
                <td style={{ padding: '8px 10px', color: '#007BFF', fontWeight: 500 }}>{record.duration}s</td>
                <td style={{ padding: '8px 10px' }}>{record.palmCount}</td>
                <td style={{ padding: '8px 10px' }}>{record.swipeCount}</td>
                <td style={{ padding: '8px 10px', color: '#888' }}>{record.soundscape}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}