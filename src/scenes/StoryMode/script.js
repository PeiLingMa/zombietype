// src/data/scenes.js
import jokerImg from './images/joker.png';
import morganaImg from './images/morgana.png';

const sceneData = [
  {
    id: 0,
    character: 'Joker',
    image: jokerImg,
    dialogue:
      '我有個提議。我們來做一個小遊戲吧!這個遊戲叫做猜謎!我會給你一些提示，你要猜出我在想什麼。準備好了嗎?'
  },
  {
    id: 1,
    character: 'Morgana',
    image: morganaImg,
    dialogue: '喵?你想到什麼了嗎?'
  },
  {
    id: 2,
    character: 'Joker',
    image: jokerImg,
    dialogue: '第一個提示是... 它是圓形的。'
  },
  {
    id: 3,
    character: 'Morgana',
    image: morganaImg,
    dialogue: '圓形的... 難道是球?'
  },
  {
    id: 4,
    character: 'Joker',
    image: jokerImg,
    dialogue: '答對了一半。但還不完全是。'
  },
  {
    id: 5,
    character: 'Morgana',
    image: morganaImg,
    dialogue: '喵... 還有什麼是圓形的呢?'
  },
  {
    id: 6,
    type: 'question',
    character: 'Joker',
    image: jokerImg,
    dialogue: '那麼，最後一個提示。它是黃色的，而且早上會出現。你猜到是什麼了嗎？',
    // choices: [
    //   { text: 'sun', nextIndex: 7, isCorrect: true },
    // ],
    answer: { text: 'sun', correctIndex: 7, incorrectIndex: 8 }
  },
  {
    id: 7,
    type: 'correctED',
    character: 'Joker',
    image: jokerImg,
    dialogue: '恭喜答對了，遊戲結束。'
  },
  {
    id: 8,
    type: 'wrongED',
    character: 'Morgana',
    image: morganaImg,
    dialogue: '喵...好像不對呢，再猜一猜吧!'
  }
];

export default sceneData;
