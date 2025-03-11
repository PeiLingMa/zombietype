import json

from typing import List

RUN = True
WORDS_DIR = "./public"

def parse_input():
    topic = input("topic (type `_exit` to exit the program) >>> ").strip().lower()
    if topic == "_exit":
        exit()

    diff = input("difficulty >>> ").strip().lower()
    if diff not in ["beginner", "medium", "hard"]:
        print(f"\033[1mE: Not valid level name received ({diff}). Please try again.\033[0m")
        return
    
    words = input("words >>> ").split(',')
    words = [w.strip() for w in words]

    wordList = []
    for i in range(0, len(words), 2):
        wordList.append({ "word": words[i], "translation": words[i+1] })

    store_2_json(topic, diff, wordList)

def store_2_json(topic: str, difficulty: str, words:List[dict[str, str]]):
    with open(WORDS_DIR + "/data.json", "r", encoding="utf-8") as jFile:
        word_d = json.load(jFile)

    topics = word_d["topics"]

    try:
        topic_d = topics[topic]
    except KeyError:
        topic_d = topics[topic] = {
            "beginner": [],
            "medium": [],
            "hard": []
        }

    print(topic_d)

    # wordList += words
    # print(wordList)
        
if __name__ == "__main__":
    while RUN:
        parse_input()