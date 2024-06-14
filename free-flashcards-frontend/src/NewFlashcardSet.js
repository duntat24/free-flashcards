import AddFlashcardButton from './AddFlashcardButton.js';
import NewFlashcard from './NewFlashcard.js';
import SaveNewSetButton from './SaveNewSetButton.js';
import { useState } from 'react';

export default function NewFlashcardSet({addFlashcardSet}) {
    const [cards, updateCards] = useState([]);
    const [nextCardId, updateNextCardId] = useState(0);
    const [setTitle, updateSetTitle] = useState("");

    function addCard() {
        updateCards([...cards, {id: nextCardId, prompt: "", response: ""}]);
        updateNextCardId(nextCardId + 1);
    }
    function removeCard(removedId) {
        updateCards(cards.filter(card => card.id !== removedId));
    }
    function updateCard(newPrompt, newResponse, cardId) {
        updateCards(cards.map(card => 
            card.id === cardId ? {id: cardId, prompt: newPrompt, response: newResponse}: card
        ));
    }
    function saveSet() {
        // add the set to the user's collection of sets - checks for invalid input should be done when attempting to add
            // the ids in the cards on the frontend aren't relevant and should be different once the backend is called 
            // (ensuring unique ids across all card sets is good)
        addFlashcardSet(cards, setTitle);
        updateCards([]); // clear the existing cards to make it simpler for the user to create another new set
        updateSetTitle("");
    }
    // seems this is causing an error because each element doesn't have a unique id
    let cardList = cards.map(card => (
        <li key={card.id} className="new-flashcard">
            <NewFlashcard
                card={card}
                removeCard={removeCard}
                updateCard={updateCard}
            />
        </li>
    ));
    return <div className="new-flashcard-set">
        <AddFlashcardButton
            addCard={addCard}
        />
        <SaveNewSetButton
            save={saveSet}
        /> <br/>
        <label htmlFor="set-title">Set Title:</label>
        <input type="text" name="set-title" id="set-title" value={setTitle} 
            onChange={(e) => updateSetTitle(e.target.value)}></input>
        <ul className="new-card-list">
            {cardList}
        </ul>
    </div>
}