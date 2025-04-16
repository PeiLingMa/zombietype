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
  // 追蹤初始化狀態的 ref
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
    // 使用臨時變數 themeList 來跟踪正確的值
    let themeList = [];
    
    if (!gameState.remainingThemes || gameState.remainingThemes.length === 0) {
      console.log('refilling the pool');
      // 如果題庫為空，使用完整的主題池
      themeList = [...GAME_CONFIG.THEME_POOL];
      
      // 更新狀態 (這不會立即生效，但沒關係，因為我們已經有正確的值在 themeList)
      updateGameState({
        remainingThemes: [...themeList]
      });
    } else {
      // 否則使用現有的主題列表
      themeList = [...gameState.remainingThemes];
    }

    // 從臨時變數中選擇第一個主題
    const nextTheme = themeList[0];
    
    // 從臨時變數中移除第一個主題
    const updatedThemes = themeList.slice(1);
    
    // 更新狀態中的剩餘主題
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
      
      console.log('Fetching theme data...');
      const data = await loadThemeData();
      
      if (data) {
        isInitialized.current = true;
        
        // 只有在尚未設置主題時才設置
        if (!gameState.currentTheme || gameState.currentTheme === '') {
          selectNextTheme();
        }
      }
    }
    
    initializeThemeData();
  }, []); // 空依賴陣列，確保只執行一次

  // Create sample when theme changes
  useEffect(() => {
    if (gameState.currentTheme && allThemeData.current) {
      createThemeSample(gameState.currentTheme);
    }
  }, [gameState.currentTheme, createThemeSample]);

  return {
    currentSample,
    rotateToNextTheme
  };
};
