import NewFlashcardSet from './NewFlashcardSet.js';
import SetsDisplay from './SetsDisplay.js';
import './FreeFlashcards.css';
import { useState } from 'react';

export default function FlashcardApp() {
  // all the sets of cards a user has access to, this should fetch any user data on application startup
  const [flashcardSets, updateFlashcardSets] = useState([]);
  // this is the next id that will be associated with a user-generated flashcard set. A set's id be updated on a call to the backend to ensure uniqueness
  const [nextId, setNextId] = useState(0);

  // adds the specified cards and title to the user's sets of flashcards
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
    <SetsDisplay
      flashcardSets={flashcardSets}
    />
  </div>
}

