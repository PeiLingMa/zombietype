import './Question.css';

export default function Question({ currentScene, onChoiceSelect, questionText }) {
  return (
    <div className="question-box">
      <h3>{currentScene.character}</h3>
      <p className="question-content">{questionText}</p>
      <div className="choices-container">
        {currentScene.choices.map((choice, index) => (
          <button
            key={index}
            className="choice-button"
            onClick={() => onChoiceSelect(choice)} // 點擊選項時呼叫 onChoiceSelect，並傳遞選項物件
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
