import { useState } from 'react';
import ChallengeMode from '../ChallengeMode/ChallengeMode';
import StoryMode from '../StoryMode/StoryMode';
import StoryMenu from '../StoryMode/StoryMenu';
import Options from '../Option/Option';

import './App.css';

// Import button images
import storyModeNormal from './assets/images/buttons/story-mode-normal.png';
import storyModeHover from './assets/images/buttons/story-mode-hover.png';
import challengeModeNormal from './assets/images/buttons/challenge-mode-normal.png';
import challengeModeHover from './assets/images/buttons/challenge-mode-hover.png';
import optionsNormal from './assets/images/buttons/options-normal.png';
import optionsHover from './assets/images/buttons/options-hover.png';
import tutorialNormal from './assets/images/buttons/tutorial-normal.png';
import tutorialHover from './assets/images/buttons/tutorial-hover.png';
import creditsNormal from './assets/images/buttons/credits-normal.png';
import creditsHover from './assets/images/buttons/credits-hover.png';
import zombieTypeLogo from './assets/images/logo/zombietype-logo.png';

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

  // Handler for tutorial button (placeholder functionality)
  const handleTutorial = () => {
    // TODO: Implement tutorial functionality in the future
    console.log('Tutorial functionality to be implemented');
  };

  // Handler for credits button (placeholder functionality)
  const handleCredits = () => {
    // TODO: Implement credits functionality in the future
    console.log('Credits functionality to be implemented');
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
    <div className="main-menu">
      {/* ZombieType Logo */}
      <div className="logo-container">
        <img
          src={zombieTypeLogo}
          alt="ZombieType"
          className="zombietype-logo"
        />
      </div>

      {/* Menu Buttons */}
      <div className="menu-buttons">
        <button
          className="menu-button story-mode-button"
          onClick={() => setCurrentScreen('storyMenu')}
        >
          <img
            src={storyModeNormal}
            alt="Story Mode"
            className="button-normal"
          />
          <img
            src={storyModeHover}
            alt="Story Mode"
            className="button-hover"
          />
        </button>

        <button
          className="menu-button challenge-mode-button"
          onClick={() => setCurrentScreen('challenge')}
        >
          <img
            src={challengeModeNormal}
            alt="Challenge Mode"
            className="button-normal"
          />
          <img
            src={challengeModeHover}
            alt="Challenge Mode"
            className="button-hover"
          />
        </button>

        <button
          className="menu-button options-button"
          onClick={() => setCurrentScreen('settings')}
        >
          <img
            src={optionsNormal}
            alt="Options"
            className="button-normal"
          />
          <img
            src={optionsHover}
            alt="Options"
            className="button-hover"
          />
        </button>

        <button
          className="menu-button tutorial-button"
          onClick={handleTutorial}
        >
          <img
            src={tutorialNormal}
            alt="Tutorial"
            className="button-normal"
          />
          <img
            src={tutorialHover}
            alt="Tutorial"
            className="button-hover"
          />
        </button>

        <button
          className="menu-button credits-button"
          onClick={handleCredits}
        >
          <img
            src={creditsNormal}
            alt="Credits"
            className="button-normal"
          />
          <img
            src={creditsHover}
            alt="Credits"
            className="button-hover"
          />
        </button>
      </div>
    </div>
  );
}
