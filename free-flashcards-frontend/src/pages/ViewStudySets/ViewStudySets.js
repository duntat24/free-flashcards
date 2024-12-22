import { Link } from 'react-router-dom';
import { useState } from 'react';
import { requestDeleteSet } from '../../requests';

// this component is displayed on the homepage and displays a list of the study sets that a user has
export default function ViewStudySets({studySets, setRequestStudySets, requestStudySets}) {
    const [deletePopupSet, setDeletePopupSet] = useState(null); // this stores the id and title of the set currently being considered for deletion (if null, the popup is not active) 

    if (studySets === null) {
        return <h2>Seems you don't have any study sets. Let's make some!</h2>
    }

    // this function deletes the set stored in deletePopupSet, alerts the user of the result, and closes the popup
    function deleteSet() {
        requestDeleteSet(deletePopupSet.id).then(() => {
            setRequestStudySets(!requestStudySets); // forcing the application to update its stored sets
            // TODO the above might be better accomplished by just directly removing the study set from the array, would reduce # of requests being made significantly
            alert("Set successfully deleted!");
            setDeletePopupSet(null);
        }
        ).catch((error) => {
            console.log(error);
            alert("Something went wrong. Please try again");
        })
        setDeletePopupSet(null);
    }

    // this contains the JSX to display a user's study sets
    const displayedStudySets = studySets.map(studySet => {
        return <li key={studySet.id} className="set-display-overview">
            <h3 className="set-display-title">Title: {studySet.title}</h3> 
            <h4 className="set-display-cardcount">Number of flashcards: {studySet.cardIds.length}</h4>
            <Link to={`/sets/${studySet.id}/study`} className="study-set-display-link">Study</Link><br/>
            <Link to={`/sets/${studySet.id}/quiz`} className="study-set-display-link">Quiz</Link><br/>
            <Link to={`/sets/${studySet.id}/edit`} className="study-set-display-link">Edit</Link><br/>
            <button onClick={() => setDeletePopupSet({id: studySet.id, title: studySet.title})} className="study-set-display-link delete-link">Delete Study Set</button><br/>
        </li>
    });

    // this contains the JSX to display the deleteSetPopup
    const deletePopup = deletePopupSet === null ? 
        <></> : 
        <div className="delete-popup-container">
            <div className="delete-popup-overlay"/>
            <div className="delete-popup-content">
                <h3 className="delete-popup-text">Are you sure you want to delete the set {deletePopupSet.title}?</h3>
                <button onClick={deleteSet} className="delete-popup-button">Yes</button>
                <button onClick={() => setDeletePopupSet(null)} className="delete-popup-button">No</button>
            </div>
        </div>
    
    return <>
        <ul className="sets-list">
            {displayedStudySets}
        </ul>
        {deletePopup}
    </>
}