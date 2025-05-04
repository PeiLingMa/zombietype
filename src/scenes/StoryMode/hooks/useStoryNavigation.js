// src\scenes\StoryMode\hooks\useStoryNavigation.js
import { useCallback } from 'react';

/**
 * Handles navigation logic within the story mode (advancing, skipping, answering questions).
 *
 * @param {object} params
 * @param {object} params.currentScene - The current scene object.
 * @param {Array<object>} params.scenes - The array of all scene objects.
 * @param {Function} params.setStoryProgress - Setter for the story progress state.
 * @param {Function} params.updateDialogueHistory - Function to add entries to the dialogue history.
 * @param {Function} params.handleStoryEnd - Function to call when the story ends.
 * @returns {{
 *   handleAdvance: (nextSceneIdOverride?: number) => void,
 *   handleSkip: () => void,
 *   handleAnswerSubmit: (isCorrect: boolean, trimmedInput: string) => void
 * }}
 */
export default function useStoryNavigation({
  currentScene,
  scenes,
  setStoryProgress,
  updateDialogueHistory,
  handleStoryEnd
}) {
  /**
   * Advances to the next scene.
   * If nextSceneIdOverride is provided, goes to that scene ID.
   * Otherwise, goes to the scene with the next sequential ID based on current index.
   * Handles story ending if there is no next scene.
   * @param {number} [nextSceneIdOverride] - Optional scene ID to jump to.
   */
  const handleAdvance = useCallback(
    (nextSceneIdOverride) => {
      const currentIndex = scenes?.findIndex((scene) => scene.id === currentScene?.id);

      let nextSceneId;
      if (nextSceneIdOverride !== undefined) {
        nextSceneId = nextSceneIdOverride;
      } else if (currentIndex !== -1 && currentIndex < scenes.length - 1) {
        // Default to the next scene in the array if no override and not the last scene
        nextSceneId = scenes[currentIndex + 1]?.id;
      } else {
        // No next scene found, story ends
        nextSceneId = undefined; // Explicitly set to undefined to indicate end
      }

      if (nextSceneId !== undefined) {
        // Check if the nextSceneId actually exists in the scenes array
        const nextSceneExists = scenes.some((scene) => scene.id === nextSceneId);
        if (nextSceneExists) {
          setStoryProgress((prev) => ({ ...prev, currentSceneId: nextSceneId }));
        } else {
          console.error(`Attempted to navigate to non-existent scene ID: ${nextSceneId}`);
          handleStoryEnd(); // Treat as end if target scene doesn't exist
        }
      } else {
        handleStoryEnd();
      }
    },
    [currentScene, scenes, setStoryProgress, handleStoryEnd] // Add all dependencies
  );

  /**
   * Skips dialogue scenes until the next question scene or the end of the story.
   * Updates dialogue history for all skipped scenes.
   */
  const handleSkip = useCallback(() => {
    // Do not skip a question
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

    // Start from the scene *after* the current one for skipping
    tempIndex++;

    while (tempIndex < scenes.length) {
      const sceneToSkip = scenes[tempIndex];

      if (!sceneToSkip) {
        // Should not happen if scenes array is valid, but safety check
        console.error(`Scene at index ${tempIndex} is undefined during skip.`);
        break;
      }

      // If the next scene is a question, stop skipping before it
      if (sceneToSkip.type === 'question') {
        break;
      }

      // Add dialogue to history for non-question scenes
      if (sceneToSkip.dialogue) {
        skippedDialogues.push({
          character: sceneToSkip.character,
          dialogue: sceneToSkip.dialogue
        });
      }

      tempIndex++;
    }

    // Update history and navigate to the scene at tempIndex (which is either a question or the end)
    setStoryProgress((prev) => ({
      ...prev,
      dialogueHistory: [...prev.dialogueHistory, ...skippedDialogues]
      // currentSceneId will be updated by handleAdvance
    }));

    if (skippedDialogues.length > 0) {
      // updateDialogueHistory('System', `...Skipped ${skippedDialogues.length} scenes...`); // Optional: add a skip marker
    }

    // Navigate to the next scene (either the question or the end)
    if (tempIndex < scenes.length) {
      handleAdvance(scenes[tempIndex].id);
    } else {
      handleStoryEnd(); // Reached the end after skipping
    }
  }, [
    currentScene,
    scenes,
    setStoryProgress,
    updateDialogueHistory,
    handleStoryEnd,
    handleAdvance
  ]);

  /**
   * Handles the submission of an answer for a question scene.
   * Updates progress with the answer and navigates to the correct or incorrect scene.
   * @param {boolean} isCorrect - If submitted answer was correct.
   * @param {string} trimmedInput - The user's input text.
   */
  const handleAnswerSubmit = useCallback(
    (isCorrect, trimmedInput) => {
      console.log(`handleAnswerSubmit: isCorrect: ${isCorrect}, trimmedInput: ${trimmedInput}`);

      if (currentScene?.type !== 'question') {
        console.warn('handleAnswerSubmit called on a non-question scene.');
        return;
      }

      // Update progress with the answer
      setStoryProgress((prev) => ({
        ...prev,
        answers: [
          ...prev.answers,
          {
            sceneId: currentScene.id, // Use scene ID instead of index
            chosenText: trimmedInput,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString() // Record answer time
          }
        ]
      }));

      // Determine the next scene ID based on correctness
      const nextSceneId = isCorrect
        ? currentScene.answer.correctIndex // Assuming correctIndex/incorrectIndex store scene IDs now
        : currentScene.answer.incorrectIndex;

      // Update dialogue history with the user's input
      const historyEntry = isCorrect ? `[${trimmedInput}]` : `[${trimmedInput}] - No match found`;
      updateDialogueHistory('You typed:', historyEntry);

      // Navigate to the next scene
      if (nextSceneId !== undefined) {
        handleAdvance(nextSceneId);
      } else {
        console.error(
          `Question scene ID ${currentScene.id} has no valid next scene defined for ${isCorrect ? 'correct' : 'incorrect'} answer.`
        );
        handleStoryEnd(); // Treat as end if next scene is not defined
      }
    },
    [currentScene, setStoryProgress, updateDialogueHistory, handleAdvance, handleStoryEnd]
  );

  return {
    handleAdvance,
    handleSkip,
    handleAnswerSubmit
  };
}
