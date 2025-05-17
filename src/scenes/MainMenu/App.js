import { useState } from 'react';
import ChallengeMode from '../ChallengeMode/ChallengeMode';
import StoryMode from '../StoryMode/StoryMode';
import StoryMenu from '../StoryMode/StoryMenu';
import Options from '../Option/Option';

import './App.css';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedStoryId, setSelectedStoryId] = useState(null); // State to hold selected story ID
  const [selectedStoryScenes, setSelectedStoryScenes] = useState(null); // State to hold selected story scenes

  const handleStorySelect = (storyId, scenes) => {
    setSelectedStoryId(storyId); // Store the selected story ID
    setSelectedStoryScenes(scenes); // Store the selected story scenes
    setCurrentScreen('story'); // Navigate to StoryMode (or adjust as needed)
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setSelectedStoryScenes(null); // Clear selected scenes when going back to menu
  };

  const handleBackToStoryMenu = () => {
    setCurrentScreen('storyMenu'); // Go back to StoryMenu
    setSelectedStoryScenes(null); // Clear selected scenes
  };

  if (currentScreen !== 'menu') {
    const Component =
      currentScreen === 'story'
        ? StoryMode
        : currentScreen === 'challenge'
          ? ChallengeMode
          : currentScreen === 'storyMenu'
            ? StoryMenu
            : Options;

    if (currentScreen === 'story' && selectedStoryScenes) {
      return (
        <StoryMode
          storyId={selectedStoryId ?? 'story3'} // Pass the selected story ID as prop
          scenes={selectedStoryScenes} // Pass the selected story scenes as prop
          onBack={handleBackToStoryMenu} // Use handleBackToStoryMenu to go back to StoryMenu
        />
      );
    } else if (currentScreen === 'storyMenu') {
      return (
        <StoryMenu
          onStorySelect={handleStorySelect} // Pass the handleStorySelect function as prop
          onBack={handleBackToMenu} // Keep onBack to go back to main menu
        />
      );
    }

    return <Component onBack={handleBackToMenu} />; // Use handleBackToMenu for other components
  }

  return (
    <div className="main-menu d-flex flex-column align-items-center justify-content-center">
      <h1 className="display-3 mb-4">Monster Typing Game</h1>
      <p className="lead mb-5 fw-bold">- Choose your mode -</p>
      <div className="menu-buttons">
        <button
          className="btn-story-mode my-2 px-4 py-3 fs-4 fw-bold btn-lg mb-3"
          onClick={() => setCurrentScreen('storyMenu')}
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
