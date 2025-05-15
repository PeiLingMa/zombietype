import Liam from './images/story2/Liam.png';
import Liam_speak from './images/story2/Liam_speak.png';
import Liam_agree from './images/story2/Liam_agree.png';
import Liam_question from './images/story2/Liam_question.png';
import Liam_question2 from './images/story2/Liam_question2.png';
import Zoe from './images/story2/Zoe.png';
import Zoe_speak from './images/story2/Zoe_speak.png';
import Zoe_agree from './images/story2/Zoe_agree.png';
import Zoe_question from './images/story2/Zoe_question.png';

const sceneData_B1_B2 = [
  {
    id: 0,
    character: 'Liam',
    image: Liam_speak,
    dialogue: 'Zoe, did you hear that the city is planning to expand the central library?'
  },
  {
    id: 1,
    character: 'Zoe',
    image: Zoe_speak,
    dialogue: 'Really? That’s exciting! It’s already quite big, though.'
  },
  {
    id: 2,
    character: 'Liam',
    image: Liam_speak,
    dialogue:
      'Yes, but they want to add a new wing with more study rooms and a digital media center.'
  },
  {
    id: 3,
    character: 'Zoe',
    image: Zoe_agree,
    dialogue: 'That sounds useful. I often struggle to find a quiet space during exams.'
  },
  {
    id: 4,
    character: 'Liam',
    image: Liam_agree,
    dialogue: 'Exactly. Plus, the project will create jobs and improve the neighborhood.'
  },
  {
    id: 5,
    character: 'Zoe',
    image: Zoe_agree,
    dialogue: 'Nice. I hope they also improve the lighting. It feels a bit dull in some corners.'
  },
  // --- Question 1 ---
  {
    id: 6,
    type: 'question',
    character: 'Zoe',
    image: Zoe_question,
    dialogue: 'What is the city planning to do to the library?',
    answer: { text: 'expand', correctIndex: 7, incorrectIndex: 99 }
  },
  {
    id: 7,
    character: 'Liam',
    image: Liam_agree,
    dialogue: "Yes! They're going to expand it and make it more comfortable for everyone."
  },
  {
    id: 8,
    character: 'Zoe',
    image: Zoe,
    dialogue: 'I’d love a section with quiet places to study.'
  },
  {
    id: 9,
    character: 'Liam',
    image: Liam,
    dialogue: 'They mentioned something like that. A study zone with fewer distractions.'
  },
  {
    id: 10,
    character: 'Zoe',
    image: Zoe_agree,
    dialogue: 'That would be great. I have trouble concentrating when there’s noise.'
  },
  // --- Question 2 ---
  {
    id: 11,
    type: 'question',
    character: 'Liam',
    image: Liam_question,
    dialogue: 'What does Zoe want in the new library section?',
    answer: { text: 'quiet', correctIndex: 12, incorrectIndex: 99 }
  },
  {
    id: 12,
    character: 'Zoe',
    image: Zoe_agree,
    dialogue: 'Yes, quiet spaces are really important for studying!'
  },
  {
    id: 13,
    character: 'Liam',
    image: Liam_speak,
    dialogue:
      'True. I sometimes struggle with motivation, but having a calm space really helps.'
  },
  {
    id: 14,
    character: 'Zoe',
    image: Zoe_agree,
    dialogue: 'You’re not alone! I struggle too, especially during long reading sessions.'
  },
  {
    id: 15,
    character: 'Liam',
    image: Liam,
    dialogue: "Well, let’s check it out together once it's ready. Could be our new weekend spot."
  },
  {
    id: 16,
    character: 'Zoe',
    image: Zoe,
    dialogue: "I'd love that. We could organize a study group there."
  },
  // --- Question 3 ---
  {
    id: 17,
    type: 'question',
    character: 'Zoe',
    image: Zoe_question,
    dialogue: 'What does Zoe want to do in the new library space?',
    answer: { text: 'organize', correctIndex: 18, incorrectIndex: 99 }
  },
  {
    id: 18,
    character: 'Liam',
    image: Liam_agree,
    dialogue: 'Great idea. A study group could keep us motivated!'
  },
  {
    id: 19,
    type: 'correctED',
    character: 'Zoe',
    image: Zoe_speak,
    dialogue: 'Let’s do it. First meeting right after the renovation!'
  },
  {
    id: 99,
    type: 'wrongED',
    character: 'Liam',
    image: Liam_question2,
    dialogue: 'Oops, not quite. Think again about what Zoe mentioned, alright?'
  }
];
export default sceneData_B1_B2;
