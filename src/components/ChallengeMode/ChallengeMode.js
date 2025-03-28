import { useState, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { useLevelManager } from './hooks/useLevelManager';
import { usePlayerInput } from './hooks/usePlayerInput';
import { GAME_CONFIG } from './gameConfig';

// Import Bootstrap for UI styling
import 'bootstrap/dist/css/bootstrap.min.css';
// Import zombie images for visualization
import zombie1 from './zombie1.png';
import zombie2 from './zombie2.png';
import zombie3 from './zombie3.png';
import zombie4 from './zombie4.png';
// Import CSS for shake animation
import './shake.css';

// Array of zombie images for random selection
const zombieImages = [zombie1, zombie2, zombie3, zombie4];

/**
 * Custom hook to preload game sounds
 * This prevents audio loading delays during gameplay
 * @returns {Object} Reference to loaded sound objects
 */
const usePreloadedSounds = () => {
  const sounds = useRef({});

  useEffect(() => {
    const soundFiles = ['accept.wav', 'defeated.mp3', 'wrong_answer.mp3'];
    soundFiles.forEach((file) => {
      const audio = new Audio(process.env.PUBLIC_URL + `/sounds/${file}`);
      audio.load();
      sounds.current[file] = audio;
    });
  }, []);

  return sounds;
};

/**
 * Challenge Mode Component
 * Main component for the typing challenge game mode
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Callback to return to main menu
 */
export default function ChallengeMode({ onBack }) {
  // Game state variables
  const { gameState, updateGameState } = useGameState();
  const { getChargeSpeed } = useLevelManager(gameState, updateGameState);

  // Local state for the component
  const [wordList, setWordList] = useState([]); // List of words from current theme/difficulty
  const [scale, setScale] = useState(0.1); // Zombie scale (controls charge visualization)
  const [currentZombie, setCurrentZombie] = useState(
    zombieImages[Math.floor(Math.random() * zombieImages.length)]
  );

  // Temporary accuracy tracking (will be moved to QuestionManager)
  const correctAnswers = useRef(0);
  const totalAnswers = useRef(0);

  // Load game sound effects
  const sounds = usePreloadedSounds();

  /**
   * Plays a sound effect
   * @param {string} soundFile - Name of the sound file to play
   */
  const playSound = (soundFile) => {
    if (sounds.current[soundFile]) {
      const audio = sounds.current[soundFile];
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn('音效播放被阻擋:', err));
    }
  };

  /**
   * Spawns a new word for the player to type
   * @param {Array} words - Array of word objects to select from
   */
  const spawnWord = (words) => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    playerInput.updateCurrentWord(randomWord['word'], gameState.currentDifficulty);
    setScale(0); // Reset zombie charge
    setCurrentZombie(zombieImages[Math.floor(Math.random() * zombieImages.length)]);
  };

  /**
   * Handles correct answer events
   * Updates accuracy statistics and will interface with QuestionManager in the future
   * @param {Object} answerData - Data about the correct answer
   */
  const handleCorrectAnswer = (answerData) => {
    correctAnswers.current += 1;
    totalAnswers.current += 1;
    // Future implementation: will call QuestionManager methods here
  };

  /**
   * Handles wrong answer events
   * Updates accuracy statistics and applies penalties if applicable
   * @param {Object} answerData - Data about the wrong answer
   */
  const handleWrongAnswer = (answerData) => {
    totalAnswers.current += 1;
    // Apply penalty mechanism (for Level-4 and above)
    if (gameState.level >= 4) {
      applyPenalty();
    }
    // Future implementation: will call QuestionManager methods here
  };

  /**
   * Calculates current accuracy percentage (temporary method)
   * @returns {number} Accuracy percentage (0-100)
   */
  const getAccuracy = () => {
    if (totalAnswers.current === 0) return 100;
    return Math.round((correctAnswers.current / totalAnswers.current) * 100);
  };

  // Initialize PlayerInput hook with necessary callbacks
  const playerInput = usePlayerInput({
    gameState,
    updateGameState,
    spawnWord,
    playSound,
    wordList,
    onCorrectAnswer: handleCorrectAnswer,
    onWrongAnswer: handleWrongAnswer
  });

  // Load word list when difficulty or theme changes
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/data.json')
      .then((res) => res.json())
      .then((data) =>
        setWordList(data['topics'][gameState.currentTheme][gameState.currentDifficulty])
      );
  }, [gameState.currentDifficulty, gameState.currentTheme]);

  // Main game loop - handles zombie charging and lifecycle
  useEffect(() => {
    if (wordList.length > 0 && !gameState.gameOver) {
      spawnWord(wordList);
    }

    // Set up interval for zombie charge progress
    let interval = setInterval(() => {
      if (gameState.gameOver) {
        clearInterval(interval);
        return;
      }

      setScale((prev) => {
        if (prev >= 1) {
          // Zombie fully charged - player loses a life
          const newLives = gameState.lives - 1;
          if (newLives <= 0) {
            // Game over when lives reach zero
            updateGameState({ gameOver: true });
            playSound('defeated.mp3');
            clearInterval(interval);
          }
          updateGameState({ lives: newLives });
          return 0; // Reset zombie charge
        }
        // Increase zombie charge based on current level
        return prev + getChargeSpeed();
      });
    }, GAME_CONFIG.CHARGE_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [wordList, gameState.lives, gameState.gameOver, getChargeSpeed]);

  /**
   * Applies penalty for wrong answers (Level-4 and above)
   * Increases zombie charge by 30%
   */
  const applyPenalty = () => {
    if (gameState.level >= 4) {
      setScale((prev) => Math.min(prev + 0.3, 1));
    }
  };

  // Render game UI
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center bg-dark text-light p-4">
      {gameState.gameOver ? (
        // Game over screen
        <>
          <h1 className="display-3 text-danger fw-bold animate__animated animate__bounce">
            You Died!
          </h1>
          <p className="fs-4 mb-4">Final Score: Level {gameState.level}</p>
          <p className="fs-5 mb-4">Accuracy: {getAccuracy()}%</p>
          <button
            className="btn btn-info my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3"
            onClick={onBack}
          >
            Back Menu
          </button>
        </>
      ) : (
        // Active game screen
        <>
          <h1 className="display-4 fw-bold text-warning mb-4">Monster Typing Game</h1>
          <p className="lead">Type the word to defeat the monster!</p>
          {/* Time remaining indicator */}
          <p
            className={`mt-2 fw-bold ${scale >= 0.75 ? 'text-danger' : 'text-warning'} bg-dark py-2 px-4 rounded-pill shadow`}
          >
            Time Left: {Math.ceil((1 - scale) * 20)}s{' '}
          </p>
          {/* Zombie visualization */}
          <div
            className="position-relative d-flex justify-content-center align-items-center my-4"
            style={{ transform: `scale(${scale})`, transition: 'transform 0.3s linear' }}
          >
            <img
              src={currentZombie}
              alt="Zombie"
              className="img-fluid rounded-circle border border-warning bg-light p-3 shadow-lg"
              style={{ width: '250px', height: '250px' }}
            />
          </div>

          {/* Current word display */}
          <div className="bg-warning text-dark px-4 py-2 rounded-pill fs-4 fw-bold border border-dark shadow mb-4">
            {playerInput.currentWord}
          </div>

          {/* User input field */}
          <input
            type="text"
            value={playerInput.inputValue}
            onChange={playerInput.handleInputChange}
            className={`form-control text-center w-50 mx-auto p-3 fs-4 border border-warning shadow-lg ${playerInput.isWrong ? 'shake' : ''}`}
            autoFocus
            disabled={gameState.gameOver}
          />
          {/* Game stats */}
          <div className="d-flex justify-content-around w-50 mt-3">
            <p className="badge bg-primary p-2">Level: {gameState.level}</p>
            <p className="badge bg-danger p-2">Lives: {gameState.lives}</p>
            <p className="badge bg-success p-2">Accuracy: {getAccuracy()}%</p>
          </div>
        </>
      )}
    </div>
  );
}
