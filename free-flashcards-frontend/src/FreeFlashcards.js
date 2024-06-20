import NewFlashcardSet from './NewFlashcardSet.js';
import SetsDisplay from './SetsDisplay.js';
import StudyFlashcards from './StudyFlashcards.js';
import './FreeFlashcards.css';
import { useState } from 'react';

export default function FlashcardApp() {
  // all the sets of cards a user has access to, this should fetch any user data on application startup
  const [flashcardSets, updateFlashcardSets] = useState([]);
  // this is the next id that will be associated with a user-generated flashcard set. A set's id be updated on a call to the backend to ensure uniqueness
  const [nextId, setNextId] = useState(0);
  // this contains the set currently being studied. If it is null, then we are in the set creation page
  // this may need to be updated to allow for 3 or more pages to be displayed on the application
  const [studiedSet, setStudiedSet] = useState(null);

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

  // deletes the set with the specified id
  function deleteFlashcardSet(deletedSetId) {
    updateFlashcardSets(flashcardSets.filter(set => set.id !== deletedSetId)); // including only the sets whose ids do not match the deleted id
  }

  // this holds the content on the page where users can create and browse their study sets
  // SetsDisplay needs a delete feature for sets
  let setCreationView = <>
    <NewFlashcardSet
      addFlashcardSet={addFlashcardSet}
    />
    <SetsDisplay
      flashcardSets={flashcardSets}
      setStudiedSet={setStudiedSet}
      deleteFlashcardSet={deleteFlashcardSet}
    />
  </>
  // this holds the content on the page where users can study their created sets
  // needs a quiz mode to allow for free response as well as drawn & recorded responses
  let studyView = <>
    <StudyFlashcards
      setStudiedSet={setStudiedSet}
      studiedSet={studiedSet}
    />
  </>
  return <div className="whole-page">
    {studiedSet === null ? setCreationView : studyView}
  </div>
}

