import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to manage player input in Challenge Mode
 * Handles text input, validation, and feedback for the typing game
 *
 * @param {Object} props - Hook properties
 * @param {Object} props.gameState - Current game state
 * @param {Function} props.updateGameState - Function to update game state
 * @param {Function} props.playSound - Function to play game sounds
 * @param {Function} props.onCorrectAnswer - Callback for correct answers
 * @param {Function} props.onWrongAnswer - Callback for wrong answers
 * @returns {Object} Input management functions and state
 */
export const usePlayerInput = ({
  gameState,
  updateGameState,
  playSound,
  onCorrectAnswer,
  onWrongAnswer
}) => {
  // State for user input text
  const [inputValue, setInputValue] = useState('');
  // State for tracking incorrect input (for visual feedback)
  const [isWrong, setIsWrong] = useState(false);

  // Store the current word and its difficulty level
  const [currentWord, setCurrentWord] = useState('');
  const [currentWordDifficulty, setCurrentWordDifficulty] = useState('');

  /**
   * Updates the current word to be typed
   * @param {string} word - The new word to be typed
   * @param {string} difficulty - Difficulty level of the word
   */
  const updateCurrentAnswer = useCallback((word, difficulty = 'beginner') => {
    setCurrentWord(word);
    setCurrentWordDifficulty(difficulty);
    setInputValue('');
    setIsWrong(false);
  }, []);

  /**
   * Handles input changes as the user types
   * Validates input and triggers appropriate actions when complete
   * @param {Object} e - Input change event
   */
  const handleInputChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Check if input length matches word length (completed input)
      if (newValue.length === currentWord.length) {
        // Validate if the answer is correct
        if (newValue === currentWord) {
          // Correct answer logic

          // Create answer data for external tracking
          const answerData = {
            word: currentWord,
            difficulty: currentWordDifficulty,
            input: newValue,
            isCorrect: true,
            timestamp: Date.now()
          };

          // Notify external handlers about correct answer
          if (onCorrectAnswer) {
            onCorrectAnswer(answerData);
          }

          // Update zombie defeat count in game state
          const newZombiesDefeated = gameState.zombiesDefeated + 1;
          updateGameState({
            zombiesDefeated: newZombiesDefeated
          });

          // 清空輸入欄位 (新的殭屍/題目由外部邏輯處理)
          setInputValue('');
        } else {
          // Wrong answer logic
          setIsWrong(true);
          setInputValue('');

          // Create answer data for external tracking
          const answerData = {
            word: currentWord,
            difficulty: currentWordDifficulty,
            input: newValue,
            isCorrect: false,
            timestamp: Date.now()
          };

          // Notify external handlers about wrong answer
          if (onWrongAnswer) {
            onWrongAnswer(answerData);
          }

          // Reset wrong state after a short delay (for animation)
          setTimeout(() => setIsWrong(false), 300);
        }
      }
    },
    [
      currentWord,
      currentWordDifficulty,
      gameState.zombiesDefeated,
      updateGameState,
      onCorrectAnswer,
      onWrongAnswer
    ]
  );

  /**
   * 清空輸入欄位
   * 用於主動重置輸入狀態
   */
  const clearInput = useCallback(() => {
    setInputValue('');
    setIsWrong(false);
  }, []);

  /**
   * 重置整個輸入系統
   * 包括當前單詞和輸入狀態
   */
  const resetInput = useCallback(() => {
    setInputValue('');
    setIsWrong(false);
    setCurrentWord('');
    setCurrentWordDifficulty('');
  }, []);

  // Return functions and state for external use
  return {
    inputValue,
    isWrong,
    currentWord,
    handleInputChange,
    updateCurrentAnswer,
    clearInput,
    resetInput
  };
};
