import { renderHook, act } from '@testing-library/react';
import { useZombieManager } from '../hooks/useZombieManager';


jest.mock('../zombie1.png', () => 'zombie1.png');
jest.mock('../zombie2.png', () => 'zombie2.png');
jest.mock('../zombie3.png', () => 'zombie3.png');
jest.mock('../zombie4.png', () => 'zombie4.png');

describe('🧟 useZombieManager', () => {
  const mockGameState = { level: 2 };
  const mockUpdateGameState = jest.fn();

  it('should initialize with a valid zombie', () => {
    const { result } = renderHook(() => useZombieManager(mockGameState, mockUpdateGameState));
    const current = result.current.getCurrentZombie();
    expect(current).toHaveProperty('name');
    expect(current).toHaveProperty('image');
  });

  it('should return correct zombie image', () => {
    const { result } = renderHook(() => useZombieManager(mockGameState, mockUpdateGameState));
    const image = result.current.getCurrentZombieImage();
    expect(typeof image).toBe('string');
    expect(image).toMatch(/zombie/);
  });

  it('should increase charge rate properly', () => {
    const { result } = renderHook(() => useZombieManager(mockGameState, mockUpdateGameState));

    act(() => {
      result.current.charge(0.5);
    });
    expect(result.current.getCurrentChargeRate()).toBeCloseTo(0.5);

    act(() => {
      result.current.charge(0.6); // test max clamp
    });
    expect(result.current.getCurrentChargeRate()).toBe(1.0);
  });

  it('should reset charge rate to zero', () => {
    const { result } = renderHook(() => useZombieManager(mockGameState, mockUpdateGameState));

    act(() => {
      result.current.charge(0.8);
    });
    expect(result.current.getCurrentChargeRate()).toBeCloseTo(0.8);

    act(() => {
      result.current.resetChargeRate();
    });
    expect(result.current.getCurrentChargeRate()).toBe(0.0);
  });

  it('should store and retrieve extra state correctly', () => {
    const { result } = renderHook(() => useZombieManager(mockGameState, mockUpdateGameState));
    act(() => {
      result.current.setExtraState('testKey', 42);
    });
    expect(result.current.getExtraState('testKey')).toBe(42);
  });

  it('should change zombie (non-boss) for completionRate = 0', () => {
    const { result } = renderHook(() => useZombieManager(mockGameState, mockUpdateGameState));
    let newZombie;
    act(() => {
      newZombie = result.current.changeCurrentZombie(0);
    });
    expect(newZombie.behavior).not.toBe('mimic');
    expect(newZombie.behavior).not.toBe('boss');
  });

  it('should allow mimic but not boss if 0 < completionRate < 0.3', () => {
    const { result } = renderHook(() => useZombieManager(mockGameState, mockUpdateGameState));
    let newZombie;
    act(() => {
      newZombie = result.current.changeCurrentZombie(0.25);
    });
    expect(newZombie.behavior).not.toBe('boss');
  });

  it('should switch to boss zombie if completionRate >= 0.3', () => {
    const { result } = renderHook(() => useZombieManager(mockGameState, mockUpdateGameState));
    let newZombie;
    act(() => {
      newZombie = result.current.changeCurrentZombie(0.9);
    });
    expect(newZombie.behavior).toBe('boss');
    expect(result.current.getExtraState('bossHp')).toBe(3);
  });
});
