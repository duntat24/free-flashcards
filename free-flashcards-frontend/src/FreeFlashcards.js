import NewFlashcardSet from './pages/CreateStudySet/NewFlashcardSet.js';
import FileUploader from './FileUploader.js';
import Navbar from './Navbar.js';
import './FreeFlashcards.css';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import ViewStudySets from './pages/StudySetView/ViewStudySets.js';
import axios from 'axios';

export default function FlashcardApp() {
  // all the sets of cards a user has access to, this should fetch any user data on application startup
  const [flashcardSets, updateFlashcardSets] = useState([]);
  // this is the next id that will be associated with a user-generated flashcard set. A set's id be updated on a call to the backend to ensure uniqueness
  const [nextId, setNextId] = useState(0);
  // this contains the set currently being studied. If it is null, then we are in the set creation page
  // this may need to be updated to allow for 3 or more pages to be displayed on the application
  const [studiedSet, setStudiedSet] = useState(null);
  const [studySets, setStudySets] = useState(null);

  useEffect(() => {
    // once we're sending this application from our API we will be able to dynamically determine this (avoids the app breaking if we switch to https or a new domain name)
    const flashcardsUrl = `http://localhost:3001/sets`;  
    axios.get(flashcardsUrl).then((response) => {
      
      const fetchedStudySets = response.data.study_sets;
      setStudySets(fetchedStudySets.map(studySet => {
        return {id: studySet._id, cardIds: studySet.cards, title: studySet.title}
      }))
    }).catch((error) => {

    });
  }, []); // may not be correct to have the dependency array be empty, we should be refreshing this when we make a new PUT/POST request

  /*let setCreationView = <> // extracting this into another component
    <NewFlashcardSet
      addFlashcardSet={addFlashcardSet}
    />
    <SetsDisplay
      flashcardSets={flashcardSets}
      setStudiedSet={setStudiedSet}
      deleteFlashcardSet={deleteFlashcardSet}
    />
  </>*/
  // this holds the content on the page where users can study their created sets
  // needs a quiz mode to allow for free response as well as drawn & recorded responses
  /*let studyView = <> // this should be extracted into its own component with a route
    <StudyFlashcards
      setStudiedSet={setStudiedSet}
      studiedSet={studiedSet}
    />
  </>*/
  // using :<variable_name> allows us to have paths with variables (such as object ids that we will be fetching)
  return <div className="whole-page">
    <Navbar/>
    <Routes> 
      <Route path="/sets" element={<NewFlashcardSet/>}/>
      <Route path="/" element={<ViewStudySets
                                studySets={studySets}  
                              />}/>
    </Routes>
    <FileUploader/>
  </div>
}

