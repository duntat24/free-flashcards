import NewFlashcardSet from './NewFlashcardSet.js';
import './FreeFlashcards.css';
import { useState } from 'react';

export default function FlashcardApp() {
  const [flashcardSets, updateFlashcardSets] = useState([]);
  const [nextId, setNextId] = useState(0);

  function addFlashcardSet(addedSet, setTitle) {
    // will also need to add checks for empty flashcards and empty set
    if (addedSet.length !== 0) { // avoiding adding an empty set, this will also need to be checked on the server side since client side js can be inspect-elemented
      updateFlashcardSets([...flashcardSets, {id: nextId, title: setTitle, cards: addedSet}]);
      setNextId(nextId + 1);
    }
    console.log("Title: " + setTitle + ". Set: " + addedSet);
    for (let i = 0; i < flashcardSets.length; i++) {
      console.log(flashcardSets[i]);
    }
  }
  
  return <div className="whole-page">
    <NewFlashcardSet
      addFlashcardSet={addFlashcardSet}
    />
  </div>
}

