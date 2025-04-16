import { useState } from 'react';
import ChallengeMode from '../ChallengeMode/ChallengeMode';
import StoryMode from '../StoryMode/StoryMode';
import Options from '../Option/Option';
import './App.css';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');

  if (currentScreen !== 'menu') {
    const Component =
      currentScreen === 'story'
        ? StoryMode
        : currentScreen === 'challenge'
          ? ChallengeMode
          : Options;
    return <Component onBack={() => setCurrentScreen('menu')} />;
  }

  return (
    <div className="main-menu d-flex flex-column align-items-center justify-content-center">
      <h1 className="display-3 mb-4">Monster Typing Game</h1>
      <p className="lead mb-5 fw-bold">- Choose your mode -</p>
      <div className="menu-buttons">
        <button
          className="btn btn-warning my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3"
          onClick={() => setCurrentScreen('story')}
        >
          STORY MODE
        </button>
        <button
          className="btn btn-danger my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3"
          onClick={() => setCurrentScreen('challenge')}
        >
          CHALLENGE MODE
        </button>
        <button
          className="btn btn-info my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3"
          onClick={() => setCurrentScreen('settings')}
        >
          OPTIONS
        </button>
      </div>
    </div>
  );
}
