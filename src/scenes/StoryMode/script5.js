import Elara from './images/story3/Elara.png';
import Elara_dis from './images/story3/Elara_dis.png';
import Elara_think from './images/story3/Elara_think.png';
import Elara_question from './images/story3/Elara_question.png';
import Julian from './images/story3/Julian.png';
import Julian_dis from './images/story3/Julian_dis.png';
import Julian_speak from './images/story3/Julian_speak.png';
import Julian_question from './images/story3/Julian_question.png';
import Julian_disagree from './images/story3/Julian_disagree.png';


const sceneData_C1_C2 = [
  {
    id: 0,
    character: 'Elara',
    image: Elara_dis,
    dialogue: 'Julian, this project presents a significant setback.'
  },
  {
    id: 1,
    character: 'Julian',
    image: Julian_dis,
    dialogue: 'Indeed, Elara. The prerequisites for success feel quite daunting.'
  },
  {
    id: 2,
    character: 'Elara',
    image: Elara_dis,
    dialogue: 'The potential negative ramifications are considerable.'
  },
  {
    id: 3,
    character: 'Julian',
    image: Julian_dis,
    dialogue: 'And the tight schedule only exacerbates the situation.'
  },
  // --- Question 1 ---
  {
    id: 4,
    type: 'question',
    character: 'Julian',
    image: Julian_question,
    dialogue:
      'You mentioned the project presents something significant. What is this event called that hinders progress or reverses previous gains?', // Adjusted question
    answer: { text: 'setback', correctIndex: 5, incorrectIndex: 99 }
  },
  {
    id: 5,
    character: 'Elara',
    image: Elara_dis,
    dialogue:
      'Precisely, a setback. The detrimental effect on our resource allocation is already apparent.' // Continues after Q1 correct
  },
  {
    id: 6,
    character: 'Julian',
    image: Julian_dis,
    dialogue: 'Stakeholder apprehension certainly makes things more complex.'
  },
  {
    id: 7,
    character: 'Elara',
    image: Elara_think,
    dialogue: 'We absolutely must leverage our core strengths with precision.'
  },
  {
    id: 8,
    character: 'Julian',
    image: Julian_speak,
    dialogue: 'Any misstep now could jeopardize the entire initiative.'
  },
  {
    id: 9,
    character: 'Elara',
    image: Elara_dis,
    dialogue: 'A proactive, not reactive, strategy is imperative.'
  },
  {
    id: 10,
    character: 'Julian',
    image: Julian,
    dialogue: 'Agreed. Risk mitigation must be paramount in our initial planning.'
  },
  // --- Question 2 ---
  {
    id: 11,
    type: 'question',
    character: 'Elara',
    image: Elara_question,
    dialogue:
      'You stressed the importance of risk mitigation. What word describes its level of importance, meaning more important than anything else?',
    answer: { text: 'paramount', correctIndex: 12, incorrectIndex: 99 }
  },
  {
    id: 12,
    character: 'Julian',
    image: Julian_speak,
    dialogue:
      'Correct, paramount importance. Internal discord at this stage would prove truly catastrophic.' // Continues after Q2 correct
  },
  {
    id: 13,
    character: 'Elara',
    image: Elara,
    dialogue: 'Absolutely. Building team consensus is our immediate priority.'
  },
  {
    id: 14,
    character: 'Julian',
    image: Julian_speak,
    dialogue: 'Divided effort would undermine everything we hope to achieve.'
  },
  {
    id: 15,
    character: 'Elara',
    image: Elara_question,
    dialogue: 'Unity and clear communication are vital at this critical juncture.'
  },
  {
    id: 16,
    character: 'Julian',
    image: Julian_question,
    dialogue:
      'That said, the established paradigm for our project management might need adjustment.'
  },
  {
    id: 17,
    character: 'Elara',
    image: Elara_think,
    dialogue: 'Are you suggesting a fundamental shift in our usual approach?'
  },
  {
    id: 18,
    character: 'Julian',
    image: Julian,
    dialogue: 'It warrants serious consideration if we aim for optimal results.'
  },
  {
    id: 19,
    character: 'Elara',
    image: Elara_dis,
    dialogue: 'Sometimes departure from convention is necessary for breakthrough.'
  },
  // --- Question 3 ---
  {
    id: 20,
    type: 'question',
    character: 'Julian',
    image: Julian_question,
    dialogue:
      'You mentioned the established model or pattern we follow might need adjustment. What is that model or typical example called?',
    answer: { text: 'paradigm', correctIndex: 21, incorrectIndex: 99 }
  },
  {
    id: 21,
    character: 'Elara',
    image: Elara_dis,
    dialogue: 'Yes, the existing paradigm. A complete overhaul still seems quite drastic, though.' // Continues after Q3 correct
  },
  {
    id: 22,
    character: 'Julian',
    image: Julian,
    dialogue:
      "Perhaps targeted refinement is the more prudent approach. Let's convene tomorrow to decide." // Story ends here
  },
  // --- correctED Feedback (after last question flow completes) ---
  {
    id: 23,
    type: 'correctED',
    character: 'Elara',
    image: Elara,
    dialogue: 'Good. We are aligned on the key issues. Preparation for tomorrow is crucial.' // Generic positive feedback
  },
  // --- Wrong Answer Scene ---
  {
    id: 99,
    type: 'wrongED',
    character: 'Julian',
    image: Julian_disagree,
    dialogue: "Hmm, that interpretation isn't quite accurate. Let's review the previous point."
  }
];

export default sceneData_C1_C2;

// 單字
// A1 A2
// dog red near
// B1 B2 !!
// expand quiet organize
// C1 C2 !!
// setback paramount paradigm
