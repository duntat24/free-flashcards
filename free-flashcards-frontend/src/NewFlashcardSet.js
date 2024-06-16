import AddFlashcardButton from './AddFlashcardButton.js';
import NewFlashcard from './NewFlashcard.js';
import SaveNewSetButton from './SaveNewSetButton.js';
import { useState } from 'react';

export default function NewFlashcardSet({addFlashcardSet}) {
    const [cards, updateCards] = useState([]);
    // this contains the id of the card that will be created next - this id will likely be changed when the card is saved on the backend
    const [nextCardId, updateNextCardId] = useState(0);
    const [setTitle, updateSetTitle] = useState("");
    // this indicates whether this component is fully visible or if only an 'expand' button is visible
    const [isCollapsed, setIsCollapsed] = useState(false);

    function addCard() { // this adds a blank card to the newly created set
        updateCards([...cards, {id: nextCardId, prompt: "", response: ""}]);
        updateNextCardId(nextCardId + 1);
    }
    function removeCard(removedId) {
        updateCards(cards.filter(card => card.id !== removedId)); // finding and removing the card with the specified id
    }
    function updateCard(newPrompt, newResponse, cardId) { // this is used to update cards when the user edits a prompt or response
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
        updateSetTitle(""); // clear the set title to make it easier for the user
    }

    // the LI is not part of the NewFlashcard component because react doesn't recognize that the key is there if it's inside the card map
    let cardList = cards.map(card => (
        <li key={card.id} className="new-flashcard"> 
            <NewFlashcard
                card={card}
                removeCard={removeCard}
                updateCard={updateCard}
            />
        </li>
    ));
    // this content will be displayed if the clicks 'expand' on the expand button
    let expandedContent = <>
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
    </>
    return <div className="new-flashcard-set">
        {isCollapsed? null : expandedContent}
        <button className="collapse-new-set-button" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? "Expand":"Collapse"}</button>
    </div>
}