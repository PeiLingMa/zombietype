import { useState, useEffect, useCallback } from 'react';
import Options from '../../Option/Option';
import './Navbar.css';
import Log from './Log';

export default function Navbar({ dialogueHistory, onAuto, onSkip, isAuto }) {
  const [isLogVisible, setIsLogVisible] = useState(false);

  const handleLogClick = () => {
    setIsLogVisible(true);
  };

  const handleLogClose = () => {
    setIsLogVisible(false);
  };
  return (
    <div class="navbar">
      <button
        className={`navbar-auto ${isAuto ? 'active' : ''}`}
        onClick={onAuto}
      >
        <p>auto</p>
      </button>
      <button
        className="navbar-skip"
        onClick={onSkip}
      >
        <p>skip</p>
      </button>
      <button
        className="navbar-log"
        onClick={handleLogClick}
      >
        <p>log</p>
      </button>
      <button className="navbar-config">
        <p>config</p>
      </button>

      {isLogVisible && (
        <Log
          dialogueHistory={dialogueHistory} // 傳遞 dialogueHistory
          onClose={handleLogClose} // 傳遞關閉 Log 的函數
        />
      )}
    </div>
  );
}
