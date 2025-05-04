import { useRef, useEffect, useMemo } from 'react'; // 引入 useMemo
import { GAME_CONFIG } from '../gameConfig';

const { SOUND_CONFIG } = GAME_CONFIG;

/**
 * Custom hook for managing game sound effects
 * @returns {Object} Sound manager functions
 */
export const useSound = () => {
  // 使用 useRef 來儲存 Audio 實例集合，確保它們在重新渲染時不會丟失
  const sounds = useRef({});
  // 使用 useMemo 來創建一個穩定的 soundManager 對象，包含所有的控制方法
  // 這樣 Hook 返回的對象實例就是穩定的，不會在每次渲染時都改變
  const soundManager = useMemo(() => {
    const manager = {
      _sounds: sounds, // 內部引用 ref
      _masterVolume: 1, // 內部記錄總音量

      /**
       * Play a sound effect
       * @param {string} soundKey - Key of the sound to play
       */
      playSound: function (soundKey) {
        const audio = this._sounds.current[soundKey];
        if (audio) {
          console.log(`嘗試播放聲音: ${soundKey}`);
          // 確保從頭播放，並處理 Promise
          audio.currentTime = 0;
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`聲音 [${soundKey}] 播放成功或已在播放`);
              })
              .catch((error) => {
                // 如果因為自動播放政策被阻擋，這裡會捕獲錯誤
                console.warn(`聲音 [${soundKey}] 播放失敗 (可能是自動播放政策):`, error);
                // 你可以在這裡添加使用者提示或 fallback 邏輯
              });
          } else {
            // 對於不返回 Promise 的舊版瀏覽器或實現
            console.log(`聲音 [${soundKey}] 呼叫 play() (不返回 Promise)`);
          }
        } else {
          console.warn(`聲音 [${soundKey}] 未找到或未載入`);
        }
      },

      /**
       * Stop a sound effect
       * @param {string} soundKey - Key of the sound to stop
       */
      stopSound: function (soundKey) {
        const audio = this._sounds.current[soundKey];
        if (audio && !audio.paused) {
          console.log(`嘗試停止聲音: ${soundKey}`);
          audio.pause();
          // 可選：重置播放時間
          // audio.currentTime = 0;
          console.log(`聲音 [${soundKey}] 已停止`);
        } else if (audio) {
          console.log(`聲音 [${soundKey}] 已暫停或未播放`);
        } else {
          console.warn(`聲音 [${soundKey}] 未找到或未載入`);
        }
      },

      /**
       * Set volume for a specific sound
       * @param {string} soundKey - Key of the sound
       * @param {number} volume - Volume level (0-1)
       */
      setVolume: function (soundKey, volume) {
        const audio = this._sounds.current[soundKey];
        if (audio) {
          audio.volume = Math.max(0, Math.min(1, volume));
          // console.log(`設定聲音 [${soundKey}] 音量為 ${audio.volume}`);
        } else {
          console.warn(`嘗試設定聲音 [${soundKey}] 音量，但未找到`);
        }
      },

      /**
       * Set volume for all sounds (master volume)
       * @param {number} volume - Volume level (0-1)
       */
      setMasterVolume: function (volume) {
        this._masterVolume = Math.max(0, Math.min(1, volume));
        console.log('設定總音量:', this._masterVolume);
        // 將總音量應用到所有音訊元素
        Object.values(this._sounds.current).forEach((audio) => {
          // 注意：這裡應該是 audio.volume = baseVolume * masterVolume
          // 但如果 SOUND_CONFIG.volume 已經是基礎音量，可以直接應用 masterVolume
          // 假設 SOUND_CONFIG.volume 已經考慮了原始音檔音量和基礎設定，
          // 這裡就直接用 masterVolume 覆蓋，這可能需要根據你的實際需求調整音量計算方式。
          // 例如： audio.volume = SOUND_CONFIG[findKeyByAudio(audio)].volume * this._masterVolume;
          // 但簡單起見，假設 setMasterVolume 直接控制最終音量：
          audio.volume = this._masterVolume;
        });
      },

      // 添加一個全局停止所有聲音的方法 (在 Hook 卸載時使用)
      stopAllSounds: function () {
        console.log('停止所有聲音');
        Object.values(this._sounds.current).forEach((audio) => {
          audio.pause();
          audio.src = ''; // 清空 src 幫助垃圾回收
        });
        this._sounds.current = {}; // 清空 ref 中的引用
      }
      // ... 你可以添加其他方法，例如 pauseSound, resumeSound 等
    };
    return manager;
  }, []); // useMemo 的依賴陣列為空，確保 soundManager 只創建一次

  // Preload all sound effects
  useEffect(() => {
    console.log('useSound preload effect running');
    // 清空舊的引用以防萬一 (雖然 useMemo 空依賴，這個 effect 只跑一次)
    sounds.current = {};

    // 遍歷配置載入音訊
    Object.entries(SOUND_CONFIG).forEach(([key, config]) => {
      // 重要的背景音樂可能需要特殊的 preloading 處理或確保 CORS 允許
      const audio = new Audio(process.env.PUBLIC_URL + `/sounds/${config.file}`);
      audio.volume = config.volume; // 載入時設定基礎音量
      audio.loop = key === 'background'; // 例如，背景音樂設定循環
      audio.preload = 'auto'; // 確保瀏覽器嘗試完全載入音檔
      audio.load(); // 觸發載入

      sounds.current[key] = audio;
    });

    // Hook 的 cleanup function：在 Hook 卸載時執行
    return () => {
      console.log('useSound cleanup effect running');
      // 呼叫 soundManager 實例上的 stopAllSounds 方法
      // 由於 soundManager 是穩定的，這裡可以安全呼叫
      if (soundManager && typeof soundManager.stopAllSounds === 'function') {
        soundManager.stopAllSounds();
      }
    };
  }, [soundManager]); // 依賴 soundManager 實例，確保 cleanup 關閉的是同一個管理器

  // Hook 返回穩定的 soundManager 對象
  return soundManager;
};
