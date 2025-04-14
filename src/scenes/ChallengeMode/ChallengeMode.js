import { useEffect, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useLevelManager } from './hooks/useLevelManager';
import { usePlayerInput } from './hooks/usePlayerInput';
import { useThemeManager } from './hooks/useThemeManager';
import { useQuestionManager } from './hooks/useQuestionManager';
import { useZombieManager } from './hooks/useZombieManager';
import { useSoundManager } from './hooks/useSoundManager';
import { GAME_CONFIG } from './gameConfig';
import { useVolumeControl } from '../../context/GameSettingsContext';

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

  // Level management
  const levelManager = useLevelManager(gameState, updateGameState);

  // Theme management
  const themeManager = useThemeManager(gameState, updateGameState);

  // Question management
  const questionManager = useQuestionManager();

  // Zombie management
  const zombieManager = useZombieManager();

  // Sound management
  const soundManager = useSoundManager();
  const { volume } = useVolumeControl();
  soundManager.setMasterVolume(volume);

  /**
   * Handles correct answer events
   * Updates accuracy statistics and spawns a new word
   * @param {Object} answerData - Data about the correct answer
   */
  const handleCorrectAnswer = (answerData) => {
    const currentZombie = zombieManager.getCurrentZombie();
    const behavior = currentZombie?.behavior;
    // Update accuracy statistics
    if (questionManager.currentQuestion) {
      questionManager.onCorrectAnswer({
        ...answerData,
        question: questionManager.currentQuestion,
        isCorrect: true
      });
    }
    // 處理護盾殭屍
    if (behavior === 'shield') {
      if (!zombieManager.getExtraState('shieldHit')) {
        zombieManager.setExtraState('shieldHit', true);
        const newQuestion = questionManager.selectQuestion();
        if (newQuestion) {
          playerInput.updateCurrentAnswer(newQuestion.answer, newQuestion.difficulty);
        }
        return;
      }
    }

    if (behavior === 'boss') {
      const hp = zombieManager.getExtraState('bossHp') ?? 3;
      const stage = zombieManager.getExtraState('bossStage') ?? 0;
      if (hp > 1) {
        const nextStage = stage + 1;
        const difficultyOrder = ['beginner', 'medium', 'hard'];
        const nextDifficulty = difficultyOrder[nextStage];

        zombieManager.setExtraState('bossHp', hp - 1);
        zombieManager.setExtraState('bossStage', nextStage);
        const newQuestionArray = questionManager.getCandidateQuestions(nextDifficulty);
        const newQuestion = newQuestionArray[Math.floor(Math.random() * newQuestionArray.length)];   
        if (newQuestion) {
          questionManager.updateCurrentQuestion(newQuestion);
          playerInput.updateCurrentAnswer(newQuestion.answer, newQuestion.difficulty);
        }
        return;
      }
    }

    // Update zombie defeat count in game state using functional update pattern
    updateGameState((prevState) => {
      return {
        ...prevState,
        zombiesDefeated: prevState.zombiesDefeated + 1
      };
    });

    // Play correct sound effect
    soundManager.playSound('accepted');

    // Reset zombie charge
    zombieManager.resetChargeRate();

    // Generate new zombie and question
    generateNewZombie();
  };

  /**
   * Handles wrong answer events
   * Updates accuracy statistics and applies penalties if applicable
   * @param {Object} answerData - Data about the wrong answer
   */
  const handleWrongAnswer = (answerData) => {
    const currentZombie = zombieManager.getCurrentZombie();
    const behavior = currentZombie?.behavior;
    // Update accuracy statistics
    if (questionManager.currentQuestion) {
      questionManager.onWrongAnswer({
        ...answerData,
        question: questionManager.currentQuestion,
        isCorrect: false
      });
    }

    // Apply penalty mechanism (for Level-4 and above)
    if (gameState.level >= 4) {
      zombieManager.charge(0.3);
    }

    if (behavior === 'chameleon') {
      const newQuestion = questionManager.selectQuestion();
      if (newQuestion) {
        playerInput.updateCurrentAnswer(newQuestion.answer, newQuestion.difficulty);
      }
      return;
    }

    // Play error sound effect
    soundManager.playSound('wrongAnswer');

  };

  // Initialize PlayerInput hook with necessary callbacks
  const playerInput = usePlayerInput(
    gameState,
    updateGameState,
    handleCorrectAnswer,
    handleWrongAnswer
  );

  /**
   * Fetch the type of zombie to spawn and request question(s)
   * 
   * For future use:
   *   1. Replace generateNewZombie
   *   2. More powerful function
   *   3. Request question(s) based on zombie type
   *   4. Update zombieManager with the new zombie type
   * 
   * This function will be called when the player defeats a zombie
   */
  const requestNextZombie = useCallback(() => {
    // TODO: Fetch or deside the type of zombie to spawn
    // TODO: Request question(s) based on zombie type
    // TODO: Update zombieManager with the new zombie type
    // TODO: Notify playerInput to update the current answer
  }, []);

  /**
   * Generate new zombie and question
   */
  const generateNewZombie = useCallback(() => {
    // Update random zombie 
    const zombie = zombieManager.changeCurrentZombie();

    if (zombie.behavior === 'boss') {
      const boss_questionArray = questionManager.getCandidateQuestions('beginner');
      console.log(boss_questionArray);
      const boss_question = boss_questionArray[Math.floor(Math.random() * boss_questionArray.length)];
      if (!boss_question) {
        console.warn('No question available for difficulty:', gameState.currentDifficulty);
        return;
      }
      questionManager.updateCurrentQuestion(boss_question);
      playerInput.updateCurrentAnswer(boss_question.answer, boss_question.difficulty);
    }
    else{
      // Select question with current difficulty and zombie count
      const question = questionManager.selectQuestion();
      if (!question) {
        console.warn('No question available for difficulty:', gameState.currentDifficulty);
        return;
      }
      if(zombie.behavior === 'mimic'){
        const question1 = questionManager.selectQuestion();
        const question2 = questionManager.selectQuestion();
        console.log(question1.answer);
        console.log(question2.answer);
        playerInput.updateCurrentAnswer(question1.answer, question.difficulty);
        zombieManager.setExtraState('mimicRevealed', false);
        zombieManager.setExtraState('realAnswer', question1.answer);
        setTimeout(() => {
          questionManager.updateCurrentQuestion(question1);
        }, 3000);
      }
      else{
        questionManager.updateCurrentQuestion(question);
        playerInput.updateCurrentAnswer(question.answer, question.difficulty);
      }
    }
  }, [
    questionManager,
    zombieManager
  ]);

  // Initialize game, generate first zombie
  useEffect(() => {
    // Check that currentSample not only exists but has content
    const hasSamples =
      themeManager.currentSample &&
      (themeManager.currentSample.beginner.length > 0 ||
        themeManager.currentSample.medium.length > 0 ||
        themeManager.currentSample.hard.length > 0);

    if (hasSamples && !gameState.gameOver) {
      questionManager.updateSamplePool(themeManager.currentSample);
      generateNewZombie();
    }
  }, [themeManager.currentSample, gameState.gameOver]);

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

        let chargeRate = zombieManager.getCurrentChargeRate();
        let chargeSpeed = levelManager.getChargeSpeed();
        let next = chargeRate + chargeSpeed*zombieManager.getCurrentZombie().chargeSpeedMultiplier;

        zombieManager.charge(chargeSpeed*zombieManager.getCurrentZombie().chargeSpeedMultiplier);

        if (next >= 1) {
          const newLives = gameState.lives - 1;
          if (newLives <= 0) {
            updateGameState({ gameOver: true });
            soundManager.playSound('defeated');
          } else {
            updateGameState({ lives: newLives });
            playerInput.clearInput();
            if(zombieManager.getCurrentZombie().name === 'boss'){
              zombieManager.resetChargeRate();
              console.log('reset');
              setTimeout(() => {
                zombieManager.charge(0.5);
              }, 100);
            } else{
              generateNewZombie();
            }
          }
          zombieManager.resetChargeRate();
        }
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [
    gameState.lives,
    gameState.gameOver,
    levelManager.getChargeSpeed,
    zombieManager.charge,
    zombieManager.getCurrentChargeRate,
    updateGameState,
    soundManager.playSound
  ]);

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
          <p className="fs-5 mb-4">Theme Accuracy: {questionManager.getThemeAccuracy()}%</p>
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
          {/* Boss hp */}
          {zombieManager.getCurrentZombie()?.behavior === 'boss' && (
            <div className="d-flex justify-content-center mb-3">
              {[...Array(3)].map((_, i) => {
                const bossHp = zombieManager.getExtraState('bossHp') ?? 3;
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
          {/* Time remaining indicator */}
          <p
            className={`mt-2 fw-bold ${zombieManager.getCurrentChargeRate() >= 0.75 ? 'text-danger' : 'text-warning'} bg-dark py-2 px-4 rounded-pill shadow`}
          >
            Time Left:{' '}
            {Math.round(
              (1 - zombieManager.getCurrentChargeRate()) /
                levelManager.getChargeSpeed() /
                (1000 / GAME_CONFIG.CHARGE_INTERVAL)
            )}
            s{' '}
          </p>
          {/* Zombie visualization */}
          <div
            className="position-relative d-flex justify-content-center align-items-center my-4"
            style={{
              transform: `scale(${zombieManager.getCurrentChargeRate()})`,
              transition: 'transform 0.3s linear'
            }}
          >
            <img
              src={zombieManager.getCurrentZombieImage()}
              alt="Zombie"
              className="img-fluid rounded-circle border border-warning bg-light p-3 shadow-lg"
              style={{ width: '250px', height: '250px' }}
            />
          </div>

          {/* Current word display */}
          <div className="bg-warning text-dark px-4 py-2 rounded-pill fs-4 fw-bold border border-dark shadow mb-4">
            {questionManager.currentQuestion ? questionManager.currentQuestion.description : ''}
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
            <p className="badge bg-secondary p-2">zombiesDefeated: {gameState.zombiesDefeated}</p>
            <p className="badge bg-primary p-2">Level: {gameState.level}</p>
            <p className="badge bg-danger p-2">Lives: {gameState.lives}</p>
            <p className="badge bg-success p-2">Theme: {gameState.currentTheme}</p>
            <p className="badge bg-info p-2">Accuracy: {questionManager.getThemeAccuracy()}%</p>
            <p className="badge bg-warning p-2">
              Charge: {zombieManager.getCurrentChargeRate().toFixed(2)}%
            </p>
          </div>
        </>
      )}
    </div>
  );
}
