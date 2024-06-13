import AddFlashcardButton from './AddFlashcardButton.js';
import NewFlashcard from './NewFlashcard.js';
import SaveNewSetButton from './SaveNewSetButton.js';
import { useState } from 'react';

export default function NewFlashcardSet({addFlashcardSet}) {
    const [cards, updateCards] = useState([]);
    const [nextId, updateNextId] = useState(0);

    function addCard() {
        updateCards([...cards, {id: nextId, prompt: "", response: ""}]);
        updateNextId(nextId + 1);
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
        addFlashcardSet(cards);
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
        />
        <ul className="new-card-list">
            {cardList}
        </ul>
    </div>
}