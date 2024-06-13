import AddFlashcardButton from './AddFlashcardButton.js';
import NewFlashcard from './NewFlashcard.js';
import { useState } from 'react';

export default function FlashcardSet() {
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
    let cardList = cards.map(card => (
        <NewFlashcard
            card={card}
            removeCard={removeCard}
            updateCard={updateCard}
        />
    ));
    return <div className="new-flashcard-set">
        <AddFlashcardButton
            addCard={addCard}
        />
        {cardList}
    </div>
}