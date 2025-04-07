import React, { act } from 'react';
import { renderHook } from '@testing-library/react';
import { usePlayerInput } from '../hooks/usePlayerInput';

describe('usePlayerInput Hook', () => {
  // Mock dependencies
  const mockGameState = {
    level: 1,
    lives: 3,
    zombiesDefeated: 0,
    gameOver: false,
    currentTheme: 'food',
    currentDifficulty: 'beginner'
  };
  
  const mockUpdateGameState = jest.fn();
  const mockPlaySound = jest.fn();
  const mockOnCorrectAnswer = jest.fn();
  const mockOnWrongAnswer = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should initialize hook correctly', () => {
    const { result } = renderHook(() => usePlayerInput({
      gameState: mockGameState,
      updateGameState: mockUpdateGameState,
      playSound: mockPlaySound,
      onCorrectAnswer: mockOnCorrectAnswer,
      onWrongAnswer: mockOnWrongAnswer
    }));
    
    // Check initial values
    expect(result.current.inputValue).toBe('');
    expect(result.current.isWrong).toBe(false);
    expect(result.current.currentWord).toBe('');
    expect(typeof result.current.handleInputChange).toBe('function');
    expect(typeof result.current.updateCurrentWord).toBe('function');
    expect(typeof result.current.clearInput).toBe('function');
    expect(typeof result.current.resetInput).toBe('function');
  });
  
  test('updateCurrentWord should update current word and difficulty', () => {
    const { result } = renderHook(() => usePlayerInput({
      gameState: mockGameState,
      updateGameState: mockUpdateGameState,
      playSound: mockPlaySound,
      onCorrectAnswer: mockOnCorrectAnswer,
      onWrongAnswer: mockOnWrongAnswer
    }));
    
    act(() => {
      result.current.updateCurrentWord('banana', 'medium');
    });
    
    expect(result.current.currentWord).toBe('banana');
  });
  
  test('clearInput should reset input state', () => {
    const { result } = renderHook(() => usePlayerInput({
      gameState: mockGameState,
      updateGameState: mockUpdateGameState,
      playSound: mockPlaySound,
      onCorrectAnswer: mockOnCorrectAnswer,
      onWrongAnswer: mockOnWrongAnswer
    }));
    
    // First set some values
    act(() => {
      result.current.updateCurrentWord('apple', 'beginner');
    });
    
    // Simulate input change event
    const mockEvent = {
      target: { value: 'app' }
    };
    
    act(() => {
      result.current.handleInputChange(mockEvent);
    });
    
    // Then clear
    act(() => {
      result.current.clearInput();
    });
    
    expect(result.current.inputValue).toBe('');
    expect(result.current.isWrong).toBe(false);
  });
  
  test('handleInputChange should call onCorrectAnswer on correct answer', () => {
    const { result } = renderHook(() => usePlayerInput({
      gameState: mockGameState,
      updateGameState: mockUpdateGameState,
      playSound: mockPlaySound,
      onCorrectAnswer: mockOnCorrectAnswer,
      onWrongAnswer: mockOnWrongAnswer
    }));
    
    // Set current word
    act(() => {
      result.current.updateCurrentWord('apple', 'beginner');
    });
    
    // Simulate correct input
    const mockEvent = {
      target: { value: 'apple' }
    };
    
    act(() => {
      result.current.handleInputChange(mockEvent);
    });
    
    // Check if callback was called
    expect(mockOnCorrectAnswer).toHaveBeenCalledWith(expect.objectContaining({
      word: 'apple',
      difficulty: 'beginner',
      input: 'apple',
      isCorrect: true
    }));
    
    // Check game state update
    expect(mockUpdateGameState).toHaveBeenCalledWith({
      zombiesDefeated: 1
    });
  });
  
  test('handleInputChange should call onWrongAnswer on wrong answer', () => {
    const { result } = renderHook(() => usePlayerInput({
      gameState: mockGameState,
      updateGameState: mockUpdateGameState,
      playSound: mockPlaySound,
      onCorrectAnswer: mockOnCorrectAnswer,
      onWrongAnswer: mockOnWrongAnswer
    }));
    
    // Set current word
    act(() => {
      result.current.updateCurrentWord('apple', 'beginner');
    });
    
    // Simulate wrong input
    const mockEvent = {
      target: { value: 'apppe' }
    };
    
    // Mock setTimeout
    jest.useFakeTimers();
    
    act(() => {
      result.current.handleInputChange(mockEvent);
    });
    
    // Check if error state is set
    expect(result.current.isWrong).toBe(true);
    
    // Check if callback was called
    expect(mockOnWrongAnswer).toHaveBeenCalledWith(expect.objectContaining({
      word: 'apple',
      difficulty: 'beginner',
      input: 'apppe',
      isCorrect: false
    }));
    
    // Advance timer to test error state reset
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(result.current.isWrong).toBe(false);
    
    // Restore timers
    jest.useRealTimers();
  });
  
  test('resetInput should completely reset all input states', () => {
    const { result } = renderHook(() => usePlayerInput({
      gameState: mockGameState,
      updateGameState: mockUpdateGameState,
      playSound: mockPlaySound,
      onCorrectAnswer: mockOnCorrectAnswer,
      onWrongAnswer: mockOnWrongAnswer
    }));
    
    // First set some values
    act(() => {
      result.current.updateCurrentWord('apple', 'beginner');
    });
    
    // Then completely reset
    act(() => {
      result.current.resetInput();
    });
    
    expect(result.current.inputValue).toBe('');
    expect(result.current.isWrong).toBe(false);
    expect(result.current.currentWord).toBe('');
  });
}); 