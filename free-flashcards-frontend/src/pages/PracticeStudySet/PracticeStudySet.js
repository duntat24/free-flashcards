import { useState } from 'react';

export default function StudyFlashcards({setStudiedSet, studiedSet}) {
    /*

        TODO: Will need to use the id route parameter that is provided to identify the correct study set from the list of sets

    */

    // this component will contain functionality to study user sets.
    // Functionality to be added: 'quiz mode' to allow for free response to prompts, as well as a mode to draw & record prompt responses
    
    // this holds the current card being studied
    const [currentCardIndex, setCurrentCardIndex] = useState(0); // a study set with no cards should never be saved, so this shouldn't cause an error
    // this boolean indicates whether the user is being prompted or seeing the card's answer
    const [onPromptSide, setOnPromptSide] = useState(true);
    
    function decreaseCardIndex() {
        if (currentCardIndex === 0) { // avoiding making the index negative
            setCurrentCardIndex(studiedSet.cards.length - 1); // going to the end of the set
        } else {
            setCurrentCardIndex(currentCardIndex - 1);
        }
    }
    function increaseCardIndex() {
        setCurrentCardIndex((currentCardIndex + 1) % studiedSet.cards.length); // wrapping back to 0
    }
    return <div className="study-page">
        <h1 className="set-title">Studying: {studiedSet.title}</h1>

        <div className="current-flashcard">
            <h2 className="flashcard-text">{onPromptSide ? studiedSet.cards[currentCardIndex].prompt : 
                studiedSet.cards[currentCardIndex].response}</h2>
            <button onClick={() => setOnPromptSide(!onPromptSide)} className="flip-flashcard">Flip</button>
        </div>
        
        <button onClick={decreaseCardIndex} className="flashcard-navigation">Back</button>
        <button onClick={increaseCardIndex} className="flashcard-navigation">Next</button>
        <br/>
        <button onClick={() => setStudiedSet(null)} className="stop-studying">Back</button>
    </div>
}