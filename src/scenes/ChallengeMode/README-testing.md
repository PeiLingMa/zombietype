# ChallengeMode 組件測試指南

本文檔說明如何為 ChallengeMode 組件及其相關 hooks 編寫和運行單元測試。

## 測試結構

測試文件放置在與被測試代碼相同目錄下的 `__tests__` 目錄中，命名規則為 `{Component/Hook名稱}.test.js`。

例如：
- ChallengeMode 組件測試：`src/components/ChallengeMode/__tests__/ChallengeMode.test.js`
- usePlayerInput hook 測試：`src/components/ChallengeMode/__tests__/usePlayerInput.test.js`

## 模擬依賴

測試過程中，我們使用 Jest 的 `jest.mock()` 函數來模擬組件的依賴：

```javascript
jest.mock('../hooks/useGameState', () => ({
  useGameState: () => ({
    gameState: {
      level: 1,
      lives: 3,
      // ... 其他屬性
    },
    updateGameState: jest.fn()
  })
}));
```

## 測試 Hook

使用 `@testing-library/react` 提供的 `renderHook` 函數來測試自定義 hook：

```javascript
import { renderHook, act } from '@testing-library/react';

test('hook 行為測試', () => {
  const { result } = renderHook(() => usePlayerInput({
    // 參數
  }));
  
  // 使用 act 來處理狀態更新
  act(() => {
    result.current.someFunction();
  });
  
  // 檢查 hook 的輸出
  expect(result.current.someValue).toBe(expectedValue);
});
```

## 測試組件

使用 `@testing-library/react` 提供的 `render` 函數來測試 React 組件：

```javascript
import { render, screen, fireEvent } from '@testing-library/react';

test('組件渲染測試', () => {
  render(<ChallengeMode onBack={mockOnBack} />);
  
  // 檢查元素是否存在
  expect(screen.getByText('Monster Typing Game')).toBeInTheDocument();
  
  // 檢查互動
  const button = screen.getByText('Back Menu');
  fireEvent.click(button);
  expect(mockOnBack).toHaveBeenCalled();
});
```

## 模擬定時器

使用 Jest 的假定時器來測試定時器相關功能：

```javascript
// 使用假定時器
jest.useFakeTimers();

test('定時器測試', () => {
  // 推進定時器
  act(() => {
    jest.advanceTimersByTime(300);
  });
  
  // 檢查效果
  expect(someFunction).toHaveBeenCalled();
  
  // 恢復真實定時器
  jest.useRealTimers();
});
```

## 運行測試

### 運行所有測試

```bash
npm test
```

### 運行特定測試文件

```bash
npm test -- ChallengeMode.test.js
```

### 生成測試覆蓋率報告

```bash
npm test -- --coverage
```

## 測試最佳實踐

1. **隔離測試**：確保每個測試只專注於一個功能點
2. **模擬外部依賴**：對於 API 調用、時間函數等外部依賴進行模擬
3. **檢查關鍵元素和交互**：測試重要的 UI 元素是否存在和功能是否正常
4. **測試邊界條件**：例如空數據、錯誤情況等
5. **保持測試簡單明了**：測試代碼應易於理解和維護

## 常見測試場景

### 1. 測試 UI 渲染

測試組件是否正確渲染 UI 元素和資料。

### 2. 測試用戶交互

測試點擊、輸入等用戶交互是否正確響應。

### 3. 測試狀態變化

測試組件狀態變化和相應的 UI 更新。

### 4. 測試 Hook 邏輯

測試自定義 Hook 的內部邏輯和狀態管理。

### 5. 測試計時器和異步操作

測試基於時間的操作和異步行為。 