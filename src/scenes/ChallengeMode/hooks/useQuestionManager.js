import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to manage question selection, candidate pool, and answer statistics
 *
 * @param {Object} gameState - Current game state
 * @param {Function} updateGameState - Function to update game state
 * @returns {Object} Question management functions and state
 */
export const useQuestionManager = (gameState, updateGameState) => {
  // Candidate pool - questions that have appeared
  const [candidatePool, setCandidatePool] = useState({});

  // Answer statistics - for accuracy calculation
  const [answerStats, setAnswerStats] = useState({});

  // Currently selected question
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Reference to current theme sample
  const currentSampleRef = useRef({
    beginner: [],
    medium: [],
    hard: []
  });

  /**
   * Update current theme sample pool
   * @param {Object} sample - Current theme sample with questions of various difficulties
   */
  const updateSamplePool = useCallback((sample) => {
    currentSampleRef.current = sample;
  }, []);

  /**
   * Select a question based on difficulty
   * Implements non-decreasing difficulty selection logic
   * @param {string} difficulty - Target difficulty
   * @param {number} zombieCount - Current zombie count (for non-decreasing difficulty)
   * @returns {Object} Selected question
   */
  const selectQuestion = useCallback((difficulty, zombieCount = 1) => {
    // If no questions of current difficulty, try lower difficulty
    const difficulties = ['beginner', 'medium', 'hard'];
    const difficultyIndex = difficulties.indexOf(difficulty);

    // Choose appropriate difficulty based on zombie count and non-decreasing principle
    let targetDifficulty = difficulty;

    // First zombie uses lowest difficulty questions
    if (zombieCount === 1) {
      // Start from lowest difficulty and find available questions
      for (let i = 0; i <= difficultyIndex; i++) {
        if (currentSampleRef.current[difficulties[i]]?.length > 0) {
          targetDifficulty = difficulties[i];
          break;
        }
      }
    }
    // Zombies 2-4 use same or higher difficulty
    else if (zombieCount >= 2 && zombieCount <= 4) {
      // Start from target difficulty and find available questions
      let found = false;
      for (let i = difficultyIndex; i < difficulties.length; i++) {
        if (currentSampleRef.current[difficulties[i]]?.length > 0) {
          targetDifficulty = difficulties[i];
          found = true;
          break;
        }
      }

      // If no higher difficulty available, fall back to lower difficulties
      if (!found) {
        for (let i = difficultyIndex - 1; i >= 0; i--) {
          if (currentSampleRef.current[difficulties[i]]?.length > 0) {
            targetDifficulty = difficulties[i];
            break;
          }
        }
      }
    }
    // Last zombie preferably uses highest difficulty
    else if (zombieCount === 5) {
      if (currentSampleRef.current.hard?.length > 0) {
        targetDifficulty = 'hard';
      } else if (currentSampleRef.current.medium?.length > 0) {
        targetDifficulty = 'medium';
      } else {
        targetDifficulty = 'beginner';
      }
    }

    // No available questions
    if (
      !currentSampleRef.current[targetDifficulty] ||
      currentSampleRef.current[targetDifficulty].length === 0
    ) {
      return null;
    }

    // Randomly select a question
    const pool = currentSampleRef.current[targetDifficulty];
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedQuestion = { ...pool[randomIndex] };

    // Remove selected question from sample pool
    currentSampleRef.current[targetDifficulty] = [
      ...pool.slice(0, randomIndex),
      ...pool.slice(randomIndex + 1)
    ];

    // Set current question
    setCurrentQuestion(selectedQuestion);
    return selectedQuestion;
  }, []);

  /**
   * Handle correct answer
   * Update accuracy statistics and add question to candidate pool
   * @param {Object} answerData - Answer related data
   */
  const handleCorrectAnswer = useCallback(
    (answerData) => {
      const { question, theme = gameState.currentTheme } = answerData;

      // Return if no question data
      if (!question) return;

      // Update answer statistics
      setAnswerStats((prev) => {
        const themeStats = prev[theme] || {
          correct: 0,
          total: 0,
          questions: {}
        };

        // Update question-specific statistics
        const questionId = question.id || JSON.stringify(question);
        const questionStats = themeStats.questions[questionId] || { correct: 0, attempts: 0 };

        return {
          ...prev,
          [theme]: {
            correct: themeStats.correct + 1,
            total: themeStats.total + 1,
            questions: {
              ...themeStats.questions,
              [questionId]: {
                correct: questionStats.correct + 1,
                attempts: questionStats.attempts + 1,
                question
              }
            }
          }
        };
      });

      // Add question to candidate pool
      setCandidatePool((prev) => {
        const themePool = prev[gameState.currentTheme] || {
          beginner: [],
          medium: [],
          hard: []
        };

        // Check if question already exists in candidate pool
        const difficulty = question.difficulty || 'beginner';
        const questionId = question.id || JSON.stringify(question);
        const exists = themePool[difficulty].some(
          (q) => (q.id && q.id === questionId) || JSON.stringify(q) === JSON.stringify(question)
        );

        if (!exists) {
          return {
            ...prev,
            [gameState.currentTheme]: {
              ...themePool,
              [difficulty]: [...themePool[difficulty], question]
            }
          };
        }

        return prev;
      });
    },
    [gameState.currentTheme]
  );

  /**
   * Handle wrong answer
   * Update accuracy statistics
   * @param {Object} answerData - Answer related data
   */
  const handleWrongAnswer = useCallback(
    (answerData) => {
      const { question, theme = gameState.currentTheme } = answerData;

      // Return if no question data
      if (!question) return;

      // Update answer statistics
      setAnswerStats((prev) => {
        const themeStats = prev[theme] || {
          correct: 0,
          total: 0,
          questions: {}
        };

        // Update question-specific statistics
        const questionId = question.id || JSON.stringify(question);
        const questionStats = themeStats.questions[questionId] || { correct: 0, attempts: 0 };

        return {
          ...prev,
          [theme]: {
            correct: themeStats.correct,
            total: themeStats.total + 1,
            questions: {
              ...themeStats.questions,
              [questionId]: {
                correct: questionStats.correct,
                attempts: questionStats.attempts + 1,
                question
              }
            }
          }
        };
      });
    },
    [gameState.currentTheme]
  );

  /**
   * Calculate accuracy for current theme
   * @returns {number} Accuracy percentage (0-100)
   */
  const getThemeAccuracy = useCallback(() => {
    const theme = gameState.currentTheme;
    const stats = answerStats[theme];

    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  }, [answerStats, gameState.currentTheme]);

  /**
   * Get accuracy statistics for current theme
   * Provide to LevelManager for Boss Level determination
   * @returns {Object} Current theme statistics
   */
  const getThemeStats = useCallback(() => {
    const theme = gameState.currentTheme;
    return answerStats[theme] || { correct: 0, total: 0 };
  }, [answerStats, gameState.currentTheme]);

  /**
   * Get questions from candidate pool for specified difficulty
   * For Boss-Level and other special cases
   * @param {string} difficulty - Difficulty to retrieve
   * @returns {Array} List of candidate questions for the difficulty
   */
  const getCandidateQuestions = useCallback(
    (difficulty) => {
      const theme = gameState.currentTheme;
      const pool = candidatePool[theme];

      if (!pool || !pool[difficulty]) return [];
      return [...pool[difficulty]];
    },
    [candidatePool, gameState.currentTheme]
  );

  /**
   * Clear candidate pool for current theme
   */
  const clearCandidatePool = useCallback(() => {
    setCandidatePool((prev) => ({
      ...prev,
      [gameState.currentTheme]: {
        beginner: [],
        medium: [],
        hard: []
      }
    }));
  }, [gameState.currentTheme]);

  return {
    updateSamplePool,
    selectQuestion,
    handleCorrectAnswer,
    handleWrongAnswer,
    getThemeAccuracy,
    getThemeStats,
    getCandidateQuestions,
    clearCandidatePool,
    currentQuestion
  };
};
