import Navbar from './Navbar.js';
import './FreeFlashcards.css';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import ViewStudySets from './pages/ViewStudySets/ViewStudySets.js';
import axios from 'axios';
import StudySetEditor from './pages/StudySetEditor/StudySetEditor.js';
import PracticeStudySet from './pages/PracticeStudySet/PracticeStudySet.js';
import QuizStudySet from './pages/QuizStudySet/QuizStudySet.js';
import CreateFlashcardSet from './pages/CreateStudySet/CreateStudySet.js';

export default function FlashcardApp() {
  
  const [studySets, setStudySets] = useState(null);
  // This state is changed when we need to request study sets from the API - any component that may make this necessary gets the setRequestStudySets method
  const [requestStudySets, setRequestStudySets] = useState(false);

  useEffect(() => {
    // once we're sending the react application from the server we will be able to dynamically determine this (avoids the app breaking if we switch to https or a new domain name)
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
  }, [requestStudySets]); // not sure the best way to accomplish this, we should be refreshing the application's study sets when we update the flashcards in a set by adding/editing/deleting them or adding/deleting sets

  // this holds the content on the page where users can study their created sets
  // needs a quiz mode to allow for free response as well as drawn & recorded responses

  // using ':<variable_name>' in routes allows us to have paths with variables (such as object ids that we will be fetching)
  return <div className="whole-page">
    <Navbar/>
    <Routes> 
      <Route path="/sets" element={<CreateFlashcardSet
                                    setRequestStudySets={setRequestStudySets}
                                    requestStudySets={requestStudySets}
                                  />}/>
      <Route path="/*" element={<ViewStudySets
                                studySets={studySets}  
                              />}/>
      <Route path="/sets/:id/edit" element={<StudySetEditor
                                              studySets={studySets}
                                              updateSet={setStudySets}
                                              setRequestStudySets={setRequestStudySets}
                                              requestStudySets={requestStudySets}
                                            />}/>
      <Route path="/sets/:id/study" element={<PracticeStudySet
                                              studySets={studySets}
                                            />}/>
      <Route path="/sets/:id/quiz" element={<QuizStudySet
                                              studySets={studySets}
                                            />}/>
    </Routes>
  </div>
}

