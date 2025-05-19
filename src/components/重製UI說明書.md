以下是一份以 **Radix UI/shadcn + Tailwind CSS + Framer Motion** 為核心的完整步驟說明報告，幫助你在 `zombietype` 專案的原有 DOM 結構下，無痛取代 Bootstrap，打造手繪風格的遊戲介面。本文共分為七大階段：專案現狀分析、前置準備、安裝與設定、Radix 元件整合、Tailwind 自訂樣式、Framer Motion 動畫強化以及小結與後續優化。每一步均提供實用範例與關鍵指令。

> **重點總覽**：
>
> 1. 使用 Radix Primitives 處理互動邏輯與無障礙（a11y） ([Radix UI][1], [Radix UI][2])
> 2. 以 Tailwind CSS 管理排版、色彩與手繪邊框貼圖 ([Tailwind CSS][3], [Tailwind CSS][4])
> 3. 利用 Framer Motion 為按鈕、滑塊等 UI 加入物理感動畫 ([Motion][5], [Medium][6])
> 4. 可選擇 shadcn/ui 範本快速上手，或純 Radix＋Tailwind 深度自訂 ([Shadcn][7], [Medium][8])
> 5. 專案中的 Bootstrap 主要用於佈局和基本元件樣式，遷移難度適中。

---

## 一、專案現狀分析 (`zombietype`)

在開始遷移之前，我們分析了專案中 `ChallengeMode.js`、`src/scenes/MainMenu/App.js` 和 `StoryMode.js` 等關鍵檔案對 Bootstrap 的依賴情況。

- **`ChallengeMode.js`**: 大量使用 Bootstrap 的格線系統 (`d-flex`, `flex-column`, `align-items-center` 等) 和元件樣式 (`form-control`, `badge`, `btn` 等)。例如，計時器、殭屍圖片、輸入框和統計數據的樣式。
  - **遷移策略**: Tailwind CSS 的 utility classes 可以直接替換佈局樣式。`form-control` 可以使用 Radix UI 的 `Form.Input` (如果需要表單上下文) 或直接用 Tailwind CSS 造型。`badge` 同樣可以用 Tailwind CSS 輕鬆實現。
- **`src/scenes/MainMenu/App.js`**: 主要用於主選單按鈕 (`btn btn-danger`, `btn btn-info`) 和整體佈局。
  - **遷移策略**: 按鈕樣式將用 Tailwind CSS 重新設計，以符合手繪風格。若按鈕未來需要更複雜的互動 (如彈出選單)，可考慮 Radix UI 的 `Button` Primitive。Framer Motion 可用於添加按鈕的互動動畫。
- **`StoryMode.js` (及其子元件)**: 雖然直接 Bootstrap 引入不明顯，但其 CSS (`test.css`) 和元件 (`Navbar.js`, `InputFrame.js`, `StoryEndPopup.js`) 可能受到 Bootstrap 影響或需要與之解耦。`StoryEndPopup` 是一個明顯的模態框，適合用 Radix UI 的 `Dialog` 替換。
  - **遷移策略**: 分析 `test.css`，將其樣式規則轉譯為 Tailwind CSS。`StoryEndPopup` 將使用 Radix UI 的 `Dialog` 處理其模態行為，並用 Tailwind CSS 設計其手繪風格。對話框 (`dialogue-box`) 的樣式也將完全由 Tailwind CSS 控制。

**總體結論**: 專案對 Bootstrap 的使用主要集中在 CSS 樣式層面，並未大量依賴其 JavaScript 元件。這為我們轉向 Radix UI + Tailwind CSS + Framer Motion 提供了良好的基礎，預計遷移過程平順。

---

## 二、前置準備

1.  **確認環境**

    - Node.js（>=16）与 npm/yarn 已安裝於專案中。
    - `zombietype` 專案已透過 `create-react-app` 或類似工具建立 (目前看來是這樣)。

2.  **移除 Bootstrap**

    - 在確認所有相關元件都已遷移至 Tailwind CSS 和 Radix UI 後，從專案中移除 Bootstrap。
    - 主要動作：從 `ChallengeMode.js` (或其他全域引入點) 移除 `import 'bootstrap/dist/css/bootstrap.min.css';`。
    - 同時檢查 `public/index.html` 是否有 Bootstrap 的 CDN 連結，並移除。

    ```bash
    npm uninstall bootstrap # 如果是透過 npm 安裝的
    # yarn remove bootstrap # 如果是透過 yarn 安裝的
    ```

---

## 三、安裝與設定

### 1. 安裝 Tailwind CSS

依照官方流程執行：

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

修改 `tailwind.config.js`，確保 `content` 路徑涵蓋所有相關的 JS/JSX 檔案：

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // 涵蓋 src 下所有相關檔案
    './public/index.html'
  ],
  theme: {
    extend: {
      // 在此處定義手繪風格所需的自訂字體、顏色、邊框圖片等
      fontFamily: {
        game: ['"Comic Sans MS"', 'cursive', 'sans-serif'] // 範例遊戲字體
        // 可參考 StoryMode/font/ 目錄下的字體資源
      },
      colors: {
        'game-primary': '#f4d35e', // 範例主色
        'game-secondary': '#e07a5f', // 範例次色
        'game-dark': '#3d405b', // 範例深色
        'game-light': '#f4f1de' // 範例淺色
      },
      backgroundImage: {
        'panel-handdrawn': "url('/src/scenes/StoryMode/images/handdrawn-panel.png')", // 假設有此手繪面板素材
        'border-handdrawn': "url('/src/scenes/StoryMode/images/handdrawn-border.svg')" // 手繪邊框範例
      },
      // 若使用 tailwindcss-border-image 插件
      borderImageSource: (theme) => ({
        handdrawn: "url('/src/scenes/StoryMode/images/handdrawn-border-image.png')"
      })
    }
  },
  plugins: [
    // require('tailwindcss-border-image'), // 如果選擇使用此外掛
  ]
};
```

在 `src/index.css` (或專案的主要 CSS 檔案) 中引入 Tailwind 的基礎樣式：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 可在此處定義一些全域基礎樣式，例如預設字體、背景色 */
body {
  font-family: theme('fontFamily.game');
  background-color: theme('colors.game-dark');
  color: theme('colors.game-light');
}
```

### 2. 安裝 Radix Primitives

根據專案需求，我們預計會用到 Dialog (彈窗), Slider (滑塊), Switch (開關), Form (表單), NavigationMenu (導航菜單) 等。

```bash
npm install @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-form @radix-ui/react-navigation-menu
# yarn add @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-form @radix-ui/react-navigation-menu
```

Radix Primitives 提供低階、無樣式但可存取的元件，幫你處理 aria、focus 管理與鍵盤導覽等細節 ([Radix UI][1], [Radix UI][2])

### 3. (可選) 安裝 shadcn/ui

若想快速取得一套 Tailwind + Radix 範本，加速元件庫搭建：

```bash
npx shadcn-ui@latest init
```

這會引導你設定 `components.json` 並可選擇性地安裝一些基礎元件。

### 4. 安裝 Framer Motion

```bash
npm install framer-motion
# yarn add framer-motion
```

Framer Motion 是官方推薦的 React 動畫解決方案，具備硬體加速與 JS 動畫引擎混合優勢 ([Motion][5], [Medium][6])

---

## 四、Radix 元件整合 (以 `zombietype` 範例)

以下以 `StoryMode` 的 `StoryEndPopup` 和 `ChallengeMode` 的設定選項（假設未來會有）為例。

### 1. Dialog (彈窗) - 改造 `StoryEndPopup`

原 `StoryMode.js` 中的 `StoryEndPopup` 元件：

```jsx
// 原 StoryEndPopup (簡化示意)
// function StoryEndPopup({ isVisible, message, onConfirm }) {
//   if (!isVisible) return null;
//   return (
//     <div className="popup-overlay">
//       <div className="popup-content">
//         <p>{message}</p>
//         <button onClick={onConfirm}>Confirm</button>
//       </div>
//     </div>
//   );
// }
```

使用 Radix UI `Dialog` 改造後 (`src/scenes/StoryMode/component/StoryEndPopup.js`):

```jsx
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion'; // 用於動畫

export default function StoryEndPopup({ isVisible, message, onConfirm, storyId }) {
  return (
    <Dialog.Root
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) onConfirm(); /* 處理關閉 */
      }}
    >
      <AnimatePresence>
        {isVisible && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/70 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed top-1/2 left-1/2 w-[90vw] max-w-md bg-panel-handdrawn bg-cover bg-center p-6 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 border-4 border-game-primary" // Tailwind classes + 自訂背景
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Dialog.Title className="text-2xl font-bold text-game-primary mb-4 text-center filter drop-shadow-md">
                  {message || 'Story Ended'}
                </Dialog.Title>
                {/* 可以加入故事統計等 */}
                <Dialog.Close asChild>
                  <motion.button
                    className="mt-6 w-full bg-game-secondary text-game-light font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-game-primary focus:ring-offset-2 focus:ring-offset-panel-handdrawn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      localStorage.removeItem(`storyProgress_${storyId}`); // 保持原有邏輯
                      onConfirm();
                    }}
                  >
                    Back to Menu
                  </motion.button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
```

Radix 的 `<Dialog>` 處理焦點鎖定與無障礙，Tailwind CSS 負責手繪風格的樣式，Framer Motion 增加開啟/關閉動畫。

### 2. Slider & Switch (音量與設定) - 應用於 `Options.js`

假設 `src/scenes/Option/Option.js` 未來需要音量控制和自動播放開關。

```jsx
// src/scenes/Option/Option.js (部分示意)
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import { useVolumeControl } from '../../context/GameSettingsContext'; // 假設音量存在 context
import { useState } from 'react'; // 新增 useState

function Options({ onBack }) {
  const { volume, setVolume } = useVolumeControl(); // 假設的音量 context
  const [isAutoPlay, setIsAutoPlay] = useState(false); // 假設的自動播放狀態

  return (
    <div className="p-8 bg-game-dark min-h-screen flex flex-col items-center">
      <h1 className="text-4xl text-game-primary font-bold mb-8 filter drop-shadow-lg">OPTIONS</h1>

      {/* 音量控制 */}
      <div className="w-full max-w-xs mb-8">
        <label
          htmlFor="volume-slider"
          className="block text-lg text-game-light mb-2"
        >
          Volume
        </label>
        <Slider.Root
          id="volume-slider"
          className="relative flex items-center w-full h-8 touch-none select-none group"
          value={[volume * 100]} // Radix Slider 通常用 0-100
          onValueChange={([val]) => setVolume(val / 100)}
          max={100}
          step={1}
        >
          <Slider.Track className="bg-game-light/30 relative flex-1 h-3 rounded-full group-hover:h-4 transition-all">
            <Slider.Range className="absolute bg-game-secondary h-full rounded-full group-hover:bg-yellow-400 transition-colors" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-6 h-6 bg-game-primary rounded-full border-2 border-game-light shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-game-dark group-hover:scale-110 transition-transform"
            aria-label="Volume"
          />
        </Slider.Root>
      </div>

      {/* 自動播放開關 */}
      <div className="flex items-center justify-between w-full max-w-xs mb-8">
        <label
          htmlFor="autoplay-switch"
          className="text-lg text-game-light"
        >
          Auto-Play Dialogue
        </label>
        <Switch.Root
          id="autoplay-switch"
          checked={isAutoPlay}
          onCheckedChange={setIsAutoPlay}
          className="w-14 h-7 bg-game-light/30 rounded-full relative data-[state=checked]:bg-game-secondary outline-none cursor-pointer transition-colors group"
        >
          <Switch.Thumb className="block w-5 h-5 bg-game-light rounded-full shadow-lg transform transition-transform translate-x-1 data-[state=checked]:translate-x-[1.6rem] group-hover:scale-110" />
        </Switch.Root>
      </div>

      <button
        onClick={onBack}
        className="mt-auto bg-game-primary text-game-dark font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        Back
      </button>
    </div>
  );
}
```

Radix 的 `<Slider>` 和 `<Switch>` 提供完整的互動邏輯，Tailwind CSS 負責色彩、尺寸與手繪風格，並可搭配 Framer Motion 增強 Thumb 的動畫。

---

## 五、Tailwind CSS 自訂樣式 (以 `zombietype` 範例)

### 1. 手繪邊框與貼圖

- **邊框圖片**:

  - 使用 CSS `border-image`。可以在 `tailwind.config.js` 中定義 utility，或直接在元件上使用 `style` 屬性。
  - 或者使用 [tailwindcss-border-image](https://github.com/sebagnz/tailwindcss-border-image) 插件。
  - 範例 (`tailwind.config.js` 已提及 `borderImageSource`):
    ```jsx
    // 在元件中使用
    // <div className="border-8 border-image-handdrawn border-image-slice-[...] border-image-outset-[...]">...</div>
    // 或直接 style (更靈活控制 slice, width, outset, repeat)
    <div
      style={{
        borderImageSource: "url('/path/to/your-hand-drawn-border.png')",
        borderImageSlice: '30 30 30 30 fill', // 根據圖片調整
        borderImageWidth: '20px',
        borderImageOutset: '0px',
        borderStyle: 'solid',
        borderWidth: '20px' // 必須設定 borderWidth 讓 border-image 生效
        // backgroundClip: "padding-box" // 避免背景與邊框圖片重疊
      }}
      className="p-4 bg-panel-handdrawn" // 假設面板背景
    >
      Content inside hand-drawn border
    </div>
    ```

- **背景貼圖**: 在 `tailwind.config.js` 的 `theme.extend.backgroundImage` 中註冊，如前述 `panel-handdrawn`。

  - 應用於 `ChallengeMode.js` 的主要容器或 `StoryMode.js` 的對話框：
    ```jsx
    // <div className="bg-panel-handdrawn bg-no-repeat bg-cover ...">
    ```

- **按鈕樣式**: 替換 `App.js` 中的 `btn-danger` 等。
  ```jsx
  // 原 <button className="btn btn-danger ...">CHALLENGE MODE</button>
  // 新
  <button
    className="my-2 px-6 py-3 fs-4 font-bold rounded-lg text-game-light bg-game-secondary border-2 border-game-primary shadow-md hover:bg-red-700 hover:border-yellow-400 transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
    // style={{ borderImage: "url(...) ...", /* 如果按鈕也用邊框圖片 */ }}
  >
    CHALLENGE MODE
  </button>
  ```

### 2. 主題與字體

- 在 `tailwind.config.js` 中定義 `fontFamily` 和 `colors`，如前述範例。
- 使用 `src/scenes/StoryMode/font/` 下的字體，確保已透過 `@font-face` 在 `src/index.css` 中引入。

  ```css
  /* src/index.css */
  @font-face {
    font-family: 'YourGameFont'; /* 與 tailwind.config.js 中 game: ['YourGameFont'] 對應 */
    src:
      url('./scenes/StoryMode/font/your-game-font.woff2') format('woff2'),
      url('./scenes/StoryMode/font/your-game-font.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  body {
    font-family: theme('fontFamily.game'); /* 應用預設遊戲字體 */
    /* ... */
  }
  ```

---

## 六、Framer Motion 動畫強化 (以 `zombietype` 範例)

### 1. 基本設定

將 HTML 元素或 Radix 元件的 `asChild` prop 與 `motion` 結合。

```jsx
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';

// 一般 HTML 元素
const MotionButton = motion.button;
const MotionDiv = motion.div;

// Radix 元件 (使用 asChild)
// <Dialog.Overlay asChild>
//   <motion.div ... />
// </Dialog.Overlay>
```

### 2. 實作互動動畫 - `ChallengeMode.js` 殭屍

原 `ChallengeMode.js` 中殭屍圖片的縮放是通過 `style={{ transform: \`scale(...)\`, transition: ... }}` 實現的。
可以改用 Framer Motion 以獲得更平滑和可控的動畫。

```jsx
// ChallengeMode.js (部分示意)
import { motion } from 'framer-motion';

// ...
const currentChargeRate = zombieManager.getCurrentChargeRate(); // 0 to 1

// ...
<MotionDiv // 取代原本的 div
  className="position-relative d-flex justify-content-center align-items-center my-4" // 保留或轉換為 Tailwind
  animate={{ scale: 1 + currentChargeRate * 0.5 }} // 根據充電率放大，例如從 1 倍到 1.5 倍
  transition={{ type: 'spring', stiffness: 200, damping: 15 }} // 彈簧動畫
>
  <motion.img
    key={zombieManager.getCurrentZombieImage()} // 當圖片更換時觸發動畫
    src={zombieManager.getCurrentZombieImage()}
    alt="Zombie"
    className="img-fluid rounded-circle border border-warning bg-light p-3 shadow-lg" // 保留或轉換為 Tailwind
    style={{ width: '250px', height: '250px' }}
    initial={{ opacity: 0, y: 50, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -50, scale: 0.8 }} // 如果有殭屍切換的出場動畫
    transition={{ duration: 0.5 }}
  />
</MotionDiv>;
```

### 3. 按鈕動畫 - `App.js` 主選單按鈕

```jsx
// src/scenes/MainMenu/App.js (部分示意)
// ...
<motion.button
  className="btn-story-mode my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3" // 轉換為 Tailwind
  onClick={() => setCurrentScreen('storyMenu')}
  whileHover={{ scale: 1.1, rotate: -2 }} // 懸停時放大並輕微旋轉
  whileTap={{ scale: 0.9, rotate: 2 }} // 點擊時縮小並反向旋轉
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  STORY MODE
</motion.button>
```

### 4. `StoryMode.js` 文字打字機效果與場景過渡

- **文字打字機**: `useTypingEffect` hook 可以考慮使用 Framer Motion 的 `animate` 功能配合 `staggerChildren` 來實現更細緻的文字動畫。
- **場景/角色圖片過渡**: 當 `currentScene.image` 或 `currentScene.dialogue` 改變時，使用 `AnimatePresence` 和 `motion` 元件的 `initial`, `animate`, `exit` props 來實現平滑的淡入淡出或滑動效果。

```jsx
// StoryMode.js (示意角色圖片過渡)
import { motion, AnimatePresence } from 'framer-motion';

// ...
<div className="ratio-container">
  <AnimatePresence mode="wait">
    {' '}
    {/* mode="wait" 確保舊元件先出場動畫完畢 */}
    <motion.img
      key={currentScene.id} // 當 currentScene 改變時，key 會改變，觸發動畫
      src={currentScene.image}
      alt={currentScene.character}
      className="character" // 你現有的樣式
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    />
  </AnimatePresence>
  {/* ... 其他 Navbar, DialogueBox 等 */}
</div>;
```

---

## 七、小結與後續優化

1.  **無障礙測試**：利用 [axe](https://www.deque.com/axe/) 或 [Lighthouse](https://developers.google.com/web/tools/lighthouse) 驗證 Radix UI 元件與自訂元件是否符合 a11y 標準。
2.  **效能監控**：檢查 Framer Motion 動畫與圖片大小，避免過度渲染，特別是在移動設備上。
3.  **主題切換**：`tailwind.config.js` 中定義的 CSS 變數或 Tailwind 的主題功能可以進一步用於實現動態主題切換。
4.  **組件庫發佈**：若專案成熟，可利用 Storybook 撰寫文件並考慮將常用的手繪風格元件抽象出來，方便複用。shadcn/ui 的架構也利於建立和維護自訂元件。
5.  **逐步遷移**: 建議從一個影響範圍較小的模式（如主選單 `App.js` 的按鈕）或一個獨立元件（如 `StoryEndPopup.js`）開始遷移，逐步擴展到 `ChallengeMode.js` 和 `StoryMode.js` 的其他部分。

透過上述步驟，`zombietype` 專案即可在既有 DOM 架構中，捨棄 Bootstrap，使用 Radix UI + Tailwind CSS + Framer Motion，打造出如同手繪插畫般生動且具現代化互動體驗的遊戲介面。

[1]: https://www.radix-ui.com/primitives/docs/overview/introduction?utm_source=chatgpt.com 'Introduction – Radix Primitives - Radix UI'
[2]: https://www.radix-ui.com/primitives/docs/overview/accessibility?utm_source=chatgpt.com 'Accessibility – Radix Primitives'
[3]: https://tailwindcss.com/docs/adding-custom-styles?utm_source=chatgpt.com 'Adding custom styles - Core concepts - Tailwind CSS'
[4]: https://v3.tailwindcss.com/docs/adding-custom-styles?utm_source=chatgpt.com 'Adding Custom Styles - Tailwind CSS'
[5]: https://motion.dev/docs/react-quick-start?utm_source=chatgpt.com 'Get started with Motion for React'
[6]: https://medium.com/%40sanksiddharth/animating-your-web-pages-a-beginners-guide-with-framer-motion-5de404cd25df?utm_source=chatgpt.com "Animating Your Web Pages: A Beginner's Guide with Framer Motion"
[7]: https://ui.shadcn.com/docs/installation/manual?utm_source=chatgpt.com 'Manual Installation - Shadcn UI'
[8]: https://medium.com/%40fthiagorodrigues10/level-up-your-ui-game-combining-radix-ui-primitives-with-tailwind-css-8f6d91b044eb?utm_source=chatgpt.com 'Combining Radix UI Primitives with Tailwind CSS | by ... - Medium'
[9]: https://www.radix-ui.com/primitives/docs/components/slider?utm_source=chatgpt.com 'Slider – Radix Primitives'
[10]: https://github.com/sebagnz/tailwindcss-border-image?utm_source=chatgpt.com 'A plugin for tailwind css that adds border-image utilities - GitHub'
[11]: https://www.youtube.com/watch?pp=0gcJCdgAo7VqN5tD&v=inkIfPtmE9s&utm_source=chatgpt.com '3 Tricks For Amazing Button Animations (Framer Tutorial) - YouTube'
[12]: https://www.youtube.com/watch?v=_HrxDnK3Qiw&utm_source=chatgpt.com 'Framer Tutorial: Animate Buttons Like a Pro - YouTube'
[13]: https://ui.shadcn.com/?utm_source=chatgpt.com 'Build your component library - shadcn/ui'
