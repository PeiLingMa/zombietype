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
import SummaryPage from './SummaryPage';

// Import Bootstrap for UI styling
import 'bootstrap/dist/css/bootstrap.min.css';
// Import CSS for shake animation and styling
import './shake.css';
import './ChallengeMode.css';

/**
 * Challenge Mode Component
 * Main component for the typing challenge game mode
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Callback to return to main menu
 */
export default function ChallengeMode({ onBack }) {
  // Game state variables
  const { gameState, updateGameState, initializeGameState } = useGameState();

  // Level management
  const levelManager = useLevelManager(gameState, updateGameState);

  // Theme management
  const themeManager = useThemeManager(gameState, updateGameState);

  // Question management
  const questionManager = useQuestionManager();

  // Zombie management
  const zombieManager = useZombieManager(gameState, updateGameState);

  // Sound management
  const soundManager = useSoundManager();
  const { volume } = useVolumeControl();
  soundManager.setMasterVolume(volume);

  // decide zombie bahavior from their types

  /**
   * Handles correct answer events
   * Updates accuracy statistics and spawns a new word
   * @param {Object} answerData - Data about the correct answer
   */
  const handleCorrectAnswer = (answerData) => {
    let answer = questionManager.currentQuestion;
    // Update accuracy statistics
    if (zombieManager.getCurrentZombie()?.behavior === 'mimic') {
      answer = zombieManager.getExtraState('realAnswer');
    }
    if (questionManager.currentQuestion) {
      questionManager.onCorrectAnswer({
        ...answerData,
        question: answer,
        isCorrect: true
      });
    }
    if (zombieBehaviors(zombieManager.getCurrentZombie(), 'correct')) return;

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

    zombieBehaviors(zombieManager.getCurrentZombie(), 'wrong');

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
  /*
  const requestNextZombie = useCallback(() => {
    // TODO: Fetch or deside the type of zombie to spawn
    // TODO: Request question(s) based on zombie type
    // TODO: Update zombieManager with the new zombie type
    // TODO: Notify playerInput to update the current answer
  }, []);
  */

  /**
   * Generate new zombie and question
   */
  const generateNewZombie = useCallback(() => {
    const zombie = zombieManager.changeCurrentZombie(questionManager.getCompletionRate());
    if (zombieBehaviors(zombie, 'generate')) return;

    const question = questionManager.selectQuestion();
    if (!question) {
      console.warn('No question available for difficulty:', gameState.currentDifficulty);
      return;
    }
    questionManager.updateCurrentQuestion(question);
    playerInput.updateCurrentAnswer(question.answer, question.difficulty);
  }, [questionManager, playerInput, zombieManager, gameState.currentDifficulty]);

  //extra handleinput for mimic
  const handleInputWithMimic = (e) => {
    const value = e.target.value;
    const currentZombie = zombieManager.getCurrentZombie();
    const behavior = currentZombie?.behavior;

    if (behavior === 'mimic') {
      const revealed = zombieManager.getExtraState('mimicRevealed');
      const realQuestion = zombieManager.getExtraState('realAnswer');
      if (!revealed && value.length > 0) {
        zombieManager.setExtraState('mimicRevealed', true);
        questionManager.updateCurrentQuestion(realQuestion);
        return;
      }
    }

    // if not mimic use origin handleinput
    playerInput.handleInputChange(e);
  };

  const zombieBehaviors = useCallback(
    (zombie, situation) => {
      const behavior = zombie.behavior;

      // Boss zombie generation logic
      if (behavior === 'boss' && situation === 'generate') {
        const boss_questionArray = questionManager.getCandidateQuestions('beginner');
        const boss_question =
          boss_questionArray[Math.floor(Math.random() * boss_questionArray.length)];
        if (!boss_question) {
          console.warn('No question available for difficulty:', gameState.currentDifficulty);
          return true;
        }
        questionManager.updateCurrentQuestion(boss_question);
        playerInput.updateCurrentAnswer(boss_question.answer, boss_question.difficulty);
        return true;
      }

      // Mimic zombie fake question logic
      if (behavior === 'mimic' && situation === 'generate') {
        const realQuestion = questionManager.selectQuestion();
        if (!realQuestion) {
          console.warn('No question available for difficulty:', gameState.currentDifficulty);
          return true;
        }
        const fakeQuestionArray = questionManager.getCandidateQuestions('beginner');
        const fakeQuestion =
          fakeQuestionArray[Math.floor(Math.random() * fakeQuestionArray.length)];
        questionManager.updateCurrentQuestion(fakeQuestion);
        playerInput.updateCurrentAnswer(realQuestion.answer, realQuestion.difficulty);
        zombieManager.setExtraState('mimicRevealed', false);
        zombieManager.setExtraState('realAnswer', realQuestion);
        return true;
      }

      if (behavior === 'chameleon' && situation === 'wrong') {
        const newQuestion = questionManager.selectQuestion();
        if (newQuestion) {
          questionManager.updateCurrentQuestion(newQuestion);
          playerInput.updateCurrentAnswer(newQuestion.answer, newQuestion.difficulty);
        }
        return;
      }
      // shield zombie break shield logic
      if (behavior === 'shield' && situation === 'correct') {
        if (!zombieManager.getExtraState('shieldHit')) {
          zombieManager.setExtraState('shieldHit', true);
          const newQuestion = questionManager.selectQuestion();
          if (newQuestion) {
            questionManager.updateCurrentQuestion(newQuestion);
            playerInput.updateCurrentAnswer(newQuestion.answer, newQuestion.difficulty);
          }
          return true;
        }
        return false;
      }
      // boss zombie three question logic with theme change
      if (behavior === 'boss' && situation === 'correct') {
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
          return true;
        } else {
          const newLives = gameState.lives + 1;
          updateGameState({ lives: newLives });
          themeManager.rotateToNextTheme();
        }
        return false;
      }
    },
    [questionManager, playerInput, zombieManager, gameState.currentDifficulty]
  );

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
  }, [themeManager.currentSample]);

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
        let next =
          chargeRate + chargeSpeed * zombieManager.getCurrentZombie().chargeSpeedMultiplier;

        zombieManager.charge(chargeSpeed * zombieManager.getCurrentZombie().chargeSpeedMultiplier);

        if (next >= 1) {
          const newLives = gameState.lives - 1;
          if (newLives <= 0) {
            updateGameState({ gameOver: true });
            soundManager.playSound('defeated');
          } else {
            updateGameState({ lives: newLives });
            playerInput.clearInput();
            if (zombieManager.getCurrentZombie().name === 'boss') {
              zombieManager.resetChargeRate();
              console.log('reset');
              setTimeout(() => {
                zombieManager.charge(0.5);
              }, 100);
            } else {
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

  useEffect(() => {
    if (
      gameState.currentTheme === '' &&
      Array.isArray(gameState.remainingThemes) &&
      gameState.remainingThemes.length === 0 &&
      !gameState.gameOver
    ) {
      themeManager.rotateToNextTheme();
    }
  }, [gameState.remainingThemes]);

  // Restart game function
  const handleRestart = useCallback(() => {
    console.log('[ChallengeMode] Restarting the game...');
    // Reset game state
    initializeGameState();

    // Reset player input
    playerInput.clearInput();

    // Reset zombie charge
    zombieManager.resetChargeRate();
  }, [initializeGameState, playerInput, zombieManager, themeManager, questionManager]);

  // Render game UI
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center challenge-container">
      {gameState.gameOver ? (
        // Game over screen
        <SummaryPage
          onBack={onBack}
          onRestart={handleRestart}
        />
      ) : (
        // Active game screen
        <>
          <h1 className="challenge-h1 display-4 fw-bold mb-4">Challenge Mode</h1>
          <p className="challenge-lead lead">Type the word to defeat the monster!</p>
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
                      backgroundColor: i < bossHp ? 'rgba(255,0,0,0.85)' : 'rgba(211,211,211,0.7)',
                      boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}
                  />
                );
              })}
            </div>
          )}
          {/* Time remaining indicator */}
          <p className={`mt-2 fw-bold bg-time-left`}>
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
              className="img-fluid rounded-circle zombie-visual"
              style={{
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)'
              }}
            />
          </div>

          {/* Current word display */}
          <div className="current-word-box">
            {questionManager.currentQuestion ? questionManager.currentQuestion.description : ''}
          </div>

          {/* User input field */}
          <input
            type="text"
            ref={playerInput.registerInputRef}
            onChange={handleInputWithMimic}
            className={`form-control text-center w-50 mx-auto p-3 fs-4 input-word-box ${playerInput.isWrong ? 'shake' : ''}`}
            autoFocus
            disabled={gameState.gameOver}
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '2px solid rgba(255, 218, 99, 0.85)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          />
          {/* Game stats */}
          <div className="game-stats d-flex justify-content-around w-50 mt-3">
            <p
              className="badge p-2"
              style={{ background: 'rgba(220,53,69,0.85)' }}
            >
              Lives: {gameState.lives}
            </p>
            <p
              className="badge p-2"
              style={{ background: 'rgba(40,167,69,0.85)' }}
            >
              Theme: {gameState.currentTheme}
            </p>
            <p
              className="charge badge p-2"
              style={{ background: 'rgba(255,218,99,0.85)' }}
            >
              Charge: {(zombieManager.getCurrentChargeRate() * 100).toFixed(0)}%
            </p>
          </div>
        </>
      )}
    </div>
  );
}
