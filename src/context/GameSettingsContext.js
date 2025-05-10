// src/context/GameSettingsContext.js

import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
// 請根據您的實際檔案路徑引入 gameConfig 或任何其他需要的設定
// 這裡保留了您原有的引入方式
import { GAME_CONFIG as BASE_GAME_CONFIG } from '../scenes/ChallengeMode/gameConfig';

// 創建 Context
const GameSettingsContext = createContext();

// 定義 localStorage 的 Key
const LOCAL_STORAGE_INCORRECT_WORDS_KEY = 'incorrectWordsHistory';

// 定義 Provider 組件
export const GameSettingsProvider = ({ children }) => {
  // 音量狀態
  const [currentVolume, setCurrentVolume] = useState(0.5);

  // 答錯單字歷史狀態
  // 初始化時嘗試從 localStorage 載入
  const [incorrectWordsHistory, setIncorrectWordsHistory] = useState(() => {
    console.log(
      'Attempting to load incorrect words history from localStorage during initialization...'
    );
    const savedHistory = localStorage.getItem(LOCAL_STORAGE_INCORRECT_WORDS_KEY);
    console.log('localStorage.getItem returned:', savedHistory);

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        console.log('Successfully parsed history:', parsedHistory);

        // 檢查載入的數據是否為有效的陣列
        if (Array.isArray(parsedHistory)) {
          console.log('Loaded valid incorrect words history.');
          return parsedHistory; // 返回載入的歷史記錄
        } else {
          console.warn(
            'Parsed history is not an array. Clearing localStorage history and starting fresh.'
          );
          localStorage.removeItem(LOCAL_STORAGE_INCORRECT_WORDS_KEY); // 清除無效數據
          return []; // 重置為空陣列
        }
      } catch (error) {
        // 如果解析失敗，記錄錯誤並清除 localStorage 中的數據
        console.error(
          'Failed to parse incorrect words history from localStorage:',
          error,
          'Raw data:',
          savedHistory
        );
        localStorage.removeItem(LOCAL_STORAGE_INCORRECT_WORDS_KEY); // 清除破損的數據
        return []; // 重置為空陣列
      }
    } else {
      console.log(
        'No saved incorrect words history found in localStorage. Starting with an empty array.'
      );
      return []; // 如果 localStorage 中沒有數據，則初始化為空陣列
    }
  });

  // 使用 useEffect 來監聽 incorrectWordsHistory 的變化並保存到 localStorage
  useEffect(() => {
    // 避免在組件剛載入，incorrectWordsHistory 初始化為 [] 時就觸發保存
    // 只有當 incorrectWordsHistory 確實有數據時才進行保存
    // 或者當它從非空變為空時 (表示可能被清除了)
    // 為了簡單和確保狀態改變都觸發保存，這裡保留只要狀態變就保存的邏輯，
    // 但可以考慮更精確的控制，例如只在新增單字時保存。
    // 目前的邏輯是：狀態變 -> 保存。這通常是簡單可靠的方式。

    // 可以在保存前也記錄一下要保存的數據，方便偵錯
    // console.log('Attempting to save incorrect words history:', incorrectWordsHistory);

    try {
      localStorage.setItem(
        LOCAL_STORAGE_INCORRECT_WORDS_KEY,
        JSON.stringify(incorrectWordsHistory)
      );
      // console.log('Successfully saved incorrect words history.');
    } catch (error) {
      // 如果保存失敗，記錄錯誤 (例如 localStorage 空間不足)
      console.error('Failed to save incorrect words history to localStorage:', error);
      // 在實際應用中，你可能需要在這裡通知使用者 localStorage 已滿或保存失敗
    }
  }, [incorrectWordsHistory]); // 當 incorrectWordsHistory 改變時重新運行此 effect

  // 更新音量的函式
  const updateVolume = (newVolume) => {
    // 確保音量在 0 到 1 之間
    const clampedVolume = Math.max(0, Math.min(1, parseFloat(newVolume)));
    setCurrentVolume(clampedVolume);
    // 如果需要將音量也保存到 localStorage，可以在這裡添加
    // localStorage.setItem('volume', clampedVolume.toString());
    console.log(`Volume set to: ${clampedVolume}`);
  };

  /**
   * 將一個單字添加到答錯的單字歷史記錄中。
   * @param {{ word: string, storyId: string, sceneId: number, timestamp: string }} wordInfo - 包含單字及其相關信息的對象。
   */
  const addIncorrectWord = (wordInfo) => {
    // 簡單驗證傳入的數據
    if (wordInfo && typeof wordInfo.word === 'string' && wordInfo.word.trim() !== '') {
      setIncorrectWordsHistory((prevHistory) => {
        const newHistory = [...prevHistory, wordInfo];
        // console.log('Added incorrect word. New history:', newHistory);
        return newHistory;
      });
    } else {
      console.warn('Attempted to add invalid word info to history:', wordInfo);
    }
  };

  // 使用 useMemo 記憶 context 的值，避免不必要的重新渲染
  const contextValue = useMemo(
    () => ({
      volume: currentVolume, // 當前音量
      updateVolume, // 更新音量的方法
      gameConfig: { ...BASE_GAME_CONFIG }, // 遊戲設定 (複製一份以防修改原始對象)
      incorrectWordsHistory, // 答錯單字歷史記錄陣列
      addIncorrectWord // 添加答錯單字的方法
    }),
    // 依賴項列表：只有當這些值改變時，useMemo 才會重新計算 contextValue
    [currentVolume, incorrectWordsHistory, BASE_GAME_CONFIG]
  );

  // 提供 Context 值給子組件
  return (
    <GameSettingsContext.Provider value={contextValue}>{children}</GameSettingsContext.Provider>
  );
};

// 自定義 Hook: 獲取 GameSettingsContext 的所有值
export const useGameSettings = () => {
  const context = useContext(GameSettingsContext);
  if (context === undefined) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
};

// 自定義 Hook: 只獲取音量控制相關的值 (方便使用)
export const useVolumeControl = () => {
  const { volume, updateVolume } = useGameSettings();
  return { volume, updateVolume };
};

// 自定義 Hook: 只獲取答錯單字歷史記錄 (方便讀取)
export const useIncorrectWords = () => {
  const { incorrectWordsHistory } = useGameSettings();
  return incorrectWordsHistory;
};

// 自定義 Hook: 只獲取添加答錯單字的方法 (方便寫入)
export const useAddIncorrectWord = () => {
  const { addIncorrectWord } = useGameSettings();
  return addIncorrectWord;
};
