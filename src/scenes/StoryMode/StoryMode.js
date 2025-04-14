import { useState, useEffect } from 'react';
import sceneData from './script';
import Navbar from './component/Navbar';
import './test.css';

export default function StoryMode({ onBack }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState([]);

  const currentScene = sceneData[index];

  const updateDialogueHistory = (character, dialogue) => {
    if (currentScene) {
      setDialogueHistory((prevHistory) => [
        ...prevHistory,
        { character: currentScene.character, dialogue: currentScene.dialogue } // 將當前對話加入紀錄
      ]);
      console.log('對話紀錄', currentScene.character, currentScene.dialogue);
    }
  };

  useEffect(() => {
    let i = 0;
    setDisplayText('');
    setIsTyping(true);
    const interval = setInterval(() => {
      if (currentScene && currentScene.dialogue && i < currentScene.dialogue.length - 1) {
        // 確保 currentScene 和 currentScene.dialogue 存在
        setDisplayText((prev) => prev + currentScene.dialogue[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        updateDialogueHistory(currentScene.character, currentScene.dialogue); // 更新對話紀錄
      }
    }, 40);
    return () => clearInterval(interval);
  }, [index]);

  const handleNext = () => {
    if (isTyping) return;
    if (index < sceneData.length - 1) {
      setIndex(index + 1);
    }
  };

  return (
    <div className="cutscene-container">
      <div className="ratio-container">
        <h1 className="mb-4">THIS IS STORYMODE PAGE</h1> {/* 確保標題在比例容器內 */}
        {/* Cutscene 圖片角色 */}
        <img
          src={currentScene.image}
          alt={currentScene.character}
          className="character"
        />
        <Navbar dialogueHistory={dialogueHistory} />
        {/* 對話框 */}
        <div
          className="dialogue-box"
          onClick={handleNext}
        >
          <h3>{currentScene.character}</h3>
          <p className="content">{displayText}</p>
          {!isTyping && <span style={{ fontSize: '0.9rem', opacity: 0.5 }}></span>}
        </div>
        {/* 返回按鈕放在畫面外 */}
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          {' '}
          {/* 返回按鈕位置可能需要調整，看是否要放在 16:9 區域內 */}
          <button
            className="btn btn-info px-4 py-2 fw-bold"
            onClick={(e) => {
              e.stopPropagation(); // 避免點擊觸發對話切換
              onBack();
            }}
          >
            Back Menu
          </button>
        </div>
      </div>
    </div>
  );
}
