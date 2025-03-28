import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to manage player input in Challenge Mode
 * Handles text input, validation, and feedback for the typing game
 *
 * @param {Object} props - Hook properties
 * @param {Object} props.gameState - Current game state
 * @param {Function} props.updateGameState - Function to update game state
 * @param {Function} props.spawnWord - Function to generate a new word
 * @param {Function} props.playSound - Function to play game sounds
 * @param {Array} props.wordList - List of available words
 * @param {Function} props.onCorrectAnswer - Callback for correct answers
 * @param {Function} props.onWrongAnswer - Callback for wrong answers
 * @returns {Object} Input management functions and state
 */
export const usePlayerInput = ({
  gameState,
  updateGameState,
  spawnWord,
  playSound,
  wordList,
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

  // Use for storing input history and statistics
  const inputHistory = useRef([]);
  const correctInputs = useRef(0);
  const totalInputs = useRef(0);

  /**
   * Updates the current word to be typed
   * @param {string} word - The new word to be typed
   * @param {string} difficulty - Difficulty level of the word
   */
  const updateCurrentWord = useCallback((word, difficulty = 'beginner') => {
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
          playSound('accept.wav');

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

          // Generate a new word
          spawnWord(wordList);
        } else {
          // Wrong answer logic
          setIsWrong(true);
          setInputValue('');
          playSound('wrong_answer.mp3');

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
      playSound,
      spawnWord,
      updateGameState,
      wordList,
      onCorrectAnswer,
      onWrongAnswer
    ]
  );

  /**
   * Resets the input field and error state
   * Useful when switching words or resetting the game
   */
  const resetInput = useCallback(() => {
    setInputValue('');
    setIsWrong(false);
  }, []);

  // Return functions and state for external use
  return {
    inputValue,
    isWrong,
    currentWord,
    handleInputChange,
    updateCurrentWord,
    resetInput
  };
};
