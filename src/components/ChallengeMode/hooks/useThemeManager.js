import { useState, useCallback, useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../gameConfig';

/**
 * Custom hook to manage theme rotation and sampling in Challenge Mode
 * Handles theme selection, rotation, and sampling from the question pool
 *
 * @param {Object} gameState - Current game state
 * @param {Function} updateGameState - Function to update game state
 * @returns {Object} Theme management functions and state
 */
export const useThemeManager = (gameState, updateGameState) => {
  // Reference to store all available data from data.json
  const allThemeData = useRef(null);

  // Current theme sample (subset of questions selected for current theme)
  const [currentSample, setCurrentSample] = useState({
    beginner: [],
    medium: [],
    hard: []
  });

  /**
   * Loads the complete theme data from data.json
   * @returns {Promise} Promise that resolves when data is loaded
   */
  const loadThemeData = useCallback(async () => {
    try {
      const response = await fetch(process.env.PUBLIC_URL + '/data.json');
      const data = await response.json();
      allThemeData.current = data;
      return data;
    } catch (error) {
      console.error('Failed to load theme data:', error);
      return null;
    }
  }, []);

  /**
   * Selects a new theme using Round-Robin approach
   * Removes the theme from the remaining themes pool
   * @returns {string} Selected theme name
   */
  const selectNextTheme = useCallback(() => {
    if (!gameState.remainingThemes || gameState.remainingThemes.length === 0) {
      // If all themes have been used, refill the pool
      updateGameState({
        remainingThemes: [...GAME_CONFIG.THEME_POOL]
      });
    }

    // Select the first theme from remaining themes
    const remainingThemes = [...gameState.remainingThemes];
    const nextTheme = remainingThemes.shift();

    // Update game state with new theme and remaining themes
    updateGameState({
      currentTheme: nextTheme,
      remainingThemes: remainingThemes
    });

    return nextTheme;
  }, [gameState.remainingThemes, updateGameState]);

  /**
   * Helper function to sample questions from a specific difficulty
   * @param {string} difficulty - Difficulty level of the questions
   * @param {number} count - Number of questions to sample
   * @returns {Array} Sampled questions
   */
  const sampleFromDifficulty = useCallback(
    (difficulty, count) => {
      if (!allThemeData.current || !gameState.currentTheme) return [];

      const themeData = allThemeData.current.topics[gameState.currentTheme];
      if (!themeData || !themeData[difficulty]) return [];

      const questions = themeData[difficulty];

      // Ensure we don't try to sample more than available
      const actualCount = Math.min(count, questions.length);
      const sample = [];

      // Simple random sampling without replacement
      const indices = new Set();
      while (indices.size < actualCount) {
        const randomIndex = Math.floor(Math.random() * questions.length);
        if (!indices.has(randomIndex)) {
          indices.add(randomIndex);
          sample.push(questions[randomIndex]);
        }
      }

      return sample;
    },
    [gameState.currentTheme]
  );

  /**
   * Creates a sample of questions from the current theme
   * Uses different sampling ratios based on game progression
   * @param {string} theme - Theme to sample from
   * @returns {Array} Array of sampled questions
   */
  const createThemeSample = useCallback(
    (theme) => {
      if (!allThemeData.current || !theme) return;

      // Get data for the current theme
      const themeData = allThemeData.current.topics[theme];
      if (!themeData) return;

      // 使用主題輪替次數決定採樣比例
      const themeRound = gameState.completedThemes ? gameState.completedThemes.length : 0;
      const samplingRatios =
        themeRound >= 3
          ? GAME_CONFIG.SAMPLING_RATIOS.ADVANCED
          : GAME_CONFIG.SAMPLING_RATIOS.INITIAL;

      // 計算每個難度的採樣數量
      const totalSampleSize = GAME_CONFIG.SAMPLE_SIZE;
      const beginnerCount = Math.floor(totalSampleSize * samplingRatios.beginner);
      const mediumCount = Math.floor(totalSampleSize * samplingRatios.medium);
      const hardCount = Math.floor(totalSampleSize * samplingRatios.hard);

      // 依照難度進行採樣
      const beginner = sampleFromDifficulty('beginner', beginnerCount);
      const medium = sampleFromDifficulty('medium', mediumCount);
      const hard = sampleFromDifficulty('hard', hardCount);

      // 將所有難度的樣本合併成一個陣列
      const sample = [...beginner, ...medium, ...hard];
      setCurrentSample({
        beginner,
        medium,
        hard
      });
    },
    [sampleFromDifficulty, gameState.completedThemes]
  );

  /**
   * Stub function for handling correct answers
   * To be replaced by QuestionManager implementation
   * @param {Object} answerData - Data about the correct answer
   */
  const handleCorrectAnswer = useCallback((answerData) => {
    // Placeholder for future QuestionManager implementation
    console.log('Correct answer:', answerData);
  }, []);

  /**
   * Stub function for handling wrong answers
   * To be replaced by QuestionManager implementation
   * @param {Object} answerData - Data about the wrong answer
   */
  const handleWrongAnswer = useCallback((answerData) => {
    // Placeholder for future QuestionManager implementation
    console.log('Wrong answer:', answerData);
  }, []);

  /**
   * Stub function to return theme accuracy
   * To be replaced by QuestionManager implementation
   * @returns {number} Placeholder accuracy value
   */
  const getThemeAccuracy = useCallback(() => {
    // Placeholder for future QuestionManager implementation
    return 0;
  }, []);

  /**
   * Rotates to the next theme
   * Creates a new sample for the next theme
   */
  const rotateToNextTheme = useCallback(() => {
    const nextTheme = selectNextTheme();
    createThemeSample(nextTheme);
  }, [selectNextTheme, createThemeSample, gameState.currentTheme, updateGameState]);

  /**
   * Gets questions filtered by difficulty
   * @param {string} difficulty - Difficulty level to filter by
   * @returns {Array} Filtered questions
   */
  const getQuestionsByDifficulty = useCallback(
    (difficulty) => {
      return currentSample[difficulty];
    },
    [currentSample]
  );

  // Initialize theme data on first load
  useEffect(() => {
    async function initializeThemeData() {
      const data = await loadThemeData();
      console.log('Fetched data: ', data);
      if (data && (!gameState.currentTheme || gameState.currentTheme === '')) {
        selectNextTheme();
      }
    }
    initializeThemeData();
    return () => console.log('initializeThemeData executing.');
  }, []);

  // Create sample when theme changes
  useEffect(() => {
    if (gameState.currentTheme && allThemeData.current) {
      createThemeSample(gameState.currentTheme);
    }
  }, [gameState.currentTheme, createThemeSample]);

  return {
    currentSample,
    getQuestionsByDifficulty,
    handleCorrectAnswer,
    handleWrongAnswer,
    getThemeAccuracy,
    rotateToNextTheme
  };
};
