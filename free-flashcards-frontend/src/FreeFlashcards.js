import NewFlashcardSet from './pages/CreateStudySet/CreateStudySet.js';
import FileUploader from './FileUploader.js';
import Navbar from './Navbar.js';
import './FreeFlashcards.css';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import ViewStudySets from './pages/ViewStudySets/ViewStudySets.js';
import axios from 'axios';
import StudySetEditor from './pages/StudySetEditor/StudySetEditor.js';
import PracticeStudySet from './pages/PracticeStudySet/PracticeStudySet.js';
import QuizStudySet from './pages/QuizStudySet/QuizStudySet.js';

export default function FlashcardApp() {
  
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

        /*

          TODO: Proper error handling based on responses (likely 404, 500, timed out, refused)

        */

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
      <Route path="/*" element={<ViewStudySets
                                studySets={studySets}  
                              />}/>
      <Route path="/sets/:id/edit" element={<StudySetEditor
                                              studySets={studySets}
                                              updateSet={setStudySets}
                                            />}/>
      <Route path="/sets/:id/study" element={<PracticeStudySet
                                              studySets={studySets}
                                            />}/>
      <Route path="/sets/:id/quiz" element={<QuizStudySet
                                              studySets={studySets}
                                            />}/>
    </Routes>
    <FileUploader/>
  </div>
}

