import { useState, useCallback, useRef, useEffect } from 'react';

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
export const usePlayerInput = (gameState, updateGameState, onCorrectAnswer, onWrongAnswer) => {
  // Use useRef to manage input value completely
  const inputRef = useRef('');

  // DOM element ref for direct input field manipulation
  const inputElementRef = useRef(null);

  // Retain only necessary state
  const [isWrong, setIsWrong] = useState(false);

  // Current answer related state
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentWordDifficulty, setCurrentWordDifficulty] = useState('');

  /**
   * Updates the current word to be typed
   * @param {string} word - The new word to be typed
   * @param {string} difficulty - Difficulty level of the word
   */
  const updateCurrentAnswer = useCallback((word, difficulty = 'beginner') => {
    setCurrentAnswer(word);
    setCurrentWordDifficulty(difficulty);

    // Directly clear the input field value
    inputRef.current = '';
    if (inputElementRef.current) {
      inputElementRef.current.value = '';
    }

    setIsWrong(false);
  }, []);

  /**
   * Handles input changes as the user types
   * Validates input and triggers appropriate actions when complete
   * @param {Object} e - Input change event
   */
  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      inputRef.current = value;

      // Immediately check answer completion status
      if (value.length === currentAnswer.length) {
        // Use setTimeout to ensure UI updates outside the main JS thread
        setTimeout(() => {
          if (value === currentAnswer) {
            handleCorrect(value);
          } else {
            handleWrong(value);
          }
        }, 0);
      }
    },
    [currentAnswer]
  );

  /**
   * Clear input field
   * Used for actively resetting input state
   */
  const clearInput = useCallback(() => {
    inputRef.current = '';
    if (inputElementRef.current) {
      inputElementRef.current.value = '';
    }
    setIsWrong(false);
  }, []);

  /**
   * Reset entire input system
   * Including current word and input status
   */
  const resetInput = useCallback(() => {
    inputRef.current = '';
    if (inputElementRef.current) {
      inputElementRef.current.value = '';
    }
    setIsWrong(false);
    setCurrentAnswer('');
    setCurrentWordDifficulty('');
  }, []);

  const handleCorrect = useCallback(
    (newValue) => {
      // Create answer data for external tracking
      const answerData = {
        word: currentAnswer,
        difficulty: currentWordDifficulty,
        input: newValue,
        isCorrect: true,
        timestamp: Date.now()
      };

      // Notify external handlers about correct answer
      onCorrectAnswer?.(answerData);

      // Directly clear the input field
      inputRef.current = '';
      if (inputElementRef.current) {
        inputElementRef.current.value = '';
      }
    },
    [
      currentAnswer,
      currentWordDifficulty,
      onCorrectAnswer,
      updateGameState,
      gameState.zombiesDefeated
    ]
  );

  const handleWrong = useCallback(
    (newValue) => {
      const answerData = {
        word: currentAnswer,
        difficulty: currentWordDifficulty,
        input: newValue,
        isCorrect: false,
        timestamp: Date.now()
      };

      onWrongAnswer?.(answerData);
      setIsWrong(true);

      // Directly clear the input field
      inputRef.current = '';
      if (inputElementRef.current) {
        inputElementRef.current.value = '';
      }

      setTimeout(() => setIsWrong(false), 300);
    },
    [currentAnswer, currentWordDifficulty, onWrongAnswer]
  );

  // Register input element reference
  const registerInputRef = useCallback((el) => {
    inputElementRef.current = el;
  }, []);

  // Return functions and state for external use
  return {
    inputValue: inputRef.current, // Provide inputValue for compatibility
    isWrong,
    currentAnswer,
    handleInputChange,
    updateCurrentAnswer,
    clearInput,
    resetInput,
    registerInputRef
  };
};
