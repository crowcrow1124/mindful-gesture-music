import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { SessionScreen } from './components/SessionScreen';
import { FinishScreen } from './components/FinishScreen';
import { HistoryScreen } from './components/HistoryScreen';

function App() {
  const [sessionState, setSessionState] = useState('idle'); 
  
  const [userData, setUserData] = useState({
    username: '匿名用户',
    emotionBefore: '平静'
  });
  
  const [sessionStats, setSessionStats] = useState(null);

  const handleStartSession = (username, emotionBefore) => {
    setUserData({ username, emotionBefore });
    setSessionState('running');
  };

  const handleEndSession = (stats) => {
    setSessionStats(stats);
    setSessionState('finished');
  };

  const handleRestart = () => {
    setSessionState('idle');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    }}>
      {sessionState === 'idle' && (
        <HomeScreen 
          onStartSession={handleStartSession} 
          onOpenDeveloperMode={() => setSessionState('developer')} 
        />
      )}

      {sessionState === 'running' && (
        <SessionScreen userData={userData} onEnd={handleEndSession} />
      )}

      {sessionState === 'finished' && (
        <FinishScreen userData={userData} sessionStats={sessionStats} onRestart={handleRestart} />
      )}

      {sessionState === 'developer' && (
        <HistoryScreen onBack={handleRestart} />
      )}
    </div>
  );
}

export default App;