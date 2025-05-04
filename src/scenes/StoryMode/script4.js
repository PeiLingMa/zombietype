// src/data/englishGivingScenesWithQuestions.js
// import '' from './images/feifei.png'; // Placeholder image for Feifei
// import '' from './images/beth.png'; // Placeholder image for Beth
// import '' from './images/system.png'; // Placeholder image for a generic system message

const sceneData_B1_B2 = [
  {
    id: 0,
    character: 'Liam',
    image: null,
    dialogue: 'Zoe, did you hear that the city is planning to **expand** the central library?'
  },
  {
    id: 1,
    character: 'Zoe',
    image: null,
    dialogue: 'Really? That’s exciting! It’s already quite big, though.'
  },
  {
    id: 2,
    character: 'Liam',
    image: null,
    dialogue:
      'Yes, but they want to add a new wing with more study rooms and a digital media center.'
  },
  {
    id: 3,
    character: 'Zoe',
    image: null,
    dialogue: 'That sounds useful. I often struggle to find a quiet space during exams.'
  },
  {
    id: 4,
    character: 'Liam',
    image: null,
    dialogue: 'Exactly. Plus, the project will create jobs and improve the neighborhood.'
  },
  {
    id: 5,
    character: 'Zoe',
    image: null,
    dialogue: 'Nice. I hope they also improve the lighting. It feels a bit dull in some corners.'
  },
  // --- Question 1 ---
  {
    id: 6,
    type: 'question',
    character: 'Zoe',
    image: null,
    dialogue: 'What is the city planning to do to the library?',
    answer: { text: 'expand', correctIndex: 7, incorrectIndex: 99 }
  },
  {
    id: 7,
    character: 'Liam',
    image: null,
    dialogue: "Yes! They're going to expand it and make it more comfortable for everyone."
  },
  {
    id: 8,
    character: 'Zoe',
    image: null,
    dialogue: 'I’d love a section with **quiet** places to study.'
  },
  {
    id: 9,
    character: 'Liam',
    image: null,
    dialogue: 'They mentioned something like that. A study zone with fewer distractions.'
  },
  {
    id: 10,
    character: 'Zoe',
    image: null,
    dialogue: 'That would be great. I have trouble concentrating when there’s noise.'
  },
  // --- Question 2 ---
  {
    id: 11,
    type: 'question',
    character: 'Liam',
    image: null,
    dialogue: 'What does Zoe want in the new library section?',
    answer: { text: 'quiet', correctIndex: 12, incorrectIndex: 99 }
  },
  {
    id: 12,
    character: 'Zoe',
    image: null,
    dialogue: 'Yes, quiet spaces are really important for studying!'
  },
  {
    id: 13,
    character: 'Liam',
    image: null,
    dialogue:
      'True. I sometimes **struggle** with motivation, but having a calm space really helps.'
  },
  {
    id: 14,
    character: 'Zoe',
    image: null,
    dialogue: 'You’re not alone! I struggle too, especially during long reading sessions.'
  },
  {
    id: 15,
    character: 'Liam',
    image: null,
    dialogue: "Well, let’s check it out together once it's ready. Could be our new weekend spot."
  },
  {
    id: 16,
    character: 'Zoe',
    image: null,
    dialogue: "I'd love that. We could **organize** a study group there."
  },
  // --- Question 3 ---
  {
    id: 17,
    type: 'question',
    character: 'Zoe',
    image: null,
    dialogue: 'What does Zoe want to do in the new library space?',
    answer: { text: 'organize', correctIndex: 18, incorrectIndex: 99 }
  },
  {
    id: 18,
    character: 'Liam',
    image: null,
    dialogue: 'Great idea. A study group could keep us motivated!'
  },
  {
    id: 19,
    type: 'correctED',
    character: 'Zoe',
    image: null,
    dialogue: 'Let’s do it. First meeting right after the renovation!'
  },
  {
    id: 99,
    type: 'wrongED',
    character: 'Liam',
    image: null,
    dialogue: 'Oops, not quite. Think again about what Zoe mentioned, alright?'
  }
];
export default sceneData_B1_B2; // Uncomment when using
