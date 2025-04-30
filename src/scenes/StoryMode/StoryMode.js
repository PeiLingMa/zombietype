// FIXME: currently, scenes navigation is using array index instead of scene.id, pls fix
// TOOD: duplicate history, pls bring up an issue and fix it later
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './test.css';
import Options from '../Option/Option';
import Navbar from './component/Navbar';
import InputFrame from './component/InputFrame';
import StoryEndPopup from './component/StoryEndPopup';

import useStoryProgress from './hooks/useStoryProgress';
export default function StoryMode({ storyId, scenes, onBack, onStoryEnd }) {
  const { storyProgress, setStoryProgress, initialSceneId, initialDialogueHistory } =
    useStoryProgress({ storyId, scenes });
  // const [index, setIndex] = useState(0);
  const [currentSceneId, setCurrentSceneId] = useState(initialSceneId);

  const [currentDialogueText, setCurrentDialogueText] = useState('');
  const [displayedCharacterCount, setDisplayedCharacterCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const dialogueHistoryRef = useRef([]);
  useEffect(() => {
    dialogueHistoryRef.current = dialogueHistory;
  }, [dialogueHistory]);

  const [isAuto, setIsAuto] = useState(false); // 自動播放狀態

  // const currentScene = scenes ? scenes[index] : null;

  const sceneMap = useMemo(() => {
    if (!scenes) return {};
    return scenes.reduce((map, scene) => {
      map[scene.id] = scene;
      // console.log(scene.id, scene);

      return map;
    }, {});
  }, [scenes]);
  const currentScene = sceneMap[currentSceneId];
  // const currentIndex = scenes ? scenes.findIndex((scene) => scene.id === currentSceneId) : -1;

  const [showStoryEndPopup, setShowStoryEndPopup] = useState(false); // 控制故事結束彈出視窗的顯示狀態

  const storyProgressRef = useRef(storyProgress);

  const hasLoadedProgress = useRef(false);

  const handleStoryEnd = useCallback(() => {
    if (showStoryEndPopup) return;
    console.log('故事結束');
    setStoryProgress((prev) => ({
      ...prev,
      endTime: new Date().toISOString() // log end time
    }));
    setShowStoryEndPopup(true);
    if (onStoryEnd) onStoryEnd();
  }, [showStoryEndPopup, onStoryEnd]);

  useEffect(() => {
    storyProgressRef.current = storyProgress;
  }, [storyProgress]);

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

  const handleNext = useCallback((index) => {
    // console.log(currentSceneId, currentScene);
    if (
      currentScene?.type !== undefined &&
      (currentScene?.type === 'correctED' || currentScene?.type === 'wrongED')
    ) {
      console.log(currentScene?.type);
      handleStoryEnd();
      return;
    }
    if (isTyping) {
      // stop typing effect and show full text
      setIsTyping(false);
      setDisplayedCharacterCount(currentDialogueText.length);
      updateDialogueHistory(currentScene.character, currentScene.dialogue);
      return;
    }
    const nextIndex = index ?? currentSceneId + 1;
    // console.log(nextIndex);
    if (nextIndex) {
      // console.log(nextIndex);
      setStoryProgress((prev) => ({ ...prev, currentSceneId: nextIndex }));
      // setIndex(nextIndex);
      setCurrentSceneId(nextIndex); // update current scene id
    } else {
      handleStoryEnd();
    }
  });

  const handleSkip = useCallback(() => {
    if (scenes[currentSceneId].type === 'question') return;

    let tempIndex = currentSceneId;
    let avoidFirst = isTyping ? false : true; // avoid logging first scene

    const skippedDialogues = []; // cache skipped dialogues
    while (tempIndex < scenes.length - 1) {
      if (avoidFirst) {
        avoidFirst = false;
        tempIndex++;
        continue;
      }
      const sceneToSkip = scenes[tempIndex];
      if (sceneToSkip) {
        updateDialogueHistory(sceneToSkip.character, sceneToSkip.dialogue); // 更新對話紀錄
        // setDisplayText(`${sceneToSkip.dialogue}\n`); // 立即顯示完整對話
      }
      if (scenes[tempIndex + 1]?.type === 'question') {
        // 預先檢查下一個場景是否為問題，如果是則停止跳過
        break;
      }
      tempIndex++;
    }

    // add cached dialogues to history
    setDialogueHistory((prevHistory) => [...prevHistory, ...skippedDialogues]);
    setStoryProgress((prev) => ({
      ...prev,
      currentSceneId: tempIndex + 1, // question index
      dialogueHistory: [...prev.dialogueHistory, ...skippedDialogues]
    }));
    console.log('handleSkip:', storyProgress);

    if (tempIndex < scenes.length - 1) {
      // setIndex(tempIndex + 1);
      setCurrentSceneId(scenes[tempIndex + 1].id);
    } else {
      handleStoryEnd();
    }
    setIsTyping(false);
  }, [currentSceneId, scenes, isTyping, currentScene, handleStoryEnd]);

  const handleAuto = () => {
    setIsAuto(!isAuto);
  };

  /**
   * Handle answer submitted from InputFrame
   * @param {boolean} isCorrect
   * @param {string} trimmedInput
   */
  const handleAnswerSubmit = useCallback(
    (isCorrect, trimmedInput) => {
      setStoryProgress((prev) => ({
        ...prev,
        answers: [
          ...prev.answers,
          {
            sceneIndex: currentSceneId,
            chosenText: trimmedInput,
            isCorrect: isCorrect.isCorrect ?? false, // default to false if not specified
            timestamp: new Date().toISOString() // 記錄回答時間
          }
        ]
      }));

      // console.log(isCorrect, trimmedInput);
      // console.log(storyProgressRef.current);

      const nextSceneId = isCorrect
        ? currentScene.answer.correctIndex
        : currentScene.answer.incorrectIndex; // get nextSceneId  from choice

      // validate nextSceneId
      console.log(nextSceneId, scenes.length);
      if (nextSceneId !== undefined && nextSceneId >= 0) {
        setStoryProgress((prev) => ({ ...prev, currentSceneId: nextSceneId }));
        // setCurrentSceneId(nextSceneId); // 跳轉到指定的索引
        handleNext(nextSceneId);
      } else {
        // if nextIndex is invalid or not specified then forward to next scene and log error
        if (nextSceneId < scenes.length - 1)
          handleNext(); // 默認前進
        else if (onStoryEnd) onStoryEnd(); // 如果已經到最後一個場景，則結束故事
        console.error('Invalid nextIndex:', nextSceneId);
      }
    },
    [currentSceneId, updateDialogueHistory, setStoryProgress, handleStoryEnd]
  );
  // handle history update when storyProgress changes
  useEffect(() => {
    if (storyProgress.dialogueHistory.length !== dialogueHistory.length) {
      setDialogueHistory(storyProgress.dialogueHistory);
    }
  }, [storyProgress.dialogueHistory]);

  // typing effect
  useEffect(() => {
    if (!currentScene || !hasLoadedProgress) return;
    // console.log('Typing effect triggered'); // this trigger 2-3 times when entering story
    setDisplayedCharacterCount(0);
    setIsTyping(true);
    let i = 0; // avoid missing first word
    const dialogueText = currentScene.dialogue ?? '';
    setCurrentDialogueText(dialogueText);

    const interval = setInterval(() => {
      if (i < currentScene.dialogue.length - 1) {
        setDisplayedCharacterCount((prev) => prev + 1);
        i++;
      } else {
        // console.log('Typing complete');
        clearInterval(interval);
        setIsTyping(false);

        updateDialogueHistory(currentScene.character, currentScene.dialogue);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [currentSceneId]);

  const textToDisplay = currentDialogueText.substring(0, displayedCharacterCount);
  // auto play
  useEffect(() => {
    if (currentScene?.type === 'question') return;
    if (isAuto && !isTyping) {
      const timer = setTimeout(() => {
        handleNext();
      }, 500); // 使用自動播放時，各句子間隔時間
      return () => clearTimeout(timer);
    }
  }, [currentScene?.type, isAuto, isTyping, handleNext]);

  const handleKeyDown = useCallback(
    (event) => {
      // Trigger handleNext on Enter if not typing and not a question scene
      if (event.key === 'Enter' && !isTyping && currentScene?.type !== 'question') {
        handleNext();
      }
      // Enter key handling for question scenes is in InputFrame
    },
    [isTyping, currentScene?.type, handleNext]
  );

  // keyboard event listener
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
    return <Options onBack={() => setShowOptions(false)} />;
  }

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
          onConfig={handleOpenConig}
        />
        {/* 對話框 或 Question */}
        {currentScene.type === 'question' ? (
          <InputFrame
            currentScene={currentScene}
            questionText={textToDisplay}
            isTyping={isTyping}
            onClick={() => {
              if (isTyping) {
                // console.log('Typing effect interrupted');
                setIsTyping(false);
                setDisplayedCharacterCount(currentDialogueText.length);
              }
            }}
            onAnswerSubmit={handleAnswerSubmit}
            updateDialogueHistory={updateDialogueHistory}
          />
        ) : (
          <div
            className="dialogue-box"
            onClick={() => handleNext()}
          >
            {' '}
            {/* 對話框 UI */}
            <h3>{currentScene.character}</h3>
            <p className="content">{textToDisplay}</p>
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
            className="btn btn-info px-4 py-2 fw-bold"
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
