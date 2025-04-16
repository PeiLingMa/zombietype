import { render, screen } from '@testing-library/react';
import App from './App';
import { GameSettingsProvider } from '../../context/GameSettingsContext';

test('renders main menu title', () => {
  render(
    <GameSettingsProvider>
      <App />
    </GameSettingsProvider>
  );
  const titleElement = screen.getByText(/Monster Typing Game/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders game mode buttons', () => {
  render(
    <GameSettingsProvider>
      <App />
    </GameSettingsProvider>
  );
  
  const storyModeButton = screen.getByText(/STORY MODE/i);
  const challengeModeButton = screen.getByText(/CHALLENGE MODE/i);
  const optionsButton = screen.getByText(/OPTIONS/i);
  
  expect(storyModeButton).toBeInTheDocument();
  expect(challengeModeButton).toBeInTheDocument();
  expect(optionsButton).toBeInTheDocument();
});
