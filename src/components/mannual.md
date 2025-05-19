以下是一份以 **Radix UI + Styled Components + Framer Motion** 為核心的完整步驟說明報告，幫助你在 `zombietype` 專案的原有 DOM 結構下，無痛取代 Bootstrap，打造手繪風格的遊戲介面。本文共分為七大階段：專案現狀分析、前置準備、安裝與設定、Radix 元件整合、Styled Components 自訂樣式、Framer Motion 動畫強化以及小結與後續優化。每一步均提供實用範例與關鍵指令。

> **重點總覽**：
>
> 1. 使用 Radix Primitives 處理互動邏輯與無障礙（a11y） ([Radix UI][1], [Radix UI][2])
> 2. 以 Styled Components 管理元件樣式、排版、色彩與手繪邊框貼圖。
> 3. 利用 Framer Motion 為按鈕、滑塊等 UI 加入物理感動畫 ([Motion][5], [Medium][6])
> 4. 透過 Styled Components 的 `ThemeProvider` 實現主題化，深度自訂手繪風格。
> 5. 專案中的 Bootstrap 主要用於佈局和基本元件樣式，遷移難度適中。

---

## 一、專案現狀分析 (`zombietype`)

在開始遷移之前，我們分析了專案中 `ChallengeMode.js`、`src/scenes/MainMenu/App.js` 和 `StoryMode.js` 等關鍵檔案對 Bootstrap 的依賴情況。

- **`ChallengeMode.js`**: 大量使用 Bootstrap 的格線系統 (`d-flex`, `flex-column`, `align-items-center` 等) 和元件樣式 (`form-control`, `badge`, `btn` 等)。例如，計時器、殭屍圖片、輸入框和統計數據的樣式。
  - **遷移策略**: 將使用 Styled Components 創建對應的佈局元件或直接在元件樣式中定義 Flexbox/Grid 屬性。`form-control` 可以使用 Radix UI 的 `Form.Input` 結合 Styled Components 造型。`badge` 同樣可以用 Styled Components 輕鬆實現。
- **`src/scenes/MainMenu/App.js`**: 主要用於主選單按鈕 (`btn btn-danger`, `btn btn-info`) 和整體佈局。
  - **遷移策略**: 按鈕樣式將用 Styled Components 重新設計，以符合手繪風格。若按鈕未來需要更複雜的互動 (如彈出選單)，可考慮 Radix UI 的 `Button` Primitive 並用 Styled Components 包裹。Framer Motion 可用於添加按鈕的互動動畫。
- **`StoryMode.js` (及其子元件)**: 雖然直接 Bootstrap 引入不明顯，但其 CSS (`test.css`) 和元件 (`Navbar.js`, `InputFrame.js`, `StoryEndPopup.js`) 可能受到 Bootstrap 影響或需要與之解耦。`StoryEndPopup` 是一個明顯的模態框，適合用 Radix UI 的 `Dialog` 替換並用 Styled Components 設計樣式。
  - **遷移策略**: 分析 `test.css`，將其樣式規則轉譯為對應元件的 Styled Components。`StoryEndPopup` 將使用 Radix UI 的 `Dialog` 處理其模態行為，並用 Styled Components 設計其手繪風格。對話框 (`dialogue-box`) 的樣式也將完全由 Styled Components 控制。

**總體結論**: 專案對 Bootstrap 的使用主要集中在 CSS 樣式層面，並未大量依賴其 JavaScript 元件。這為我們轉向 Radix UI + Styled Components + Framer Motion 提供了良好的基礎，預計遷移過程平順。

---

## 二、前置準備

1.  **確認環境**

    - Node.js（>=16）与 npm/yarn 已安裝於專案中。
    - `zombietype` 專案已透過 `create-react-app` 或類似工具建立 (目前看來是這樣)。

2.  **移除 Bootstrap**

    - 在確認所有相關元件都已遷移至 Styled Components 和 Radix UI 後，從專案中移除 Bootstrap。
    - 主要動作：從 `ChallengeMode.js` (或其他全域引入點) 移除 `import 'bootstrap/dist/css/bootstrap.min.css';`。
    - 同時檢查 `public/index.html` 是否有 Bootstrap 的 CDN 連結，並移除。

    ```bash
    npm uninstall bootstrap # 如果是透過 npm 安裝的
    # yarn remove bootstrap # 如果是透過 yarn 安裝的
    ```

---

## 三、安裝與設定

### 1. 安裝 Styled Components

```bash
npm install styled-components
# yarn add styled-components
```

Styled Components 允許你直接在 JavaScript 中編寫 CSS 來為你的元件提供樣式。

#### 設定全域樣式與主題 (Theme)

建議建立一個主題檔案 (例如 `src/theme.js`) 和一個全域樣式檔案 (例如 `src/GlobalStyle.js`)。

**`src/theme.js` (範例):**

```js
// src/theme.js
export const gameTheme = {
  colors: {
    primary: '#f4d35e', // 範例主色
    secondary: '#e07a5f', // 範例次色
    dark: '#3d405b', // 範例深色
    light: '#f4f1de', // 範例淺色
    panelBackground: '#fff0c1' // 手繪面板背景色
  },
  fonts: {
    body: '"Comic Sans MS", cursive, sans-serif', // 範例遊戲字體
    heading: '"Another Game Font", fantasy'
    // 可參考 StoryMode/font/ 目錄下的字體資源
  },
  images: {
    panelHanddrawn: "url('/src/scenes/StoryMode/images/handdrawn-panel.png')", // 假設有此手繪面板素材
    borderHanddrawn: "url('/src/scenes/StoryMode/images/handdrawn-border.svg')", // 手繪邊框範例
    borderImageSource: "url('/src/scenes/StoryMode/images/handdrawn-border-image.png')"
  },
  // 其他全域變數，如間距、圓角大小等
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  borderRadius: '12px'
};
```

**`src/GlobalStyle.js` (範例):**

```js
// src/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* 在此處定義 @font-face，如果字體不在系統中 */
  @font-face {
    font-family: 'Comic Sans MS'; /* 確保字體名稱與 theme.js 中一致 */
    /* src: url('/path/to/your/comic-sans-ms-font.woff2') format('woff2'); */
    /* 由於 Comic Sans MS 通常是系統字體，可能不需要額外引入 */
  }
  @font-face {
    font-family: 'Another Game Font';
    /* src: url('/path/to/your/another-game-font.woff2') format('woff2'); */
  }

  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: ${(props) => props.theme.fonts.body};
    background-color: ${(props) => props.theme.colors.dark};
    color: ${(props) => props.theme.colors.light};
    line-height: 1.6;
  }

  *, *::before, *::after {
    box-sizing: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${(props) => props.theme.fonts.heading};
    color: ${(props) => props.theme.colors.primary};
  }
`;

export default GlobalStyle;
```

**在您的應用程式根元件 (例如 `src/index.js` 或 `src/App.js`) 中使用 `ThemeProvider` 和 `GlobalStyle`:**

```jsx
// src/index.js 或 src/App.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // 或 'react-dom' for older React
import App from './App'; // 您的主 App 元件
import { ThemeProvider } from 'styled-components';
import { gameTheme } from './theme';
import GlobalStyle from './GlobalStyle';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={gameTheme}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### 2. 安裝 Radix Primitives

根據專案需求，我們預計會用到 Dialog (彈窗), Slider (滑塊), Switch (開關), Form (表單), NavigationMenu (導航菜單) 等。

```bash
npm install @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-form @radix-ui/react-navigation-menu
# yarn add @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-form @radix-ui/react-navigation-menu
```

Radix Primitives 提供低階、無樣式但可存取的元件，幫你處理 aria、focus 管理與鍵盤導覽等細節 ([Radix UI][1], [Radix UI][2])

### 3. 安裝 Framer Motion

```bash
npm install framer-motion
# yarn add framer-motion
```

Framer Motion 是官方推薦的 React 動畫解決方案，具備硬體加速與 JS 動畫引擎混合優勢 ([Motion][5], [Medium][6])

---

## 四、Radix 元件整合 (以 `zombietype` 範例)

以下以 `StoryMode` 的 `StoryEndPopup` 和 `ChallengeMode` 的設定選項（假設未來會有）為例。

### 1. Dialog (彈窗) - 改造 `StoryEndPopup`

使用 Styled Components 包裹 Radix UI `Dialog` 的各個部分。

**`src/scenes/StoryMode/component/StoryEndPopup.js` (Styled Components 版本):**

```jsx
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const StyledDialogOverlay = styled(motion(Dialog.Overlay))`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6); // 半透明黑色背景
  z-index: 40;
`;

const StyledDialogContentWrapper = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 450px; // 約 max-w-md
  background-image: ${(props) =>
    props.theme.images.panelHanddrawn ||
    `linear-gradient(135deg, ${props.theme.colors.panelBackground}, #fff)`};
  background-size: cover;
  background-position: center;
  padding: ${(props) => props.theme.spacing.large};
  border-radius: ${(props) => props.theme.borderRadius};
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.2),
    0 20px 40px -10px rgba(0, 0, 0, 0.3); // 更精緻的陰影
  z-index: 50;
  border: 4px solid ${(props) => props.theme.colors.primary};
  /* 手繪邊框圖片範例 */
  /*
  border-image-source: ${(props) => props.theme.images.borderImageSource};
  border-image-slice: 30 30 30 30 fill;
  border-image-width: 20px;
  border-image-outset: 0px;
  border-style: solid;
  border-width: 20px;
  */
`;

const StyledDialogTitle = styled(Dialog.Title)`
  font-size: 1.75rem; // 約 text-2xl
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.medium};
  text-align: center;
  text-shadow: 1px 1px 2px ${(props) => props.theme.colors.dark};
`;

const StyledButton = styled(motion.button)`
  margin-top: ${(props) => props.theme.spacing.large};
  width: 100%;
  background-color: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.light};
  font-weight: bold;
  padding: ${(props) => props.theme.spacing.medium} ${(props) => props.theme.spacing.small};
  border-radius: ${(props) => props.theme.borderRadius};
  border: 2px solid ${(props) => props.theme.colors.primary};
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.dark};
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}cc;
  }
`;

export default function StoryEndPopup({ isVisible, message, onConfirm, storyId }) {
  return (
    <Dialog.Root
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) onConfirm();
      }}
    >
      <AnimatePresence>
        {isVisible && (
          <Dialog.Portal forceMount>
            <StyledDialogOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <Dialog.Content asChild>
              <StyledDialogContentWrapper
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <StyledDialogTitle>{message || 'Story Ended'}</StyledDialogTitle>
                <Dialog.Close asChild>
                  <StyledButton
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      localStorage.removeItem(`storyProgress_${storyId}`);
                      onConfirm();
                    }}
                  >
                    Back to Menu
                  </StyledButton>
                </Dialog.Close>
              </StyledDialogContentWrapper>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
```

Radix 的 `<Dialog>` 處理焦點鎖定與無障礙，Styled Components 負責手繪風格的樣式，Framer Motion 增加開啟/關閉動畫。

### 2. Slider & Switch (音量與設定) - 應用於 `Options.js`

```jsx
// src/scenes/Option/Option.js (部分示意)
import * as RadixSlider from '@radix-ui/react-slider';
import * as RadixSwitch from '@radix-ui/react-switch';
import { useVolumeControl } from '../../context/GameSettingsContext';
import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const OptionsContainer = styled.div`
  padding: ${(props) => props.theme.spacing.large};
  background-color: ${(props) => props.theme.colors.dark};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const OptionsTitle = styled.h1`
  font-size: 2.5rem; // 約 text-4xl
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
  margin-bottom: ${(props) => props.theme.spacing.large}*2;
  text-shadow: 2px 2px 0px ${(props) => props.theme.colors.secondary};
`;

const ControlGroup = styled.div`
  width: 100%;
  max-width: 320px; // 約 max-w-xs
  margin-bottom: ${(props) => props.theme.spacing.large};
`;

const Label = styled.label`
  display: block;
  font-size: 1.125rem; // 約 text-lg
  color: ${(props) => props.theme.colors.light};
  margin-bottom: ${(props) => props.theme.spacing.small};
`;

// Slider styles
const StyledSliderRoot = styled(RadixSlider.Root)`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px; // h-8
  touch-action: none;
  user-select: none;
  cursor: pointer;
`;

const StyledSliderTrack = styled(RadixSlider.Track)`
  background-color: rgba(244, 241, 222, 0.3); // game-light/30
  position: relative;
  flex-grow: 1;
  height: 12px; // h-3
  border-radius: 9999px; // rounded-full
  transition: height 0.2s;
  ${StyledSliderRoot}:hover & {
    height: 16px; // group-hover:h-4
  }
`;

const StyledSliderRange = styled(RadixSlider.Range)`
  position: absolute;
  background-color: ${(props) => props.theme.colors.secondary};
  height: 100%;
  border-radius: 9999px; // rounded-full
  transition: background-color 0.2s;
  ${StyledSliderRoot}:hover & {
    background-color: ${(props) => props.theme.colors.primary};
  }
`;

const StyledSliderThumb = styled(motion(RadixSlider.Thumb))`
  display: block;
  width: 24px; // w-6
  height: 24px; // h-6
  background-color: ${(props) => props.theme.colors.primary};
  border-radius: 9999px; // rounded-full
  border: 2px solid ${(props) => props.theme.colors.light};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  &:focus {
    outline: none;
    box-shadow:
      0 0 0 3px ${(props) => props.theme.colors.primary}99,
      0 0 0 5px ${(props) => props.theme.colors.dark};
  }
  ${StyledSliderRoot}:hover & {
    transform: scale(1.1); // group-hover:scale-110
  }
`;

// Switch styles
const StyledSwitchRoot = styled(RadixSwitch.Root)`
  width: 56px; // w-14
  height: 28px; // h-7
  background-color: rgba(244, 241, 222, 0.3); // game-light/30
  border-radius: 9999px; // rounded-full
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s;
  &[data-state='checked'] {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

const StyledSwitchThumb = styled(motion(RadixSwitch.Thumb))`
  display: block;
  width: 20px; // w-5
  height: 20px; // h-5
  background-color: ${(props) => props.theme.colors.light};
  border-radius: 9999px; // rounded-full
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
  transform: translateX(4px); // translate-x-1
  will-change: transform;
  &[data-state='checked'] {
    transform: translateX(32px); // translate-x-[1.6rem] (56 - 20 - 4)
  }
  ${StyledSwitchRoot}:hover & {
    transform: scale(1.1)
      translateX(${(props) => (props['data-state'] === 'checked' ? '32px' : '4px')});
  }
`;

const BackButton = styled(StyledButton)`
  // Reusing StyledButton from Dialog example, or define a new one
  margin-top: auto;
  padding: ${(props) => props.theme.spacing.medium} ${(props) => props.theme.spacing.large};
`;

function Options({ onBack }) {
  const { volume, setVolume } = useVolumeControl();
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  return (
    <OptionsContainer>
      <OptionsTitle>OPTIONS</OptionsTitle>

      <ControlGroup>
        <Label htmlFor="volume-slider">Volume</Label>
        <StyledSliderRoot
          id="volume-slider"
          value={[volume * 100]}
          onValueChange={([val]) => setVolume(val / 100)}
          max={100}
          step={1}
        >
          <StyledSliderTrack>
            <StyledSliderRange />
          </StyledSliderTrack>
          <StyledSliderThumb aria-label="Volume" />
        </StyledSliderRoot>
      </ControlGroup>

      <ControlGroup
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Label
          htmlFor="autoplay-switch"
          style={{ marginBottom: 0 }}
        >
          Auto-Play Dialogue
        </Label>
        <StyledSwitchRoot
          id="autoplay-switch"
          checked={isAutoPlay}
          onCheckedChange={setIsAutoPlay}
        >
          <StyledSwitchThumb data-state={isAutoPlay ? 'checked' : 'unchecked'} />
        </StyledSwitchRoot>
      </ControlGroup>

      <BackButton
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Back
      </BackButton>
    </OptionsContainer>
  );
}
```

---

## 五、Styled Components 自訂樣式 (以 `zombietype` 範例)

### 1. 手繪邊框與貼圖

- **邊框圖片**: 直接在 Styled Components 的 CSS 中使用 `border-image` 相關屬性。

  ```jsx
  const HandDrawnPanel = styled.div`
    padding: ${(props) => props.theme.spacing.medium};
    background-image: ${(props) => props.theme.images.panelHanddrawn};
    background-size: contain; /* or cover, or specific size */
    background-repeat: no-repeat;

    border-style: solid;
    border-width: 25px; /* Adjust based on your image */
    border-image-source: ${(props) => props.theme.images.borderImageSource};
    border-image-slice: 40 fill; /* Adjust slice values based on your image */
    border-image-repeat: round; /* or 'stretch' or 'repeat' */
    /* border-image-outset: 5px; */ /* Optional outset */

    color: ${(props) => props.theme.colors.dark}; // Text color inside the panel
  `;

  // Usage: <HandDrawnPanel>Content</HandDrawnPanel>
  ```

- **按鈕樣式**: 替換 `App.js` 中的 Bootstrap 按鈕。

  ```jsx
  // src/scenes/MainMenu/App.js (部分示意)
  const MainMenuButton = styled(motion.button)`
    margin: ${(props) => props.theme.spacing.small} 0;
    padding: ${(props) => props.theme.spacing.medium} ${(props) => props.theme.spacing.large};
    font-size: 1.25rem; // 約 fs-4
    font-weight: bold;
    border-radius: ${(props) => props.theme.borderRadius};
    color: ${(props) => props.theme.colors.light};
    background-color: ${(props) =>
      props.variant === 'danger' ? props.theme.colors.secondary : props.theme.colors.primary};
    border: 3px solid
      ${(props) =>
        props.variant === 'danger' ? props.theme.colors.primary : props.theme.colors.secondary};
    box-shadow: 3px 3px 0px ${(props) => props.theme.colors.dark}77;
    text-shadow: 1px 1px 1px ${(props) => props.theme.colors.dark}aa;
    cursor: pointer;
    transition: all 0.15s ease-in-out;

    &:hover {
      transform: translate(-2px, -2px);
      box-shadow: 5px 5px 0px ${(props) => props.theme.colors.dark}aa;
    }
    &:active {
      transform: translate(1px, 1px);
      box-shadow: 2px 2px 0px ${(props) => props.theme.colors.dark}77;
    }
  `;
  // ...
  // <MainMenuButton
  //   variant="danger" // for red-like button
  //   onClick={() => setCurrentScreen('challenge')}
  //   whileHover={{ scale: 1.03, rotate: -1 }}
  //   whileTap={{ scale: 0.97, rotate: 1 }}
  // >
  //   CHALLENGE MODE
  // </MainMenuButton>
  ```

### 2. 主題與字體

- 已在「安裝與設定」部分的 `src/theme.js` 和 `src/GlobalStyle.js` 中說明。
- 確保在 `GlobalStyle.js` 中使用 `@font-face` 正確引入 `src/scenes/StoryMode/font/` 下的自訂字體。

---

## 六、Framer Motion 動畫強化 (以 `zombietype` 範例)

Framer Motion 與 Styled Components 可以無縫協作。您可以將 `motion` 元件直接傳遞給 `styled()` 高階函數，或者為 `motion` 元件的 `style` prop 提供樣式。

### 1. 基本設定

```jsx
import { motion } from 'framer-motion';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog'; // if styling Radix parts

// Styling a motion component
const MotionStyledDiv = styled(motion.div)`
  background-color: ${(props) => props.theme.colors.primary};
  padding: ${(props) => props.theme.spacing.medium};
`;

// Using motion component and styling Radix parts (example from Dialog)
// const StyledDialogOverlay = styled(motion(Dialog.Overlay))\`...\`;
```

### 2. 實作互動動畫 - `ChallengeMode.js` 殭屍

原 `ChallengeMode.js` 中殭屍圖片的縮放。

```jsx
// ChallengeMode.js (部分示意)
import { motion } from 'framer-motion';
import styled from 'styled-components';

const ZombieContainer = styled(motion.div)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: ${(props) => props.theme.spacing.large} 0;
`;

const ZombieImage = styled(motion.img)`
  width: 250px;
  height: 250px;
  border-radius: 50%; // rounded-circle
  border: 5px solid ${(props) => props.theme.colors.primary}; // border-warning
  background-color: ${(props) => props.theme.colors.light};
  padding: ${(props) => props.theme.spacing.small};
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); // shadow-lg
`;
// ...
// const currentChargeRate = zombieManager.getCurrentChargeRate(); // 0 to 1
// ...
<ZombieContainer
  animate={{ scale: 1 + currentChargeRate * 0.3 }} // Adjust multiplier as needed
  transition={{ type: 'spring', stiffness: 180, damping: 12 }}
>
  <ZombieImage
    key={zombieManager.getCurrentZombieImage()} // For re-triggering animation on image change
    src={zombieManager.getCurrentZombieImage()}
    alt="Zombie"
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -30, scale: 0.9 }}
    transition={{ duration: 0.4 }}
  />
</ZombieContainer>;
```

### 3. 按鈕動畫 - `App.js` 主選單按鈕

已在「Styled Components 自訂樣式」部分的 `MainMenuButton` 範例中結合了 Framer Motion 的 `whileHover` 和 `whileTap`。

### 4. `StoryMode.js` 文字打字機效果與場景過渡

- **文字打字機**: `useTypingEffect` hook 可以保持。若要用 Framer Motion 實現更複雜的文字動畫，可以為每個字符包裹 `motion.span` 並使用 `staggerChildren`。
- **場景/角色圖片過渡**:

  ```jsx
  // StoryMode.js (示意角色圖片過渡)
  import { motion, AnimatePresence } from 'framer-motion';
  import styled from 'styled-components';

  const CharacterImage = styled(motion.img)`
    /* className="character" -- 之前的樣式可以移到這裡 */
    max-width: 100%;
    max-height: 400px; /* 示例大小 */
    object-fit: contain;
    position: absolute; /* 根據您的佈局調整 */
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  `;
  // ...
  // <div className="ratio-container"> /* 這個容器也可能需要 styled-component */
  //   <AnimatePresence mode="wait">
  //     <CharacterImage
  //       key={currentScene.id}
  //       src={currentScene.image}
  //       alt={currentScene.character}
  //       initial={{ opacity: 0, x: currentScene.id > prevSceneId ? 100 : -100 }} // 根據場景順序決定滑入方向
  //       animate={{ opacity: 1, x: 0 }}
  //       exit={{ opacity: 0, x: currentScene.id < nextSceneId ? 100 : -100 }}
  //       transition={{ duration: 0.5, ease: "easeInOut" }}
  //     />
  //   </AnimatePresence>
  //   {/* ... 其他 Navbar, DialogueBox 等 */}
  // </div>
  ```

---

## 七、小結與後續優化

1.  **無障礙測試**：利用 [axe](https://www.deque.com/axe/) 或 [Lighthouse](https://developers.google.com/web/tools/lighthouse) 驗證 Radix UI 元件與自訂元件是否符合 a11y 標準。
2.  **效能監控**：檢查 Framer Motion 動畫，並注意 Styled Components 在極端情況下（大量動態樣式變更）的潛在效能影響。
3.  **主題切換**：Styled Components 的 `ThemeProvider` 非常適合實現動態主題切換功能。
4.  **組件庫發佈**：若專案成熟，可利用 Storybook 撰寫文件並考慮將常用的手繪風格 Styled Components 抽象出來，方便複用。
5.  **逐步遷移**: 建議從一個影響範圍較小的模式（如主選單 `App.js` 的按鈕）或一個獨立元件（如 `StoryEndPopup.js`）開始遷移，逐步擴展到 `ChallengeMode.js` 和 `StoryMode.js` 的其他部分。

透過上述步驟，`zombietype` 專案即可在既有 DOM 架構中，捨棄 Bootstrap，使用 Radix UI + Styled Components + Framer Motion，打造出如同手繪插畫般生動且具現代化互動體驗的遊戲介面。

[1]: https://www.radix-ui.com/primitives/docs/overview/introduction?utm_source=chatgpt.com 'Introduction – Radix Primitives - Radix UI'
[2]: https://www.radix-ui.com/primitives/docs/overview/accessibility?utm_source=chatgpt.com 'Accessibility – Radix Primitives'
[3]: https://styled-components.com/docs 'Styled Components Documentation'
[4]: https://styled-components.com/docs/advanced#theming 'Styled Components Theming'
[5]: https://motion.dev/docs/react-quick-start?utm_source=chatgpt.com 'Get started with Motion for React'
[6]: https://medium.com/%40sanksiddharth/animating-your-web-pages-a-beginners-guide-with-framer-motion-5de404cd25df?utm_source=chatgpt.com "Animating Your Web Pages: A Beginner's Guide with Framer Motion"
[7]: https://www.radix-ui.com/primitives 'Radix Primitives'
[8]: https://medium.com/styled-components/getting-started-with-styled-components-and-theming-in-react-96197353a780 'Getting Started with Styled Components and Theming'
[9]: https://www.radix-ui.com/primitives/docs/components/slider?utm_source=chatgpt.com 'Slider – Radix Primitives'
[10]: https://github.com/styled-components/styled-components 'Styled Components GitHub'
[11]: https://www.youtube.com/watch?pp=0gcJCdgAo7VqN5tD&v=inkIfPtmE9s&utm_source=chatgpt.com '3 Tricks For Amazing Button Animations (Framer Tutorial) - YouTube'
[12]: https://www.youtube.com/watch?v=_HrxDnK3Qiw&utm_source=chatgpt.com 'Framer Tutorial: Animate Buttons Like a Pro - YouTube'
[13]: https://storybook.js.org/ 'Storybook: Build UIs with components'
