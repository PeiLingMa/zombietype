// src/data/englishGivingScenesWithQuestions.js
// import '' from './images/feifei.png'; // Placeholder image for Feifei
// import '' from './images/beth.png'; // Placeholder image for Beth
// import '' from './images/system.png'; // Placeholder image for a generic system message

const sceneData = [
  {
    id: 0,
    character: 'Feifei',
    image: null,
    dialogue:
      "Hello and welcome to The English We Speak, where we explain phrases used by fluent English speakers so that you can use them too. I'm Feifei, and I'm joined by Beth."
  },
  {
    id: 1,
    character: 'Beth',
    image: null,
    dialogue: "Hi Feifei. Your outfit is very colourful today. It's totally giving summer."
  },
  {
    id: 2,
    character: 'Feifei',
    image: null,
    dialogue:
      "'It's giving summer'? I keep hearing and seeing this phrase 'it's giving'. What does it mean?"
  },
  {
    id: 3,
    character: 'Beth',
    image: null,
    dialogue:
      "'It's giving' is a phrase we use when something reminds us of a particular style, mood or vibe, so your outfit is 'giving summer' because it has that summer kind of energy."
  },
  // --- Question 1: Check understanding of the core meaning ---
  {
    id: 4,
    type: 'question',
    character: 'System', // Or the character asking the question, e.g., Feifei or Beth
    image: null,
    dialogue:
      "Based on Beth's explanation, when do we use the phrase 'it's giving'? (Type one word: style, mood, or vibe)",
    answer: { text: 'style', correctIndex: 5, incorrectIndex: 99 } // Accept 'style', 'mood', or 'vibe' - needs logic outside this file to handle variations, but 'style' is the first listed.
    // Note: A real implementation would check for 'mood' or 'vibe' as correct too. Using 'style' as the representative correct text here.
  },
  {
    id: 5,
    character: 'Feifei',
    image: null,
    dialogue:
      "Ah, well, thank you, Beth. This is a slang phrase that's often used as a compliment or for giving praise. Beth, the cake you brought in is delicious, by the way. It's giving professional baker."
  },
  {
    id: 6,
    character: 'Beth',
    image: null,
    dialogue: "Thanks a lot! Feifei, can you give us another example of 'it's giving'?"
  },
  {
    id: 7,
    character: 'Feifei',
    image: null,
    dialogue:
      "Yes, I can. Have you seen Neil recently? He's got new glasses, new trainers, new haircut. His new look – it's giving sophistication."
  },
  // --- Question 2: Check recall of Feifei's examples ---
  {
    id: 8,
    type: 'question',
    character: 'System',
    image: null,
    dialogue:
      "Feifei gave two examples of 'it's giving'. What did she say Neil's new look was 'giving'?",
    answer: { text: 'sophistication', correctIndex: 9, incorrectIndex: 99 }
  },
  {
    id: 9,
    character: 'Beth',
    image: null,
    dialogue: 'Oh, yeah. Totally.'
  },
  {
    id: 10,
    character: 'Feifei',
    image: null,
    dialogue: "Let's hear some more examples of 'it's giving'."
  },
  {
    id: 11,
    character: 'Feifei', // Attributing examples to Feifei as she introduces them
    image: null,
    dialogue: "Example 1: She didn't congratulate me on my promotion. It's giving jealousy."
  },
  {
    id: 12,
    character: 'Feifei', // Attributing examples to Feifei
    image: null,
    dialogue: 'Example 2: Oh, have you heard that new song? It is giving 90s vibes – big time.'
  },
  {
    id: 13,
    character: 'Feifei', // Attributing examples to Feifei
    image: null,
    dialogue:
      "Example 3: This restaurant looks super fancy. Look at the tablecloths and candles. It's giving expensive."
  },
  // --- Question 3: Check understanding of one of the listed examples ---
  {
    id: 14,
    type: 'question',
    character: 'System',
    image: null,
    dialogue:
      "One example mentioned a feeling that someone's actions were 'giving'. What was that feeling? (Type the feeling)",
    answer: { text: 'jealousy', correctIndex: 15, incorrectIndex: 99 }
  },
  {
    id: 15,
    character: 'Beth',
    image: null,
    dialogue:
      "Now, 'it's giving' is really popular on social media, but I've seen it on adverts too. It's a slang phrase that's becoming part of general pop culture."
  },
  {
    id: 16,
    character: 'Feifei',
    image: null,
    dialogue:
      "And it's often used to add intensity or drama to what you're saying, and maybe to exaggerate. If a person is acting in a dramatic way, you could say 'they're giving main character energy'."
  },
  // --- Question 4: Check understanding of the intensity/drama usage ---
  {
    id: 17,
    type: 'question',
    character: 'System',
    image: null,
    dialogue:
      "Feifei mentioned 'they're giving main character energy'. What kind of behaviour does this phrase describe?",
    answer: { text: 'dramatic', correctIndex: 18, incorrectIndex: 99 } // Accept 'dramatic' or 'dramatic way' etc.
  },
  {
    id: 18,
    character: 'Beth',
    image: null,
    dialogue:
      "And that's all from us. We'll be back next time with another useful English phrase. See you soon!"
  },
  {
    id: 19,
    type: 'correctED',
    character: 'Feifei',
    image: null,
    dialogue: 'Bye-bye!'
  },

  // --- Wrong Answer Scene ---
  {
    id: 99, // Using a higher ID to separate it from the main flow
    type: 'wrongED',
    character: 'System',
    image: null, // Placeholder image for feedback
    dialogue: "That's not quite right. Let's review the lesson section where that was discussed."
    // This nextIndex points back to the first question, allowing the user to restart the quiz flow from the beginning.
    // In a real application, you might want to point back to the specific question they got wrong.
    // nextIndex: 4 // Points back to the first question (ID 4)
  }
];

export default sceneData;
