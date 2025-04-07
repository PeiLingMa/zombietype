import { useState, useCallback, useRef } from 'react';
import { GAME_CONFIG } from '../gameConfig';

/**
 * Custom hook to manage question selection and difficulty progression
 *
 * Core features:
 * - Selects questions with difficulty based on completion rate
 * - Tracks correctly answered questions
 * - Manages question pool with immediate updates using refs
 *
 * @param {Object} gameState - Current game state
 * @param {Function} updateGameState - Function to update game state
 * @returns {Object} Question management API
 */
export const useQuestionManager = (gameState, updateGameState) => {
  // Store candidate pool (correctly answered questions) as ref for immediate updates
  const candidatePoolRef = useRef([]);

  // Currently selected question
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Current theme question pool by difficulty
  const currentSampleRef = useRef({
    beginner: [],
    medium: [],
    hard: []
  });

  /**
   * Generates a unique ID for a question
   */
  const generateQuestionId = useCallback((question) => {
    if (question.id) return question.id;

    // Generate ID from key properties for stability
    const idParts = [];
    if (question.type) idParts.push(question.type);
    if (question.description) idParts.push(question.description);
    if (question.answer) idParts.push(question.answer);

    return idParts.length > 0 ? idParts.join('_') : JSON.stringify(question);
  }, []);

  /**
   * Updates the question pool with a new set of questions
   * Resets candidate pool when theme changes
   */
  const updateSamplePool = useCallback(
    (sample) => {
      // Add IDs and difficulty markers to all questions
      const processedSample = {
        beginner: (sample.beginner || []).map((q) => ({
          ...q,
          _qid: generateQuestionId(q),
          difficulty: 'beginner'
        })),
        medium: (sample.medium || []).map((q) => ({
          ...q,
          _qid: generateQuestionId(q),
          difficulty: 'medium'
        })),
        hard: (sample.hard || []).map((q) => ({
          ...q,
          _qid: generateQuestionId(q),
          difficulty: 'hard'
        }))
      };

      currentSampleRef.current = processedSample;
      candidatePoolRef.current = [];
    },
    [gameState.currentTheme, generateQuestionId]
  );

  /**
   * Calculates completion rate based on answered questions
   */
  const getCompletionRate = useCallback(() => {
    const total = GAME_CONFIG.SAMPLE_SIZE;
    const answered = candidatePoolRef.current.length;
    return total > 0 ? answered / total : 0;
  }, []);

  /**
   * Updates the current question
   */
  const updateCurrentQuestion = useCallback((question) => {
    setCurrentQuestion((prev) => question);
  }, []);

  /**
   * Selects a question with dynamic difficulty based on completion rate
   * Uses a weighted random selection (roulette wheel) approach
   */
  const selectQuestion = useCallback(() => {
    // Calculate remaining questions by difficulty
    const remainingByDifficulty = {
      beginner: currentSampleRef.current.beginner?.length || 0,
      medium: currentSampleRef.current.medium?.length || 0,
      hard: currentSampleRef.current.hard?.length || 0
    };

    const totalRemaining =
      remainingByDifficulty.beginner + remainingByDifficulty.medium + remainingByDifficulty.hard;

    // Handle edge case: no questions remaining
    if (totalRemaining === 0) return null;

    // Get current completion rate
    const completionRate = getCompletionRate();

    // Determine weights based on completion rate (progression curve)
    let weights;

    if (completionRate < 0.2) {
      // Early stage: mostly beginner questions
      weights = { beginner: 0.8, medium: 0.15, hard: 0.05 };
    } else if (completionRate < 0.4) {
      // Early-mid transition
      weights = { beginner: 0.6, medium: 0.3, hard: 0.1 };
    } else if (completionRate < 0.6) {
      // Mid stage: focus on medium difficulty
      weights = { beginner: 0.3, medium: 0.5, hard: 0.2 };
    } else if (completionRate < 0.8) {
      // Mid-late transition
      weights = { beginner: 0.2, medium: 0.5, hard: 0.3 };
    } else {
      // Final stage: focus on hard questions
      weights = { beginner: 0.1, medium: 0.3, hard: 0.6 };
    }

    // Adjust weights based on available questions
    const adjustedWeights = {
      beginner: remainingByDifficulty.beginner > 0 ? weights.beginner : 0,
      medium: remainingByDifficulty.medium > 0 ? weights.medium : 0,
      hard: remainingByDifficulty.hard > 0 ? weights.hard : 0
    };

    // Normalize weights to sum to 1
    const sumWeights = adjustedWeights.beginner + adjustedWeights.medium + adjustedWeights.hard;

    adjustedWeights.beginner /= sumWeights;
    adjustedWeights.medium /= sumWeights;
    adjustedWeights.hard /= sumWeights;

    // Roulette wheel selection for difficulty
    const random = Math.random();
    let targetDifficulty;

    if (random < adjustedWeights.beginner) {
      targetDifficulty = 'beginner';
    } else if (random < adjustedWeights.beginner + adjustedWeights.medium) {
      targetDifficulty = 'medium';
    } else {
      targetDifficulty = 'hard';
    }

    // Find questions of selected difficulty or fallback to any available difficulty
    let finalPool = currentSampleRef.current[targetDifficulty];

    if (!finalPool || finalPool.length === 0) {
      // Try alternative difficulties if target has no questions
      const difficulties = ['beginner', 'medium', 'hard'];
      for (const diff of difficulties) {
        if (currentSampleRef.current[diff]?.length > 0) {
          targetDifficulty = diff;
          finalPool = currentSampleRef.current[diff];
          break;
        }
      }
    }

    // Randomly select a question from the chosen difficulty
    const randomIndex = Math.floor(Math.random() * finalPool.length);
    const selectedQuestion = { ...finalPool[randomIndex] };

    // setCurrentQuestion(selectedQuestion);
    return selectedQuestion;
  }, [getCompletionRate]);

  /**
   * Handles correct answer:
   * - Removes question from question pool
   * - Adds to candidate pool
   */
  const onCorrectAnswer = useCallback(
    (answerData) => {
      const { question } = answerData;
      if (!question) return;

      const difficulty = question.difficulty;
      if (!difficulty || !currentSampleRef.current[difficulty]) return;

      const questionId = question._qid || generateQuestionId(question);

      // Remove from question pool
      currentSampleRef.current[difficulty] = currentSampleRef.current[difficulty].filter(
        (q) => q._qid !== questionId
      );

      // Add to candidate pool
      const questionToAdd = {
        ...question,
        _qid: questionId,
        difficulty
      };

      candidatePoolRef.current.push(questionToAdd);
    },
    [generateQuestionId]
  );

  /**
   * Handles wrong answer (question remains in pool)
   */
  const onWrongAnswer = useCallback(() => {}, []);

  /**
   * Returns questions from candidate pool for specific difficulty
   */
  const getCandidateQuestions = useCallback(
    (difficulty) => candidatePoolRef.current.filter((q) => q.difficulty === difficulty),
    []
  );

  /**
   * Clears candidate pool
   */
  const clearCandidatePool = useCallback(() => {
    candidatePoolRef.current = [];
  }, []);

  // Stub functions for backward compatibility
  const getThemeAccuracy = useCallback(() => 0, []);
  const getThemeStats = useCallback(() => ({ correct: 0, total: 0 }), []);

  return {
    updateSamplePool,
    updateCurrentQuestion,
    selectQuestion,
    onCorrectAnswer,
    onWrongAnswer,
    getThemeAccuracy,
    getThemeStats,
    getCandidateQuestions,
    clearCandidatePool,
    currentQuestion
  };
};
