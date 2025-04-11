import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useLevelManager } from './hooks/useLevelManager';
import { usePlayerInput } from './hooks/usePlayerInput';
import { useThemeManager } from './hooks/useThemeManager';
import { useQuestionManager } from './hooks/useQuestionManager';
import { useZombieManager } from './hooks/useZombieManager';
import { useSoundManager } from './hooks/useSoundManager';
import { GAME_CONFIG } from './gameConfig';

// Import Bootstrap for UI styling
import 'bootstrap/dist/css/bootstrap.min.css';
// Import CSS for shake animation
import './shake.css';

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

  // Theme management
  const { currentSample } = useThemeManager(gameState, updateGameState);

  // Question management
  const {
    updateSamplePool,
    selectQuestion,
    handleCorrectAnswer: questionHandleCorrectAnswer,
    handleWrongAnswer: questionHandleWrongAnswer,
    getThemeAccuracy,
    getThemeStats,
    currentQuestion
  } = useQuestionManager(gameState, updateGameState);

  // Zombie Manager
  const { zombieState, changeCurrentZombie, setChargerate, setExtraState } = useZombieManager(
    gameState,
    updateGameState
  );

  // Sound Manager
  const { playSound } = useSoundManager();

  // Local state for the component
  const [zombieCount, setZombieCount] = useState(1); // Track current zombie count (for non-decreasing difficulty)

  /**
   * Handles correct answer events
   * Updates accuracy statistics and spawns a new word
   * @param {Object} answerData - Data about the correct answer
   */
  const handleCorrectAnswer = (answerData) => {
    const currentZombie = zombieState.currentZombie;
    const behavior = currentZombie?.behavior;
    // Update accuracy statistics
    if (currentQuestion) {
      questionHandleCorrectAnswer({
        ...answerData,
        question: currentQuestion,
        isCorrect: true
      });
    }
    // 處理護盾殭屍
    if (behavior === 'shield') {
      if (!zombieState.extraState.shieldHit) {
        // 第一次答對：破盾
        setExtraState('shieldHit', true);
        console.log('Shield break');
        const newQuestion = selectQuestion(gameState.currentDifficulty, zombieCount);
        if (newQuestion) {
          playerInput.updateCurrentAnswer(newQuestion.answer, newQuestion.difficulty);
        }
        return; // 不進入下一隻殭屍
      }
    }

    // 處理 Boss 殭屍
    if (behavior === 'boss') {
      const hp = zombieState.extraState.bossHp ?? 3;

      if (hp > 1) {
        // 累積一次命中但還沒死
        setExtraState('bossHp', hp - 1);
        console.log(`Boss hp ${hp - 1}/3`);

        const newQuestion = selectQuestion(gameState.currentDifficulty, zombieCount);
        if (newQuestion) {
          playerInput.updateCurrentAnswer(newQuestion.answer, newQuestion.difficulty);
        }

        return; // 不進入下一隻殭屍
      }

      // Boss 被打到第 3 次，視為死亡
      console.log('Boss defeated!');
      // （這邊可以進入下一隻殭屍處理流程）
    }

    // Update zombie defeat count in game state using functional update pattern
    updateGameState((prevState) => {
      return {
        ...prevState,
        zombiesDefeated: prevState.zombiesDefeated + 1
      };
    });

    // Increase zombie count, limit to 1-5 range
    setZombieCount((prev) => {
      const next = prev + 1;
      // Reset to 1 when reaching 5 zombies (prepare for next level)
      if (next > 5) {
        // TODO: This should trigger LevelManager's upgrade check
        return 1;
      }
      return next;
    });

    // Play correct sound effect
    playSound('accepted');

    // Reset zombie charge
    setChargerate(0);

    // Generate new zombie and question
    generateNewZombie();
  };

  /**
   * Handles wrong answer events
   * Updates accuracy statistics and applies penalties if applicable
   * @param {Object} answerData - Data about the wrong answer
   */
  const handleWrongAnswer = (answerData) => {
    const currentZombie = zombieState.currentZombie;
    const behavior = currentZombie?.behavior;
  
    if (currentQuestion) {
      questionHandleWrongAnswer({
        ...answerData,
        question: currentQuestion,
        isCorrect: false
      });
    }
  
    playSound('wrongAnswer');
  
    // ✅ 處理變色殭屍
    if (behavior === 'chameleon') {
      // 換一個新題目，但保留殭屍
      const newQuestion = selectQuestion(gameState.currentDifficulty, zombieCount);
      if (newQuestion) {
        playerInput.updateCurrentAnswer(newQuestion.answer, newQuestion.difficulty);
      }
      return; // 不扣血、不重生殭屍
    }
  
    // 一般錯誤處理（包含懲罰機制）
    if (gameState.level >= 4) {
      applyPenalty(); // 蓄力 +30%
    }
  };

  // Initialize PlayerInput hook with necessary callbacks
  const playerInput = usePlayerInput(
    gameState,
    updateGameState,
    handleCorrectAnswer,
    handleWrongAnswer
  );

  /**
   * Generate new zombie and question
   */
  const generateNewZombie = useCallback(() => {
    // Select question with current difficulty and zombie count
    const question = selectQuestion(gameState.currentDifficulty, zombieCount);

    if (!question) {
      console.warn('No question available for difficulty:', gameState.currentDifficulty);
      return;
    }

    // Update random zombie image
    changeCurrentZombie();

    // Set the question
    playerInput.updateCurrentAnswer(question.answer, question.difficulty);
  }, [gameState.currentDifficulty, zombieCount, selectQuestion, playerInput]);

  // Initialize game, generate first zombie
  useEffect(() => {
    if (currentSample && !gameState.gameOver) {
      // Update QuestionManager's sample pool
      updateSamplePool(currentSample);

      // Reset zombie count (when theme changes)
      setZombieCount(1);

      // Generate zombie and question
      generateNewZombie();
    }
  }, [currentSample]);

  // Main game loop - handles zombie charging and lifecycle
  useEffect(() => {
    if (gameState.gameOver) return;

    let frameId;
    let lastChargeTime = performance.now();

    const tick = (now) => {
      frameId = requestAnimationFrame(tick);

      // Check if it's time for the next update
      if (now - lastChargeTime >= GAME_CONFIG.CHARGE_INTERVAL) {
        lastChargeTime = now;

        setChargerate((prev) => {
          let next = prev + getChargeSpeed()*zombieState.currentZombie.chargeSpeedMultiplier;

          if (next >= 1) {
            const newLives = gameState.lives - 1;
            if (newLives <= 0) {
              updateGameState({ gameOver: true });
              playSound('defeated');
              return 1;
            } else {
              updateGameState({ lives: newLives });
              playerInput.clearInput();
              if (zombieState.currentZombie.behavior == 'boss'){
                next = 0.5;
              }
              else{
                generateNewZombie();
                return 0;
              }
            }
          }

          return Math.min(next, 1);
        });
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [
    gameState.lives,
    gameState.gameOver,
    getChargeSpeed,
    updateGameState,
    generateNewZombie,
    playSound
  ]);

  /**
   * Applies penalty for wrong answers (Level-4 and above)
   * Increases zombie charge by 30%
   */
  const applyPenalty = () => {
    if (gameState.level >= 4) {
      setChargerate((prev) => Math.min(prev + 0.3, 1));
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
          <p className="fs-5 mb-4">Theme Accuracy: {getThemeAccuracy()}%</p>
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
            className={`mt-2 fw-bold ${zombieState.currentChargeRate >= 0.75 ? 'text-danger' : 'text-warning'} bg-dark py-2 px-4 rounded-pill shadow`}
          >
            Time Left:{' '}
            {Math.round(
              (1 - zombieState.currentChargeRate) /
                getChargeSpeed() /
                (1000 / GAME_CONFIG.CHARGE_INTERVAL)
            )}
            s{' '}
          </p>
          {/* Zombie visualization */}
          <div
            className="position-relative d-flex justify-content-center align-items-center my-4"
            style={{
              transform: `scale(${zombieState.currentChargeRate})`,
              transition: 'transform 0.3s linear'
            }}
          >
            <img
              src={zombieState.currentZombie.image}
              alt="Zombie"
              className="img-fluid rounded-circle border border-warning bg-light p-3 shadow-lg"
              style={{ width: '250px', height: '250px' }}
            />
          </div>
          {/* Boss HP bar */}
          {zombieState.currentZombie.behavior === 'boss' && (
            <div className="d-flex justify-content-center mb-3">
              {[...Array(3)].map((_, i) => {
                const bossHp = zombieState.extraState?.bossHp ?? 3;
                return (
                  <div
                    key={i}
                    style={{
                      width: '25px',
                      height: '25px',
                      margin: '0 5px',
                      borderRadius: '50%',
                      backgroundColor: i < bossHp ? 'red' : 'lightgray',
                      boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}
                  />
                );
              })}
            </div>
          )}
          {/* Current word display */}
          <div className="bg-warning text-dark px-4 py-2 rounded-pill fs-4 fw-bold border border-dark shadow mb-4">
            {currentQuestion ? currentQuestion.description : ''}
          </div>

          {/* User input field */}
          <input
            type="text"
            ref={playerInput.registerInputRef}
            onChange={playerInput.handleInputChange}
            className={`form-control text-center w-50 mx-auto p-3 fs-4 border border-warning shadow-lg ${playerInput.isWrong ? 'shake' : ''}`}
            autoFocus
            disabled={gameState.gameOver}
          />
          {/* Game stats */}
          <div className="d-flex justify-content-around w-50 mt-3">
            <p className="badge bg-primary p-2">Level: {gameState.level}</p>
            <p className="badge bg-danger p-2">Lives: {gameState.lives}</p>
            <p className="badge bg-success p-2">Theme: {gameState.currentTheme}</p>
            <p className="badge bg-info p-2">Accuracy: {getThemeAccuracy()}%</p>
            <p className="badge bg-warning p-2">
              Charge: {zombieState.currentChargeRate.toFixed(2)}%
            </p>
          </div>
        </>
      )}
    </div>
  );
}
