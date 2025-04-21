import { useState, useCallback, useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../gameConfig';

/**
 * Shuffle algorithm - randomly orders an array
 * @param {Array} array - Array to be shuffled
 * @returns {Array} New shuffled array
 */
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

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
  // Track initialization state
  const isInitialized = useRef(false);

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
    // Use temporary themeList variable to track correct values
    let themeList = [];

    if (!gameState.remainingThemes || gameState.remainingThemes.length === 0) {
      console.log('useThemeManager: Refilling the pool');
      // If theme pool is empty, use the complete theme pool and shuffle it
      themeList = shuffleArray([...GAME_CONFIG.THEME_POOL]);

      // Update state (this won't take effect immediately, but it's fine as we have correct values in themeList)
      updateGameState({
        remainingThemes: [...themeList]
      });
    } else {
      // Otherwise use existing theme list
      themeList = [...gameState.remainingThemes];
    }

    // Select first theme from temporary variable
    const nextTheme = themeList[0];

    // Remove first theme from temporary variable
    const updatedThemes = themeList.slice(1);

    // Update remaining themes in state
    updateGameState({
      currentTheme: nextTheme,
      remainingThemes: updatedThemes
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
      // Get data for the current theme
      const themeData = allThemeData.current.topics[theme];
      if (!themeData) return;

      console.log('useThemeManager: Creating sample...');

      // Use theme rotation count to determine sampling ratios
      const themeRound = gameState.completedThemes ? gameState.completedThemes.length : 0;
      const samplingRatios =
        themeRound >= 3
          ? GAME_CONFIG.SAMPLING_RATIOS.ADVANCED
          : GAME_CONFIG.SAMPLING_RATIOS.INITIAL;

      // Calculate sample size for each difficulty
      const totalSampleSize = GAME_CONFIG.SAMPLE_SIZE;
      const beginnerCount = Math.floor(totalSampleSize * samplingRatios.beginner);
      const mediumCount = Math.floor(totalSampleSize * samplingRatios.medium);
      const hardCount = Math.floor(totalSampleSize * samplingRatios.hard);

      // Sample from each difficulty
      const beginner = sampleFromDifficulty('beginner', beginnerCount);
      const medium = sampleFromDifficulty('medium', mediumCount);
      const hard = sampleFromDifficulty('hard', hardCount);

      // Set the samples for each difficulty
      setCurrentSample({
        beginner,
        medium,
        hard
      });
    },
    [sampleFromDifficulty, gameState.completedThemes]
  );

  /**
   * Rotates to the next theme
   * Creates a new sample for the next theme
   */
  const rotateToNextTheme = useCallback(() => {
    // Mark current theme as completed
    if (gameState.currentTheme) {
      updateGameState({
        completedThemes: [...(gameState.completedThemes || []), gameState.currentTheme]
      });
    }

    // Select and switch to next theme
    const nextTheme = selectNextTheme();
    createThemeSample(nextTheme);
  }, [selectNextTheme, createThemeSample, gameState.currentTheme, updateGameState]);

  // Initialize theme data on first load
  useEffect(() => {
    async function initializeThemeData() {
      if (isInitialized.current) return;

      console.log('useThemeManager: Fetching raw data...');
      const data = await loadThemeData();

      if (data) {
        console.log('useThemeManager: Data loaded.');
        isInitialized.current = true;

        // Only set theme if not already set
        if (!gameState.currentTheme || gameState.currentTheme === '') {
          selectNextTheme();
        }
      }
    }

    initializeThemeData();
  }, []); // Empty dependency array to ensure it runs only once

  // Create sample when theme changes
  useEffect(() => {
    if (gameState.currentTheme !== '' && allThemeData.current) {
      createThemeSample(gameState.currentTheme);
    }
  }, [gameState.currentTheme, createThemeSample]);

  return {
    currentSample,
    rotateToNextTheme
  };
};
