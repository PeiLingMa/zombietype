// FIXME: 把 StoryMode .css的風格整合
// 以下是步驟
// Option.css的色碼提出作為全域var
// 修改Storymode folder下的其他css ui風格儘量使用，貼近 全域var(必要時可以增加不在Option.css的色碼到全域var) */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './test.css';
import Options from '../Option/Option';
import Navbar from './component/Navbar';
import InputFrame from './component/InputFrame';
import StoryEndPopup from './component/StoryEndPopup';
import { useSound } from './hooks/useSound';
import { useVolumeControl } from '../../context/GameSettingsContext';

import useStoryProgress from './hooks/useStoryProgress';
import useTypingEffect from './hooks/useTypingEffect';
import useStoryNavigation from './hooks/useStoryNavigation';

import streetBg from './images/story1/street.png';
import schoolBg from './images/story2/school.jpg';
import officeBg from './images/story3/office.jpg';

export default function StoryMode({ storyId, scenes, onBack, onStoryEnd }) {

  const storyBackgrounds = {
    story3: {
      backgroundImage: `url(${streetBg})`,
    },
    story4: {
      backgroundImage: `url(${schoolBg})`,
    },
    story5: {
      backgroundImage: `url(${officeBg})`,
    }
  };

  const backgroundStyle = useMemo(() => {
    console.log('storyId:', storyId);
    const bg = storyBackgrounds[storyId];
    console.log('bg:', bg);
    // 確保 bg 存在且有 backgroundImage 屬性
    if (!bg || !bg.backgroundImage) {
        console.warn(`No background image defined for storyId: ${storyId}`);
        return {}; // 返回空物件，不設定背景
    }
    return {
      backgroundImage: bg.backgroundImage,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center'
    };
  }, [storyId]);


  // Sound management，依賴 soundManager 和 volume
  const soundManager = useSound();
  const { volume } = useVolumeControl();
  useEffect(() => {
    if (soundManager && typeof soundManager.setMasterVolume === 'function') {
      console.log('StoryMode setting master volume:', volume);
      soundManager.setMasterVolume(volume);
    }
  }, [soundManager, volume]);

  useEffect(() => {
    soundManager?.playSound('background');
  }, [soundManager]);

  const { storyProgress, setStoryProgress, initialSceneId } = useStoryProgress({ storyId, scenes });

  const [currentSceneId, setCurrentSceneId] = useState(initialSceneId);

  const [dialogueHistory, setDialogueHistory] = useState([]);
  const dialogueHistoryRef = useRef([]);
  useEffect(() => {
    dialogueHistoryRef.current = dialogueHistory;
  }, [dialogueHistory]);

  const [isAuto, setIsAuto] = useState(false); // 自動播放狀態

  const sceneMap = useMemo(() => {
    if (!scenes) return {};
    return scenes.reduce((map, scene) => {
      map[scene.id] = scene;
      // console.log(scene.id, scene);

      return map;
    }, {});
  }, [scenes]);
  const currentScene = sceneMap[currentSceneId] ?? scenes[initialSceneId]; // 確保 currentScene 不為 undefined

  const [showStoryEndPopup, setShowStoryEndPopup] = useState(false); // 控制故事結束彈出視窗的顯示狀態

  const storyProgressRef = useRef(storyProgress);

  const handleStoryEnd = useCallback(() => {
    if (showStoryEndPopup) return;
    console.log('故事結束');
    setStoryProgress((prev) => ({
      ...prev,
      endTime: new Date().toISOString() // log end time
    }));
    setShowStoryEndPopup(true);
    if (onStoryEnd) onStoryEnd();
  }, [setStoryProgress, showStoryEndPopup, onStoryEnd]);

  useEffect(() => {
    storyProgressRef.current = storyProgress;
  }, [storyProgress]);

  const { displayedText, isTyping, skipTyping } = useTypingEffect(currentScene.dialogue);

  /**
   *
   * @param {string} character
   * @param {string} dialogue
   */
  const updateDialogueHistory = (character, dialogue) => {
    // don't save if already in history
    const latestHistory = dialogueHistoryRef.current[dialogueHistoryRef.current.length - 1];
    if (
      latestHistory &&
      latestHistory.dialogue === dialogue &&
      latestHistory.character === character
    )
      return;

    const history = {
      character: character,
      dialogue: dialogue
    };
    // update dialogueHistory in log and storyProgress
    setDialogueHistory((prev) => [...prev, history]);
    setStoryProgress((prev) => ({
      ...prev,
      dialogueHistory: [...prev.dialogueHistory, history]
    }));
  };

  const handleAuto = () => {
    setIsAuto(!isAuto);
  };

  const { handleAdvance, handleSkip, handleAnswerSubmit } = useStoryNavigation({
    storyId,
    currentScene,
    scenes,
    setStoryProgress,
    updateDialogueHistory,
    handleStoryEnd
  });

  useEffect(() => {
    if (storyProgress.currentSceneId !== currentSceneId) {
      setCurrentSceneId(storyProgress.currentSceneId);
    }
    // handle history update when storyProgress changes
    if (storyProgress.dialogueHistory.length !== dialogueHistory.length) {
      setDialogueHistory(storyProgress.dialogueHistory);
    }
  }, [storyProgress, currentSceneId, dialogueHistory.length]);

  // log dialogue scenes after typing finished
  useEffect(() => {
    if (
      currentScene &&
      currentScene.dialogue && // 確保有對話內容
      isTyping === false // false after typing finished
    ) {
      updateDialogueHistory(currentScene.character, currentScene.dialogue);
    }
  }, [isTyping]);
  // auto play
  useEffect(() => {
    if (currentScene?.type === 'question') return;
    if (isAuto && !isTyping) {
      const timer = setTimeout(() => {
        handleAdvance();
      }, 500); // 使用自動播放時，各句子間隔時間
      return () => clearTimeout(timer);
    }
  }, [currentScene?.type, isAuto, isTyping, handleAdvance]);

  const handleDialogueClick = useCallback(() => {
    // advances or skips typing
    if (isTyping) skipTyping();
    else handleAdvance();
  }, [isTyping, skipTyping, handleAdvance]);

  const handleKeyDown = useCallback(
    // Keyboard event listener
    (event) => {
      // Trigger handleNext on Enter if not typing and not a question scene
      if (event.key === 'Enter' && !isTyping && currentScene?.type !== 'question') {
        handleAdvance();
      }
      // Enter key handling for question scenes is in InputFrame
    },
    [currentScene?.type, handleDialogueClick]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // Dependency is handleKeyDown

  // config in navbar
  const [showOptions, setShowOptions] = useState(false);
  const handleOpenConig = useCallback(() => {
    setShowOptions(true);
  });
  if (showOptions) {
    // render the Options component
    return <Options onBack={() => setShowOptions(false)} />;
  }

  return (
    <div className="story-mode cutscene-container" style={backgroundStyle}>
      <div className="ratio-container">
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
          onConfig={handleOpenConig}
        />
        {/* 對話框 或 Question */}
        {currentScene.type === 'question' ? (
          <InputFrame
            currentScene={currentScene}
            questionText={displayedText}
            isTyping={isTyping}
            onClick={skipTyping}
            onAnswerSubmit={handleAnswerSubmit}
            // updateDialogueHistory={updateDialogueHistory} // moved to useStoryNavigation
          />
        ) : (
          <div
            className="dialogue-box"
            onClick={handleDialogueClick}
          >
            {' '}
            {/* 對話框 UI */}
            <h3>{currentScene.character}</h3>
            <p className="content">{displayedText}</p>
            {!isTyping && currentScene.dialogue && (
              <span
                style={{
                  fontSize: '1rem',
                  opacity: 0.5,
                  position: 'absolute',
                  bottom: '10px',
                  right: '20px' // transition not working
                }}
              >
                Click or press Enter to continue...
              </span>
            )}
          </div>
        )}
        {/* 返回按鈕放在畫面外 */}
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          {' '}
          {/* 返回按鈕位置可能需要調整，看是否要放在 16:9 區域內 */}
          <button
            className="btn-info1 px-4 py-2"
            onClick={(e) => {
              e.stopPropagation(); // 避免點擊觸發對話切換
              onBack();
            }}
          >
            Back Menu
          </button>
        </div>
        <StoryEndPopup
          isVisible={showStoryEndPopup}
          message="故事結束"
          onConfirm={() => {
            localStorage.removeItem(`storyProgress_${storyId}`);
            onBack();
          }}
        />
      </div>
    </div>
  );
}
