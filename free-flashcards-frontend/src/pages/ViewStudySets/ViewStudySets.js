import { Link } from 'react-router-dom';

export default function ViewStudySets({studySets}) {
    if (studySets === null) {
        return <h2>Seems you don't have any study sets. Let's make some!</h2>
    }
    const displayedStudySets = studySets.map(studySet => {
        return <li key={studySet.id} className="set-display-overview">
            <h3 className="set-display-title">Title: {studySet.title}</h3> 
            <h4 className="set-display-cardcount">Number of flashcards: {studySet.cardIds.length}</h4>
            <Link to={`/sets/${studySet.id}/study`} className="study-set-display-link">Study</Link><br/>
            <Link to={`/sets/${studySet.id}/quiz`} className="study-set-display-link">Quiz</Link><br/>
        </li>
    });
    return <>
        <ul className="sets-list">
            {displayedStudySets}
        </ul>
    </>
}