import AddFlashcardButton from './AddFlashcardButton.js';
import NewFlashcard from './NewFlashcard.js';
import { useState } from 'react';

export default function FlashcardSet() {
    const [cards, updateCards] = useState([]);
    function addCard() {
        updateCards([...cards, {prompt: "", response: ""}])
    }
    function removeCard(removedIndex) {
        
    }
    function updateCard(newCard, index) {

    }
    let cardList = cards.map(card => (
        <NewFlashcard
            prompt={card.prompt}
            response={card.response}
        />
    ));
    return <div class="new-flashcard-set">
        <AddFlashcardButton
            addCard={addCard}
        />
        {cardList}
    </div>
}