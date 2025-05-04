// src/data/englishGivingScenesWithQuestions.js
// import '' from './images/feifei.png'; // Placeholder image for Feifei
// import '' from './images/beth.png'; // Placeholder image for Beth
// import '' from './images/system.png'; // Placeholder image for a generic system message

const sceneData_C1_C2 = [
  {
    id: 0,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'Julian, this project presents a significant **setback**.' // Changed word
  },
  {
    id: 1,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue: 'Indeed, Elara. The prerequisites for success feel quite daunting.'
  },
  {
    id: 2,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'The potential negative ramifications are considerable.'
  },
  {
    id: 3,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue: 'And the tight schedule only exacerbates the situation.'
  },
  // --- Question 1 ---
  {
    id: 4,
    type: 'question',
    character: 'Julian', // Julian asks
    image: null, // Replace with julianImage if available
    dialogue:
      'You mentioned the project presents something significant. What is this event called that hinders progress or reverses previous gains?', // Adjusted question
    answer: { text: 'setback', correctIndex: 5, incorrectIndex: 99 } // Changed answer
  },
  {
    id: 5,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue:
      'Precisely, a setback. The detrimental effect on our resource allocation is already apparent.' // Continues after Q1 correct
  },
  {
    id: 6,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue: 'Stakeholder apprehension certainly makes things more complex.'
  },
  {
    id: 7,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'We absolutely must leverage our core strengths with precision.'
  },
  {
    id: 8,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue: 'Any misstep now could jeopardize the entire initiative.'
  },
  {
    id: 9,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'A proactive, not reactive, strategy is imperative.'
  },
  {
    id: 10,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue: 'Agreed. Risk mitigation must be **paramount** in our initial planning.'
  },
  // --- Question 2 ---
  {
    id: 11,
    type: 'question',
    character: 'Elara', // Elara asks
    image: null, // Replace with elaraImage if available
    dialogue:
      'You stressed the importance of risk mitigation. What word describes its level of importance, meaning more important than anything else?',
    answer: { text: 'paramount', correctIndex: 12, incorrectIndex: 99 }
  },
  {
    id: 12,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue:
      'Correct, paramount importance. Internal discord at this stage would prove truly catastrophic.' // Continues after Q2 correct
  },
  {
    id: 13,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'Absolutely. Building team consensus is our immediate priority.'
  },
  {
    id: 14,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue: 'Divided effort would undermine everything we hope to achieve.'
  },
  {
    id: 15,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'Unity and clear communication are vital at this critical juncture.'
  },
  {
    id: 16,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue:
      'That said, the established **paradigm** for our project management might need adjustment.'
  },
  {
    id: 17,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'Are you suggesting a fundamental shift in our usual approach?'
  },
  {
    id: 18,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue: 'It warrants serious consideration if we aim for optimal results.'
  },
  {
    id: 19,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'Sometimes departure from convention is necessary for breakthrough.'
  },
  // --- Question 3 ---
  {
    id: 20,
    type: 'question',
    character: 'Julian', // Julian asks
    image: null, // Replace with julianImage if available
    dialogue:
      'You mentioned the established model or pattern we follow might need adjustment. What is that model or typical example called?',
    answer: { text: 'paradigm', correctIndex: 21, incorrectIndex: 99 }
  },
  {
    id: 21,
    character: 'Elara',
    image: null, // Replace with elaraImage if available
    dialogue: 'Yes, the existing paradigm. A complete overhaul still seems quite drastic, though.' // Continues after Q3 correct
  },
  {
    id: 22,
    character: 'Julian',
    image: null, // Replace with julianImage if available
    dialogue:
      "Perhaps targeted refinement is the more prudent approach. Let's convene tomorrow to decide." // Story ends here
  },
  // --- correctED Feedback (after last question flow completes) ---
  {
    id: 23, // Renumbered ID
    type: 'correctED',
    character: 'Elara', // Can be Elara or Julian
    image: null, // Placeholder image for feedback
    dialogue: 'Good. We are aligned on the key issues. Preparation for tomorrow is crucial.' // Generic positive feedback
  },
  // --- Wrong Answer Scene ---
  {
    id: 99,
    type: 'wrongED',
    character: 'Julian', // Can be Elara or Julian
    image: null, // Placeholder image for feedback
    dialogue: "Hmm, that interpretation isn't quite accurate. Let's review the previous point."
    // nextIndex is omitted, assuming UI handles retry logic back to the question.
  }
];

export default sceneData_C1_C2; // Uncomment when using in a real project

// 單字
// A1 A2
// dog red near
// B1 B2 !!
// expand quiet organize
// C1 C2 !!
// setback paramount paradigm
