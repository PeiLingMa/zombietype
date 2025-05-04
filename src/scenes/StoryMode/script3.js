// src/data/englishGivingScenesWithQuestions.js
// import '' from './images/feifei.png'; // Placeholder image for Feifei
// import '' from './images/beth.png'; // Placeholder image for Beth
// import '' from './images/system.png'; // Placeholder image for a generic system message

const sceneData_A1_A2 = [
  {
    id: 0,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: "Hello Ben! It's a nice day today."
  },
  {
    id: 1,
    character: 'Ben',
    image: null, // Replace with benImage if available
    dialogue: 'Hi Anna! Yes, it is. Look at my new pet.'
  },
  {
    id: 2,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: 'Oh! Is it a cat?'
  },
  {
    id: 3,
    character: 'Ben',
    image: null, // Replace with benImage if available
    dialogue: "No, it's a **dog**. He is very friendly."
  },
  {
    id: 4,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: 'He looks happy. What is his name?'
  },
  {
    id: 5,
    character: 'Ben',
    image: null, // Replace with benImage if available
    dialogue: 'His name is Max. He likes to play.'
  },
  // --- Question 1 ---
  {
    id: 6,
    type: 'question',
    character: 'Anna', // Anna asks the question
    image: null, // Replace with annaImage if available
    dialogue: "You said it's not a cat. What kind of pet is Max?",
    answer: { text: 'dog', correctIndex: 7, incorrectIndex: 99 }
  },
  {
    id: 7,
    character: 'Ben',
    image: null, // Replace with benImage if available
    dialogue: "That's right! He is a dog. Do you have a pet?"
  },
  {
    id: 8,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: "No, I don't have a pet. But I have a **red** ball. We can play."
  },
  {
    id: 9,
    character: 'Ben',
    image: null, // Replace with benImage if available
    dialogue: 'Great idea! Max loves balls. Does he run fast?'
  },
  {
    id: 10,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: 'Yes, he can run very fast!'
  },
  // --- Question 2 ---
  {
    id: 11,
    type: 'question',
    character: 'Ben', // Ben asks the question
    image: null, // Replace with benImage if available
    dialogue: 'You have a ball for us to play with. What color is your ball?',
    answer: { text: 'red', correctIndex: 12, incorrectIndex: 99 }
  },
  {
    id: 12,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: "Yes, it's red! Let's go to the park."
  },
  {
    id: 13,
    character: 'Ben',
    image: null, // Replace with benImage if available
    dialogue: 'Okay. Is the park far from here?'
  },
  {
    id: 14,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: "No, it's **near**. We can walk."
  },
  {
    id: 15,
    character: 'Ben',
    image: null, // Replace with benImage if available
    dialogue: 'Perfect. Walking is good exercise.'
  },
  {
    id: 16,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: 'I agree. Max will like the park too.'
  },
  // --- Question 3 ---
  {
    id: 17,
    type: 'question',
    character: 'Ben', // Ben asks the question
    image: null, // Replace with benImage if available
    dialogue: "You mentioned the park isn't far. How close is it?",
    answer: { text: 'near', correctIndex: 18, incorrectIndex: 99 }
  },
  {
    id: 18,
    character: 'Anna',
    image: null, // Replace with annaImage if available
    dialogue: "Yes, very near. Let's go!"
  },
  {
    id: 19,
    type: 'correctED', // Feedback scene (can be attributed to the next speaker or a generic character)
    character: 'Ben',
    image: null, // Replace with benImage if available
    dialogue: "Great! Let's head over there."
  },

  // --- Wrong Answer Scene ---
  {
    id: 99,
    type: 'wrongED',
    character: 'Anna', // Can be Anna or Ben
    image: null, // Placeholder image for feedback
    dialogue: "Hmm, that's not quite right. Let's think about what we just talked about."
    // nextIndex is omitted, assuming UI handles retry logic back to the question.
  }
];

export default sceneData_A1_A2; // Uncomment when using in a real project
