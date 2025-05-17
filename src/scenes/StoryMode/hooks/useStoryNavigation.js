// src\scenes\StoryMode\hooks\useStoryNavigation.js
import { useCallback } from 'react';
import { useAddIncorrectWord } from '../../../context/GameSettingsContext'; // 假設路徑正確

export default function useStoryNavigation({
  storyId,
  currentScene,
  scenes,
  setStoryProgress,
  storyProgressRef, // << 確保這個 ref 被傳入並且是最新的
  updateDialogueHistory,
  handleStoryEnd
}) {
  const addIncorrectWord = useAddIncorrectWord();

  const handleAdvance = useCallback(
    (nextSceneIdOverride) => {
      if (currentScene?.type === 'wrongED') {
        const lastAnswer =
          storyProgressRef.current?.answers?.[storyProgressRef.current.answers.length - 1];
        const questionScene = scenes.find(
          (scene) => scene.id === lastAnswer?.sceneId && scene.type === 'question'
        );

        if (
          questionScene &&
          questionScene.answer &&
          questionScene.answer.correctIndex !== undefined
        ) {
          const correctPathSceneId = questionScene.answer.correctIndex;
          // 找到 correctIndex 對應的場景在 scenes 陣列中的索引
          const correctPathSceneIndex = scenes.findIndex(
            (scene) => scene.id === correctPathSceneId
          );

          if (correctPathSceneIndex !== -1 && correctPathSceneIndex < scenes.length - 2) {
            // 如果 correctPathScene 不是最後一個場景，則取它的下一個場景
            const nextSceneAfterCorrectPath = scenes[correctPathSceneIndex + 1];
            if (nextSceneAfterCorrectPath) {
              console.log(
                `Advancing from wrongED (ID: ${currentScene.id}). Original question ID: ${questionScene.id}. ` +
                  `Correct path was ID: ${correctPathSceneId}. Skipping to scene after correct path: ID ${nextSceneAfterCorrectPath.id}`
              );
              setStoryProgress((prev) => ({
                ...prev,
                currentSceneId: nextSceneAfterCorrectPath.id
              }));
              return;
            } else {
              // 理論上不應該發生，因為上面檢查了 correctPathSceneIndex < scenes.length - 2
              console.warn(
                `Could not find scene after correct path (ID: ${correctPathSceneId}) for wrongED (ID: ${currentScene.id}). Ending story.`
              );
              handleStoryEnd();
              return;
            }
          } else {
            // 如果 correctPathScene 本身就是最後一個場景，或者找不到
            console.warn(
              `Correct path scene (ID: ${correctPathSceneId}) is the last scene or not found. ` +
                `Cannot advance further from wrongED (ID: ${currentScene.id}). Ending story.`
            );
            handleStoryEnd(); // 因為沒有 "再下一個" 場景了
            return;
          }
        } else {
          console.warn(
            `Could not determine the correct next scene from wrongED (ID: ${currentScene.id}). Falling back to normal advance or story end.`
          );
          // 如果找不到，則嘗試正常流程或結束 (下面的邏輯會處理)
        }
      }

      // 如果當前場景是 correctED，並且它不是最後一個場景，則正常前進
      // 否則，如果它是最後一個場景 (例如 ID 19 在你的範例中是最後的 correctED)，則結束故事
      if (currentScene?.type === 'correctED') {
        const currentIndexInScenes = scenes?.findIndex((scene) => scene.id === currentScene.id);
        if (currentIndexInScenes !== -1 && currentIndexInScenes < scenes.length - 2) {
          // 還有後續場景，正常前進 (下面的邏輯會處理)
        } else {
          console.log(`Reached a terminal correctED scene (ID: ${currentScene.id}). Ending story.`);
          handleStoryEnd();
          return;
        }
      }

      const currentIndexInScenes = scenes?.findIndex((scene) => scene.id === currentScene?.id);
      let nextSceneIdToAdvanceTo;

      if (nextSceneIdOverride !== undefined) {
        nextSceneIdToAdvanceTo = nextSceneIdOverride;
      } else if (currentIndexInScenes !== -1 && currentIndexInScenes < scenes.length - 2) {
        nextSceneIdToAdvanceTo = scenes[currentIndexInScenes + 1]?.id;
      } else {
        nextSceneIdToAdvanceTo = undefined;
      }

      if (nextSceneIdToAdvanceTo !== undefined) {
        const nextSceneExists = scenes.some((scene) => scene.id === nextSceneIdToAdvanceTo);
        if (nextSceneExists) {
          setStoryProgress((prev) => ({ ...prev, currentSceneId: nextSceneIdToAdvanceTo }));
        } else {
          console.error(
            `Attempted to navigate to non-existent scene ID: ${nextSceneIdToAdvanceTo}`
          );
          handleStoryEnd();
        }
      } else {
        if (currentScene?.type !== 'wrongED') {
          // wrongED 的結束情況上面已處理
          console.log(`No next scene ID found after scene ${currentScene?.id}. Ending story.`);
          handleStoryEnd();
        }
      }
    },
    [currentScene, scenes, setStoryProgress, handleStoryEnd, storyProgressRef]
  );

  // ... (handleSkip 和 handleAnswerSubmit 保持不變)
  const handleSkip = useCallback(() => {
    // ... (跳過邏輯保持不變) ...
    if (currentScene?.type === 'question') {
      console.warn('Cannot skip during a question scene.');
      return;
    }

    const currentIndex = scenes?.findIndex((scene) => scene.id === currentScene?.id);
    if (currentIndex === -1) {
      console.error('Current scene not found in scenes array during skip.');
      handleStoryEnd();
      return;
    }

    let tempIndex = currentIndex;
    const skippedDialogues = [];
    tempIndex++;

    while (tempIndex < scenes.length) {
      const sceneToSkip = scenes[tempIndex];
      if (!sceneToSkip) break;
      if (sceneToSkip.type === 'question') break;
      if (sceneToSkip.dialogue) {
        skippedDialogues.push({
          character: sceneToSkip.character,
          dialogue: sceneToSkip.dialogue
        });
      }
      tempIndex++;
    }

    setStoryProgress((prev) => ({
      ...prev,
      dialogueHistory: [...prev.dialogueHistory, ...skippedDialogues]
    }));

    if (tempIndex < scenes.length) {
      handleAdvance(scenes[tempIndex].id); // 這裡的 handleAdvance 會走上面更新後的邏輯
    } else {
      handleStoryEnd();
    }
  }, [currentScene, scenes, setStoryProgress, handleStoryEnd, handleAdvance]);

  const handleAnswerSubmit = useCallback(
    (isCorrect, trimmedInput) => {
      console.log(`handleAnswerSubmit: isCorrect: ${isCorrect}, trimmedInput: ${trimmedInput}`);

      if (currentScene?.type !== 'question') {
        console.warn('handleAnswerSubmit called on a non-question scene.');
        return;
      }

      if (!isCorrect) {
        if (currentScene.answer && currentScene.answer.text) {
          const wordToSave = currentScene.answer.text;
          addIncorrectWord({
            word: wordToSave,
            storyId: storyId,
            sceneId: currentScene.id,
            timestamp: new Date().toISOString()
          });
          console.log(
            `Logged incorrect word: "${wordToSave}" from Story ID: ${storyId}, Scene ID: ${currentScene.id}`
          );
        } else {
          console.warn(
            `Question scene ID ${currentScene.id} is marked incorrect but has no 'answer.text' defined to save.`
          );
        }
      }

      const newAnswerEntry = {
        sceneId: currentScene.id,
        chosenText: trimmedInput,
        isCorrect: isCorrect,
        timestamp: new Date().toISOString()
      };

      setStoryProgress((prev) => ({
        ...prev,
        answers: [...prev.answers, newAnswerEntry]
      }));

      const nextSceneId = isCorrect
        ? currentScene.answer.correctIndex
        : currentScene.answer.incorrectIndex;

      const historyEntry = isCorrect
        ? `[${trimmedInput}]`
        : `[${trimmedInput}] - Incorrect (Correct: ${currentScene.answer?.text || 'N/A'})`;
      updateDialogueHistory('You typed:', historyEntry);

      if (nextSceneId !== undefined) {
        const targetNextSceneExists = scenes.some((scene) => scene.id === nextSceneId);
        if (targetNextSceneExists) {
          handleAdvance(nextSceneId); // 這裡的 handleAdvance 會走上面更新後的邏輯
        } else {
          console.error(
            `Question scene ID ${currentScene.id} points to a non-existent next scene ID (${nextSceneId}) for ${isCorrect ? 'correct' : 'incorrect'} answer.`
          );
          handleStoryEnd();
        }
      } else {
        console.error(
          `Question scene ID ${currentScene.id} has no valid next scene defined for ${isCorrect ? 'correct' : 'incorrect'} answer.`
        );
        handleStoryEnd();
      }
    },
    [
      currentScene,
      setStoryProgress,
      updateDialogueHistory,
      handleAdvance,
      handleStoryEnd,
      addIncorrectWord,
      storyId,
      scenes
    ]
  );

  return {
    handleAdvance,
    handleSkip,
    handleAnswerSubmit
  };
}
