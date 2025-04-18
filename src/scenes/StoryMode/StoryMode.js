import { useState, useEffect, useCallback } from 'react';
// import scenes from './script';
import Navbar from './component/Navbar';
import './test.css';
import Question from './component/Question';

export default function StoryMode({ scenes, onBack }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [isAuto, setIsAuto] = useState(false); // 自動播放狀態

  const currentScene = scenes[index];

  const updateDialogueHistory = (character, dialogue) => {
    if (currentScene) {
      setDialogueHistory((prevHistory) => [
        ...prevHistory,
        { character: character, dialogue: dialogue } // 將當前對話加入紀錄
      ]);
      // console.log('對話紀錄', currentScene.character, currentScene.dialogue);
    }
  };

  const handleNext = useCallback(() => {
    // TODO: Add story end handling
    if (isTyping) return;
    if (index < scenes.length - 1) {
      setIndex(index + 1);
    }
  });

  const handleSkip = () => {
    if (isTyping) {
      // 完成打字效果
      setIsTyping(false);
      return;
    }
    let tempIndex = index;

    while (tempIndex < scenes.length - 1) {
      const sceneToSkip = scenes[tempIndex];
      if (sceneToSkip) {
        updateDialogueHistory(sceneToSkip.character, sceneToSkip.dialogue); // 更新對話紀錄
        // console.log('對話紀錄', sceneToSkip.character, sceneToSkip.dialogue);
        setDisplayText(`${sceneToSkip.dialogue}\n`); // 立即顯示完整對話
      }
      if (scenes[tempIndex + 1]?.type === 'question') {
        // 預先檢查下一個場景是否為問題，如果是則停止跳過
        break;
      }
      tempIndex++;
    }
    setIndex(tempIndex < scenes.length - 1 ? tempIndex + 1 : scenes.length - 1); // 確保 index 不超出範圍
    setIsTyping(false);
  };

  const handleAuto = () => {
    setIsAuto(!isAuto);
  };

  const handleChoiceSelect = (choice) => {
    updateDialogueHistory('You choosed: ', `[${choice.text}]`); // save choice to history
    const nextIndex = choice.nextIndex; // get nextIndex from choice

    // validate nextIndex
    if (nextIndex !== undefined && nextIndex >= 0 && nextIndex < scenes.length) {
      setIndex(nextIndex); // 跳轉到指定的索引
    } else {
      // if nextIndex is invalid or not specified then forward to next scene and log error
      if (index < scenes.length - 1) setIndex(index + 1); // 默認前進
      console.error('Invalid nextIndex:', nextIndex);
    }
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
        updateDialogueHistory(currentScene.character, currentScene.dialogue);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [index]);

  useEffect(() => {
    if (currentScene?.type === 'question') return;
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
