import { useState, useEffect, useCallback, useMemo } from 'react';
import sceneData from './script';
import Navbar from './component/Navbar';
import './test.css';
import Question from './component/Question';

export default function StoryMode({ onBack }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [isAuto, setIsAuto] = useState(false); // 自動播放狀態

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

  const handleNext = useCallback(() => {
    if (isTyping) return;
    if (index < sceneData.length - 1) {
      setIndex(index + 1);
    }
  });

  const handleSkip = () => {
    if (isTyping) {
      // 完成打字效果
      setDisplayText(`${currentScene.dialogue}\n`);
      setIsTyping(false);
      return;
    }
    // 跳到最後一個場景 (無論之前是否正在打字，都會跳到最後)
    setIndex(sceneData.length - 1);
  };

  const handleAuto = () => {
    setIsAuto(!isAuto);
  };

  const handleChoiceSelect = (choice) => {
    // TODO:暫時先點擊選項後 handleNext
    handleNext();
  };

  useEffect(() => {
    setDisplayText('');
    setIsTyping(true);
    let i = -1; // avoid missing first word
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

  useEffect(() => {
    if (currentScene?.type === 'question') return; // 遇到問題時，則不執行自動播放
    if (isAuto && !isTyping) {
      const timer = setTimeout(() => {
        handleNext();
      }, 500); // 使用自動播放時，各句子間隔時間
      return () => clearTimeout(timer);
    }
  }, [currentScene.type, isAuto, isTyping, handleNext]);

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
        <Navbar
          dialogueHistory={dialogueHistory}
          onAuto={handleAuto}
          onSkip={handleSkip}
          isAuto={isAuto}
        />
        {/* 對話框 或 Question */}
        {currentScene.type === 'question' ? (
          <Question
            currentScene={currentScene}
            onChoiceSelect={handleChoiceSelect}
            questionText={displayText}
          /> // 渲染 Question 元件
        ) : (
          <div
            className="dialogue-box"
            onClick={handleNext}
          >
            {' '}
            {/* 對話框 UI */}
            <h3>{currentScene.character}</h3>
            <p className="content">{displayText}</p>
            {!isTyping && <span style={{ fontSize: '0.9rem', opacity: 0.5 }}></span>}
          </div>
        )}
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
