import { useState, useEffect, useCallback, useRef } from 'react';
import Options from '../Option/Option';
import Navbar from './component/Navbar';
import './test.css';
import InputFrame from './component/InputFrame';
import StoryEndPopup from './component/StoryEndPopup';

import useStoryProgress from './hooks/useStoryProgress';
export default function StoryMode({ storyId = 'local-story-default', scenes, onBack, onStoryEnd }) {
  const { storyProgress, setStoryProgress, initialIndex, initialDialogueHistory } =
    useStoryProgress({ storyId, scenes });
  const [index, setIndex] = useState(0);

  const [currentDialogueText, setCurrentDialogueText] = useState('');
  const [displayedCharacterCount, setDisplayedCharacterCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const dialogueHistoryRef = useRef([]);
  useEffect(() => {
    dialogueHistoryRef.current = dialogueHistory;
  }, [dialogueHistory]);

  const [isAuto, setIsAuto] = useState(false); // 自動播放狀態

  const currentScene = scenes ? scenes[index] : null;

  const [showStoryEndPopup, setShowStoryEndPopup] = useState(false); // 控制故事結束彈出視窗的顯示狀態

  // store story progress and answer status to localStorage
  // const [storyProgress, setStoryProgress] = useState({
  //   storyId: storyId,
  //   currentIndex: 0,
  //   answers: [], // player answer history { sceneId, chosenText, isCorrect, timestamp }
  //   dialogueHistory: [],
  //   startTime: null,
  //   endTime: null // null: story not ended
  // });
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

  const handleNext = useCallback(() => {
    if (currentScene?.type !== undefined && (currentScene?.type === 'correctED' || 'wrongED')) {
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

    const nextIndex = index + 1;
    if (nextIndex < scenes.length - 1) {
      setStoryProgress((prev) => ({ ...prev, currentIndex: nextIndex }));
      setIndex(nextIndex);
    } else {
      handleStoryEnd();
    }
  });

  const handleSkip = useCallback(() => {
    if (scenes[index].type === 'question') return;

    let tempIndex = index;
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
      currentIndex: tempIndex,
      dialogueHistory: [...prev.dialogueHistory, ...skippedDialogues]
    }));

    if (tempIndex < scenes.length - 1) {
      setIndex(tempIndex + 1);
    } else {
      handleStoryEnd();
    }
    setIsTyping(false);
  }, [index, scenes, isTyping, currentScene, handleStoryEnd]);

  const handleAuto = () => {
    setIsAuto(!isAuto);
  };

  /**
   * Called when user submit a valid answer(text)
   * @param {{text: string, correctIndex: number, incorrectIndex: number}} choice - The player selected choice object in single scene
   */
  const handleChoiceSelect = useCallback(
    (choice) => {
      setStoryProgress((prev) => ({
        ...prev,
        answers: [
          ...prev.answers,
          {
            sceneIndex: index,
            chosenText: choice.text ?? '',
            isCorrect: choice.isCorrect ?? false, // default to false if not specified
            timestamp: new Date().toISOString() // 記錄回答時間
          }
        ]
      }));

      // console.log(choice);
      // console.log(storyProgressRef.current);

      const nextIndex = choice
        ? currentScene.answer.correctIndex
        : currentScene.answer.incorrectIndex; // get nextIndex from choice

      // validate nextIndex
      if (nextIndex !== undefined && nextIndex >= 0 && nextIndex < scenes.length) {
        setStoryProgress((prev) => ({ ...prev, currentIndex: nextIndex }));
        setIndex(nextIndex); // 跳轉到指定的索引
        handleNext();
      } else {
        // if nextIndex is invalid or not specified then forward to next scene and log error
        if (nextIndex < scenes.length - 1)
          handleNext(); // 默認前進
        else if (onStoryEnd) onStoryEnd(); // 如果已經到最後一個場景，則結束故事
        console.error('Invalid nextIndex:', nextIndex);
      }
    },
    [index, scenes, updateDialogueHistory, setStoryProgress, handleStoryEnd]
  );

  // localStorage read/write
  useEffect(() => {
    const localStorageKey = `storyProgress_${storyId}`;
    // load progress
    if (!hasLoadedProgress.current) {
      const savedProgress = localStorage.getItem(localStorageKey);
      if (savedProgress) {
        try {
          const parsedProgress = JSON.parse(savedProgress);
          setStoryProgress(parsedProgress);
          setIndex(parsedProgress.currentIndex ?? 0);
          setDialogueHistory(parsedProgress.dialogueHistory ?? []);

          if (parsedProgress.endTime) {
            setShowStoryEndPopup(true); // show story end popup if story ended
          }
        } catch (error) {
          console.error('Failed to parse story progress from localStorage:', error);
          return;
        }
      } else {
        // no progress found, set default values
        setStoryProgress({
          storyId: storyId,
          currentIndex: 0,
          answers: [],
          dialogueHistory: [],
          startTime: new Date().toISOString(),
          endTime: null
        });
        setIndex(0);
        setDialogueHistory([]);
      }
      hasLoadedProgress.current = true;
    }

    // save progress
    if (hasLoadedProgress.current) {
      // console.log('Saving story progress to localStorage:', storyProgress);
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(storyProgress));
      } catch (error) {
        console.error('Failed to save story progress to localStorage:', error);
      }
    }
  }, [storyProgress, storyId]);

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

        const latestHistory = dialogueHistoryRef.current[dialogueHistoryRef.current.length - 1];
        const isAlreadyInHistory =
          latestHistory &&
          latestHistory.dialogue === currentScene.dialogue &&
          latestHistory.character === currentScene.character;
        if (!isAlreadyInHistory)
          updateDialogueHistory(currentScene.character, currentScene.dialogue);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [index]);

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
  }, [currentScene.type, isAuto, isTyping, handleNext]);

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
            onChoiceSelect={handleChoiceSelect}
            updateDialogueHistory={updateDialogueHistory}
          />
        ) : (
          <div
            className="dialogue-box"
            onClick={handleNext}
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
