import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChallengeMode from '../ChallengeMode';

// 為測試創建模擬函數
const mockHandleInputChange = jest.fn();

// Mock hook dependencies
jest.mock('../hooks/useGameState', () => ({
  useGameState: () => ({
    gameState: {
      level: 1,
      lives: 3,
      zombiesDefeated: 0,
      gameOver: false,
      currentTheme: 'food',
      currentDifficulty: 'beginner',
      remainingThemes: ['food']
    },
    updateGameState: jest.fn()
  })
}));

jest.mock('../hooks/useLevelManager', () => ({
  useLevelManager: () => ({
    getChargeSpeed: () => 0.03
  })
}));

jest.mock('../hooks/useThemeManager', () => ({
  useThemeManager: () => ({
    currentSample: {
      theme: 'food',
      words: [
        { word: 'apple', difficulty: 'beginner' },
        { word: 'banana', difficulty: 'beginner' },
        { word: 'cucumber', difficulty: 'medium' }
      ]
    }
  })
}));

jest.mock('../hooks/useQuestionManager', () => ({
  useQuestionManager: () => ({
    updateSamplePool: jest.fn(),
    selectQuestion: () => ({ answer: 'apple', difficulty: 'beginner' }),
    handleCorrectAnswer: jest.fn(),
    handleWrongAnswer: jest.fn(),
    getThemeAccuracy: () => 85,
    getThemeStats: () => ({ correctAnswers: 5, totalAnswers: 6 }),
    currentQuestion: { answer: 'apple', difficulty: 'beginner' }
  })
}));

jest.mock('../hooks/useZombieManager', () => ({
  useZombieManager: () => ({
    zombieState: {
      currentZombie: 1,
      currentChargeRate: 0.3
    },
    changeCurrentZombie: jest.fn(),
    setChargerate: jest.fn()
  })
}));

jest.mock('../hooks/useSoundManager', () => ({
  useSoundManager: () => ({
    playSound: jest.fn()
  })
}));

jest.mock('../hooks/usePlayerInput', () => ({
  usePlayerInput: () => ({
    inputValue: '',
    isWrong: false,
    currentWord: 'apple',
    handleInputChange: mockHandleInputChange,
    updateCurrentWord: jest.fn(),
    clearInput: jest.fn(),
    resetInput: jest.fn()
  })
}));

// Mock timers
jest.useFakeTimers();

describe('ChallengeMode Component', () => {
  const mockOnBack = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render game interface correctly', () => {
    render(<ChallengeMode onBack={mockOnBack} />);
    
    // Check if titles exist
    expect(screen.getByText('Monster Typing Game')).toBeInTheDocument();
    expect(screen.getByText('Type the word to defeat the monster!')).toBeInTheDocument();
  });
  
  test('should display game over screen when game is over', () => {
    // Override useGameState mock to make gameOver true
    jest.spyOn(require('../hooks/useGameState'), 'useGameState').mockImplementation(() => ({
      gameState: {
        level: 2,
        lives: 0,
        zombiesDefeated: 10,
        gameOver: true,
        currentTheme: 'food',
        currentDifficulty: 'beginner',
        remainingThemes: []
      },
      updateGameState: jest.fn()
    }));
    
    render(<ChallengeMode onBack={mockOnBack} />);
    
    // Check game over messages
    expect(screen.getByText('You Died!')).toBeInTheDocument();
    expect(screen.getByText('Final Score: Level 2')).toBeInTheDocument();
    expect(screen.getByText('Theme Accuracy: 85%')).toBeInTheDocument();
    
    // Check back button
    const backButton = screen.getByText('Back Menu');
    expect(backButton).toBeInTheDocument();
    
    // Test clicking back button
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
}); 