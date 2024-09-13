

export default function ViewStudySets({studySets}) {
    console.log(studySets);
    if (studySets === null) {
        console.log("List blank, doing nothing");
        return <></>
    }
    console.log(studySets.map(studySet => {
        return studySet.id;
    }))
    const displayedStudySets = studySets.map(studySet => {
        return <li key={studySet.id} className="set-display-overview">
            <h3>Title: {studySet.title}</h3> 
            <h5>Number of flashcards: {studySet.cardIds.length}</h5>
        </li>
    });
    return <ul className="sets-list">
        {displayedStudySets}
    </ul>
}