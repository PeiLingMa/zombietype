import Anna from './images/story1/Anna.png';
import Anna_ball from './images/story1/Anna_with_ball.png';
import Anna_question from './images/story1/Anna_question.png';
import Anna_surprised from './images/story1/Anna_suprised.png';
import Anna_happy from './images/story1/Anna_happy.png';
import Ben from './images/story1/Ben.png';
import Ben_Dog from './images/story1/Ben_with_dog.png';
import Ben_question from './images/story1/Ben_question.png';
import Ben_question2 from './images/story1/Ben_question2.png';

const sceneData_A1_A2 = [
  {
    id: 0,
    character: 'Anna',
    image: Anna,
    dialogue: "Hello Ben! It's a nice day today."
  },
  {
    id: 1,
    character: 'Ben',
    image: Ben_Dog,
    dialogue: 'Hi Anna! Yes, it is. Look at my new pet.'
  },
  {
    id: 2,
    character: 'Anna',
    image: Anna_surprised,
    dialogue: 'Oh! Is it a cat?'
  },
  {
    id: 3,
    character: 'Ben',
    image: Ben_Dog,
    dialogue: "No, it's a dog. He is very friendly."
  },
  {
    id: 4,
    character: 'Anna',
    image: Anna_happy,
    dialogue: 'He looks happy. What is his name?'
  },
  {
    id: 5,
    character: 'Ben',
    image: Ben,
    dialogue: 'His name is Max. He likes to play.'
  },
  // --- Question 1 ---
  {
    id: 6,
    type: 'question',
    character: 'Anna',
    image: Anna_question,
    dialogue: "You said it's not a cat. What kind of pet is Max?",
    answer: { text: 'dog', correctIndex: 7, incorrectIndex: 99 }
  },
  {
    id: 7,
    character: 'Ben',
    image: Ben_question2,
    dialogue: "That's right! He is a dog. Do you have a pet?"
  },
  {
    id: 8,
    character: 'Anna',
    image: Anna_ball,
    dialogue: "No, I don't have a pet. But I have a red ball. We can play."
  },
  {
    id: 9,
    character: 'Ben',
    image: Ben,
    dialogue: 'Great idea! Max loves balls.'
  },
  {
    id: 10,
    character: 'Anna',
    image: Anna_happy,
    dialogue: "Nice to hear that!"
  },
  // --- Question 2 ---
  {
    id: 11,
    type: 'question',
    character: 'Ben',
    image: Ben_question,
    dialogue: 'You have a ball for us to play with. What color is your ball?',
    answer: { text: 'red', correctIndex: 12, incorrectIndex: 99 }
  },
  {
    id: 12,
    character: 'Anna',
    image: Anna_ball,
    dialogue: "Yes, it's red! Let's go to the park."
  },
  {
    id: 13,
    character: 'Ben',
    image: Ben_question2,
    dialogue: 'Okay. Is the park far from here?'
  },
  {
    id: 14,
    character: 'Anna',
    image: Anna_surprised,
    dialogue: "No, it's near. We can walk."
  },
  {
    id: 15,
    character: 'Ben',
    image: Ben,
    dialogue: 'Perfect. Walking is good exercise.'
  },
  {
    id: 16,
    character: 'Anna',
    image: Anna_happy,
    dialogue: 'I agree. Max will like the park too.'
  },
  // --- Question 3 ---
  {
    id: 17,
    type: 'question',
    character: 'Ben',
    image: Ben_question,
    dialogue: "You mentioned the park isn't far. How close is it?",
    answer: { text: 'near', correctIndex: 18, incorrectIndex: 99 }
  },
  {
    id: 18,
    character: 'Anna',
    image: Anna_happy,
    dialogue: "Yes, very near. Let's go!"
  },
  {
    id: 19,
    type: 'correctED',
    character: 'Ben',
    image: Ben,
    dialogue: "Great! Let's head over there."
  },

  // --- Wrong Answer Scene ---
  {
    id: 99,
    type: 'wrongED',
    character: 'Anna',
    image: Anna_question,
    dialogue: "Hmm, that's not quite right. Let's think about what we just talked about."
  }
];

export default sceneData_A1_A2;
