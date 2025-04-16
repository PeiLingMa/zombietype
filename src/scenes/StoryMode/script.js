// src/data/scenes.js
import jokerImg from './images/joker.png';
import morganaImg from './images/morgana.png';

const sceneData = [
  {
    character: 'Joker',
    image: jokerImg,
    dialogue:
      '我有個提議。我們來做一個小遊戲吧!這個遊戲叫做猜謎!我會給你一些提示，你要猜出我在想什麼。準備好了嗎?'
  },
  {
    character: 'Morgana',
    image: morganaImg,
    dialogue: '喵?你想到什麼了嗎?'
  },
  {
    character: 'Joker',
    image: jokerImg,
    dialogue: '第一個提示是... 它是圓形的。'
  },
  {
    character: 'Morgana',
    image: morganaImg,
    dialogue: '圓形的... 難道是球?'
  },
  {
    character: 'Joker',
    image: jokerImg,
    dialogue: '答對了一半。但還不完全是。'
  },
  {
    character: 'Morgana',
    image: morganaImg,
    dialogue: '喵... 還有什麼是圓形的呢?'
  },
  {
    type: 'question',
    character: 'Joker',
    image: jokerImg,
    dialogue: '那麼，最後一個提示。它是黃色的，而且早上會出現。你猜到是什麼了嗎？',
    choices: [{ text: '月亮' }, { text: '太陽' }, { text: '星星' }]
  },
  {
    character: 'Joker',
    image: jokerImg,
    dialogue: '答對了一半。但還不完全是。'
  },
  {
    character: 'Morgana',
    image: morganaImg,
    dialogue: '喵... 還有什麼是圓形的呢?'
  },
  {
    character: 'Morgana',
    image: morganaImg,
    dialogue: '喵?你想到什麼了嗎?'
  }
];

export default sceneData;
