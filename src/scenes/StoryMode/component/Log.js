import { useRef, useEffect } from 'react';
import './Log.css';

export default function Log({ dialogueHistory, onClose }) {
  const logContentRef = useRef(null);
  useEffect(() => {
    if (logContentRef.current) {
      logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
    }
  }, [dialogueHistory]);
  return (
    <div className="log-overlay">
      <div className="log-dialog">
        <div className="log-header">
          <h3>對話紀錄</h3>
          <button
            className="log-close-button"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <div
          className="log-content"
          ref={logContentRef}
        >
          {dialogueHistory?.map((item, index) => (
            <div
              key={index}
              className="log-item"
            >
              <p className="log-character">{item.character}:</p>
              <p className="log-dialogue">{item.dialogue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
