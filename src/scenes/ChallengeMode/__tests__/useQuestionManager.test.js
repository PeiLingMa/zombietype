import React, { act } from 'react';
import { renderHook } from '@testing-library/react';
import { useQuestionManager } from '../hooks/useQuestionManager';
import { GAME_CONFIG } from '../gameConfig';

// Mock GAME_CONFIG
jest.mock('../gameConfig', () => ({
  GAME_CONFIG: {
    SAMPLE_SIZE: 10
  }
}));

describe('useQuestionManager Hook', () => {
  // Mock dependencies
  const mockGameState = {
    currentTheme: 'food',
    currentDifficulty: 'beginner'
  };

  const mockUpdateGameState = jest.fn();

  // Sample test questions data
  const testQuestions = {
    beginner: [
      { type: 'vocabulary', description: 'apple', answer: 'apple', PoS: 'n.', translation: '蘋果' },
      {
        type: 'vocabulary',
        description: 'banana',
        answer: 'banana',
        PoS: 'n.',
        translation: '香蕉'
      }
    ],
    medium: [
      {
        type: 'vocabulary',
        description: 'strawberry',
        answer: 'strawberry',
        PoS: 'n.',
        translation: '草莓'
      },
      {
        type: 'vocabulary',
        description: 'blueberry',
        answer: 'blueberry',
        PoS: 'n.',
        translation: '藍莓'
      }
    ],
    hard: [
      {
        type: 'vocabulary',
        description: 'pomegranate',
        answer: 'pomegranate',
        PoS: 'n.',
        translation: '石榴'
      },
      {
        type: 'vocabulary',
        description: 'dragonfruit',
        answer: 'dragonfruit',
        PoS: 'n.',
        translation: '火龍果'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Math.random to ensure deterministic results for selectQuestion
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  test('should initialize hook correctly', () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    // Check that all expected functions are returned
    expect(result.current.updateSamplePool).toBeDefined();
    expect(result.current.selectQuestion).toBeDefined();
    expect(result.current.onCorrectAnswer).toBeDefined();
    expect(result.current.onWrongAnswer).toBeDefined();
    expect(result.current.getThemeAccuracy).toBeDefined();
    expect(result.current.getThemeStats).toBeDefined();
    expect(result.current.getCandidateQuestions).toBeDefined();
    expect(result.current.clearCandidatePool).toBeDefined();
    expect(result.current.currentQuestion).toBeNull();
  });

  test('updateCurrentQuestion should update current question state', async () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    // Initial state should be null
    expect(result.current.currentQuestion).toBeNull();

    const mockQuestion = {
      type: 'vocabulary',
      description: 'apple',
      answer: 'apple',
      difficulty: 'beginner',
      _qid: 'vocabulary_apple_apple'
    };

    await act(async () => {
      result.current.updateCurrentQuestion(mockQuestion);
    });

    // Current question should be updated
    expect(result.current.currentQuestion).toEqual(mockQuestion);

    // Test updating with a different question
    const newMockQuestion = {
      type: 'vocabulary',
      description: 'banana',
      answer: 'banana',
      difficulty: 'beginner',
      _qid: 'vocabulary_banana_banana'
    };

    await act(async () => {
      result.current.updateCurrentQuestion(newMockQuestion);
    });

    expect(result.current.currentQuestion).toEqual(newMockQuestion);
  });

  test('updateSamplePool should process and store questions', async () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    await act(async () => {
      result.current.updateSamplePool(testQuestions);
    });

    // Call selectQuestion to verify pool was updated
    await act(async () => {
      const question = result.current.selectQuestion();
      expect(question).not.toBeNull();
      expect(question.difficulty).toBeDefined();
      expect(question._qid).toBeDefined();
    });
  });

  test('selectQuestion should select questions with weighted difficulty based on completion rate', async () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    await act(async () => {
      result.current.updateSamplePool(testQuestions);
    });

    // Mock early stage (favor beginner questions)
    jest.spyOn(global.Math, 'random').mockImplementation(() => 0.1);

    let question;
    await act(async () => {
      question = result.current.selectQuestion();
    });

    expect(question).not.toBeNull();
    // Should select beginner at early stage with 0.1 random value
    expect(question.difficulty).toBe('beginner');

    // Answer the first question correctly
    await act(async () => {
      result.current.onCorrectAnswer({ question });
    });

    // Now get another question
    jest.spyOn(global.Math, 'random').mockImplementation(() => 0.85);

    await act(async () => {
      question = result.current.selectQuestion();
    });

    // With early completion and 0.85 random value, should select hard less frequently
    // but since our mock is high, it could select hard
    expect(question).not.toBeNull();
  });

  test('onCorrectAnswer should move question from pool to candidate pool', async () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    await act(async () => {
      result.current.updateSamplePool(testQuestions);
    });

    let question;
    await act(async () => {
      question = result.current.selectQuestion();
    });

    // Record difficulty to check later
    const questionDifficulty = question.difficulty;

    await act(async () => {
      result.current.onCorrectAnswer({ question });
    });

    // Check that question was added to candidate pool
    const candidateQuestions = result.current.getCandidateQuestions(questionDifficulty);
    expect(candidateQuestions.length).toBe(1);
    expect(candidateQuestions[0]._qid).toBe(question._qid);

    // Selecting another question should not return the same one
    let secondQuestion;
    await act(async () => {
      secondQuestion = result.current.selectQuestion();
    });

    // If there are more questions in same difficulty, it should be different
    if (secondQuestion?.difficulty === questionDifficulty) {
      expect(secondQuestion._qid).not.toBe(question._qid);
    }
  });

  test('clearCandidatePool should empty the candidate pool', async () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    await act(async () => {
      result.current.updateSamplePool(testQuestions);
    });

    // Answer a question correctly to add to candidate pool
    let question;
    await act(async () => {
      question = result.current.selectQuestion();
      result.current.onCorrectAnswer({ question });
    });

    // Verify candidate pool has an item
    const difficultyWithQuestion = question.difficulty;
    let candidateQuestions = result.current.getCandidateQuestions(difficultyWithQuestion);
    expect(candidateQuestions.length).toBe(1);

    // Clear the pool
    await act(async () => {
      result.current.clearCandidatePool();
    });

    // Verify pool is empty
    candidateQuestions = result.current.getCandidateQuestions(difficultyWithQuestion);
    expect(candidateQuestions.length).toBe(0);
  });

  test('getThemeAccuracy and getThemeStats should return expected values', () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    // These are stub functions for backward compatibility
    expect(result.current.getThemeAccuracy()).toBe(0);
    expect(result.current.getThemeStats()).toEqual({ correct: 0, total: 0 });
  });

  test('should handle questions without explicit IDs', async () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    // Questions without IDs
    const questionsWithoutIds = {
      beginner: [
        { description: 'test1', answer: 'test1' },
        { description: 'test2', answer: 'test2' }
      ],
      medium: [],
      hard: []
    };

    await act(async () => {
      result.current.updateSamplePool(questionsWithoutIds);
    });

    let question;
    await act(async () => {
      question = result.current.selectQuestion();
    });

    expect(question).not.toBeNull();
    expect(question._qid).toBeDefined();

    // Test that the question can be correctly answered
    await act(async () => {
      result.current.onCorrectAnswer({ question });
    });

    const candidateQuestions = result.current.getCandidateQuestions('beginner');
    expect(candidateQuestions.length).toBe(1);
  });

  test('should handle edge case with no questions in target difficulty', async () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    // Questions only in hard difficulty
    const hardOnlyQuestions = {
      beginner: [],
      medium: [],
      hard: [
        { description: 'hard1', answer: 'hard1' },
        { description: 'hard2', answer: 'hard2' }
      ]
    };

    await act(async () => {
      result.current.updateSamplePool(hardOnlyQuestions);
    });

    // Force selection of beginner (which has no questions)
    jest.spyOn(global.Math, 'random').mockImplementation(() => 0.1);

    let question;
    await act(async () => {
      question = result.current.selectQuestion();
    });

    // Should fallback to hard since that's the only difficulty with questions
    expect(question).not.toBeNull();
    expect(question.difficulty).toBe('hard');
  });

  test('should handle edge case with empty question pool', async () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    // Empty questions
    const emptyQuestions = {
      beginner: [],
      medium: [],
      hard: []
    };

    await act(async () => {
      result.current.updateSamplePool(emptyQuestions);
    });

    let question;
    await act(async () => {
      question = result.current.selectQuestion();
    });

    // Should return null when no questions are available
    expect(question).toBeNull();
  });

  test('onWrongAnswer should be a no-op function', () => {
    const { result } = renderHook(() => useQuestionManager(mockGameState, mockUpdateGameState));

    // onWrongAnswer should exist but do nothing
    expect(() => result.current.onWrongAnswer()).not.toThrow();
  });
});
